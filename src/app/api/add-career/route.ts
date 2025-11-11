import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import { sanitizeCareerData } from "@/lib/utils/sanitize";
import {
  verifyAuth,
  requireRole,
  requireOrgAccess,
} from "@/lib/auth/verifyAuth";

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if user has recruiter/admin role
    const hasRequiredRole = await requireRole(user, ["admin", "recruiter"]);
    if (!hasRequiredRole) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Only recruiters and admins can create careers.",
        },
        { status: 403 },
      );
    }

    let careerData = await request.json();

    // Sanitize all input data to prevent XSS attacks
    careerData = sanitizeCareerData(careerData);

    const {
      jobTitle,
      description,
      questions,
      lastEditedBy,
      createdBy,
      screeningSetting,
      orgID,
      requireVideo,
      location,
      workSetup,
      workSetupRemarks,
      status,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      // New fields from segmented form
      city,
      currency,
      teamMembers,
      cvScreeningSetting,
      cvSecretPrompt,
      preScreeningQuestions,
      aiInterviewScreeningSetting,
      aiInterviewSecretPrompt,
      aiInterviewQuestions,
      pipelineStages,
      isDraft,
      currentStep,
      completedSteps,
    } = careerData;

    // Check organization access (admins can access any org, others must match their org)
    const hasOrgAccess = await requireOrgAccess(user, orgID);
    if (!hasOrgAccess) {
      return NextResponse.json(
        {
          error:
            "Organization access denied. You can only create careers for your organization.",
        },
        { status: 403 },
      );
    }

    // Validate required fields
    if (!jobTitle || !description || !location || !workSetup) {
      return NextResponse.json(
        {
          error: "Job title, description, location and work setup are required",
        },
        { status: 400 },
      );
    }

    const { db } = await connectMongoDB();

    const orgDetails = await db
      .collection("organizations")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(orgID),
          },
        },
        {
          $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
              {
                $addFields: {
                  _id: { $toString: "$_id" },
                },
              },
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$planId"] },
                },
              },
            ],
            as: "plan",
          },
        },
        {
          $unwind: "$plan",
        },
      ])
      .toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const totalActiveCareers = await db
      .collection("careers")
      .countDocuments({ orgID, status: "active" });

    if (
      totalActiveCareers >=
      orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0)
    ) {
      return NextResponse.json(
        { error: "You have reached the maximum number of jobs for your plan" },
        { status: 400 },
      );
    }

    const career = {
      id: guid(),
      jobTitle,
      description,
      questions: questions || [], // Legacy field, kept for backward compatibility
      location: location || city, // Use city if location not provided
      city: city || location,
      workSetup,
      workSetupRemarks,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy,
      createdBy,
      status: status || "active",
      screeningSetting:
        screeningSetting || cvScreeningSetting || "Good Fit and above",
      orgID,
      requireVideo: requireVideo ?? false,
      lastActivityAt: new Date(),
      salaryNegotiable: salaryNegotiable ?? true,
      minimumSalary,
      maximumSalary,
      country: country || "Philippines",
      province,
      employmentType: employmentType || "Full-Time",
      currency: currency || "PHP",
      teamMembers: teamMembers || [],
      // New segmented form fields
      cvScreeningSetting:
        cvScreeningSetting || screeningSetting || "Good Fit and above",
      cvSecretPrompt: cvSecretPrompt || "",
      preScreeningQuestions: preScreeningQuestions || [],
      aiInterviewScreeningSetting:
        aiInterviewScreeningSetting ||
        cvScreeningSetting ||
        screeningSetting ||
        "Good Fit and above",
      aiInterviewSecretPrompt: aiInterviewSecretPrompt || "",
      aiInterviewQuestions: aiInterviewQuestions || {
        cvValidation: { questions: [], questionsToAsk: 0 },
        technical: { questions: [], questionsToAsk: 0 },
        behavioral: { questions: [], questionsToAsk: 0 },
        analytical: { questions: [], questionsToAsk: 0 },
        others: { questions: [], questionsToAsk: 0 },
      },
      pipelineStages: pipelineStages || [],
      isDraft: isDraft ?? false,
      currentStep: currentStep || "review",
      completedSteps: completedSteps || [],
    };

    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 },
    );
  }
}
