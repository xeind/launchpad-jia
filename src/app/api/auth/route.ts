import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { name, email, image } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const { db } = await connectMongoDB();
    const admin = await db.collection("admins").findOne({ email: email });

    if (admin) {
      console.log(
        "🔍 AUTH DEBUG - Admin data:",
        JSON.stringify(admin, null, 2),
      );
    }

    if (admin) {
      await db.collection("admins").updateOne(
        { email: email },
        {
          $set: {
            name: name,
            image: image,
            lastSeen: new Date(),
          },
        },
      );

      return NextResponse.json({ ...admin, role: "admin" });
    } else {
      let applicant = await db
        .collection("applicants")
        .findOne({ email: email });

      if (applicant) {
        return NextResponse.json(applicant);
      }

      // Create new applicant if doesn't exist
      const newApplicant = {
        email: email,
        name: name,
        image: image,
        createdAt: new Date(),
        lastSeen: new Date(),
        role: "applicant",
      };

      await db.collection("applicants").insertOne(newApplicant);

      return NextResponse.json(newApplicant);
    }
  } catch (error) {
    console.error("Authentication error:", error);

    // Check if it's a MongoDB connection error
    const isMongoError =
      error.name === "MongoServerSelectionError" ||
      error.name === "MongoNetworkError";

    return NextResponse.json(
      {
        error: "Failed to authenticate user",
        message: isMongoError
          ? "Database connection error. Please check your network connection or contact support."
          : error.message || "An unexpected error occurred",
        type: isMongoError ? "DATABASE_ERROR" : "SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
