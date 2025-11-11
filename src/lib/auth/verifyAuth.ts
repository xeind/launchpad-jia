import { NextRequest } from "next/server";
import backendAuthCheck from "@/lib/firebase/backendAuthCheck";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  role: string;
  orgID?: string;
}

export async function verifyAuth(
  request: NextRequest | Request,
): Promise<AuthenticatedUser | null> {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify Firebase token
    const decodedToken = await backendAuthCheck(idToken);
    if (
      !decodedToken ||
      (typeof decodedToken === "object" && "error" in decodedToken)
    ) {
      return null;
    }

    // Type assertion since we've checked it's not an error
    const token = decodedToken as {
      uid: string;
      email: string;
      [key: string]: any;
    };

    const { db } = await connectMongoDB();

    // Check if user is admin
    const admin = await db.collection("admins").findOne({ email: token.email });
    if (admin) {
      return {
        uid: token.uid,
        email: token.email,
        name: admin.name,
        role: "admin",
        orgID: admin.orgID,
      };
    }

    // Check if user is applicant
    const applicantUser = await db
      .collection("applicants")
      .findOne({ email: token.email });
    if (applicantUser) {
      return {
        uid: token.uid,
        email: token.email,
        name: applicantUser.name,
        role: "applicant",
      };
    }

    // User not found in any collection
    return null;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export async function requireRole(
  user: AuthenticatedUser | null,
  allowedRoles: string[],
): Promise<boolean> {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export async function requireOrgAccess(
  user: AuthenticatedUser | null,
  orgID: string,
): Promise<boolean> {
  if (!user) return false;
  // Admins can access any org, others must match their org
  return user.role === "admin" || user.orgID === orgID;
}
