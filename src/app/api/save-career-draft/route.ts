import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      careerId,
      formType,
      orgID,
      currentStep,
      completedSteps,
      visitedSteps,
      // Step 1: Career Details
      jobTitle,
      employmentType,
      workSetup,
      workSetupRemarks,
      country,
      province,
      city,
      minimumSalary,
      maximumSalary,
      salaryNegotiable,
      currency,
      description,
      teamMembers,
      // Step 2: CV Review
      cvScreeningSetting,
      cvSecretPrompt,
      preScreeningQuestions,
      // Step 3: AI Interview
      aiInterviewScreeningSetting,
      requireVideo,
      aiInterviewSecretPrompt,
      aiInterviewQuestions,
      // Step 4: Pipeline Stages
      pipelineStages,
      // User info
      user,
    } = body;

    const { db } = await connectMongoDB();

    // Auto-assign orgID from user's member record if not provided
    let finalOrgID = orgID;
    if (!finalOrgID && user?.email) {
      console.log("OrgID not provided, fetching from user email:", user.email);
      const member = await db.collection("members").findOne({ email: user.email });
      if (member?.orgID) {
        finalOrgID = member.orgID;
        console.log("Auto-assigned orgID from member record:", finalOrgID);
      } else {
        console.error("Could not find orgID for user:", user.email);
      }
    }

    // Validate required fields
    if (!finalOrgID) {
      console.error("Save career draft failed: orgID is missing and could not be auto-assigned");
      return NextResponse.json(
        { error: "Organization ID is required. Please ensure you are logged in." },
        { status: 400 }
      );
    }

    console.log("Saving career draft for orgID:", finalOrgID, "formType:", formType);

    const draftData = {
      jobTitle: jobTitle || "",
      employmentType: employmentType || "Full-Time",
      workSetup: workSetup || "",
      workSetupRemarks: workSetupRemarks || "",
      country: country || "Philippines",
      province: province || "",
      city: city || "",
      location: city || "", // For backward compatibility
      minimumSalary: minimumSalary || "",
      maximumSalary: maximumSalary || "",
      salaryNegotiable: salaryNegotiable ?? true,
      currency: currency || "PHP",
      description: description || "",
      teamMembers: teamMembers || [],
      cvScreeningSetting: cvScreeningSetting || "Good Fit and above",
      screeningSetting: cvScreeningSetting || "Good Fit and above", // For backward compatibility
      cvSecretPrompt: cvSecretPrompt || "",
      preScreeningQuestions: preScreeningQuestions || [],
      aiInterviewScreeningSetting: aiInterviewScreeningSetting || "Good Fit and above",
      requireVideo: requireVideo ?? false,
      aiInterviewSecretPrompt: aiInterviewSecretPrompt || "",
      aiInterviewQuestions: aiInterviewQuestions || {
        cvValidation: { questions: [], questionsToAsk: 0 },
        technical: { questions: [], questionsToAsk: 0 },
        behavioral: { questions: [], questionsToAsk: 0 },
        analytical: { questions: [], questionsToAsk: 0 },
        others: { questions: [], questionsToAsk: 0 },
      },
      // Legacy questions field for backward compatibility
      questions: aiInterviewQuestions
        ? [
            ...aiInterviewQuestions.cvValidation.questions,
            ...aiInterviewQuestions.technical.questions,
            ...aiInterviewQuestions.behavioral.questions,
            ...aiInterviewQuestions.analytical.questions,
            ...aiInterviewQuestions.others.questions,
          ]
        : [],
      pipelineStages: pipelineStages || [],
      currentStep: currentStep || "career-details",
      completedSteps: completedSteps || [],
      visitedSteps: visitedSteps || ["career-details"],
      isDraft: true,
      status: "draft",
      orgID: finalOrgID,
      updatedAt: new Date(),
      lastEditedBy: user?.email || "",
    };

    let result: any;

    if (formType === "edit" && careerId) {
      // Update existing draft
      result = await db.collection("careers").updateOne(
        { _id: new ObjectId(careerId) },
        {
          $set: draftData,
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "Career not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Draft saved successfully",
        careerId: careerId,
        lastSaved: new Date(),
      });
    } else {
      // Create new draft
      const newCareer = {
        ...draftData,
        id: guid(),
        createdAt: new Date(),
        createdBy: user?.email || "",
        lastActivityAt: new Date(),
      };

      const insertResult = await db.collection("careers").insertOne(newCareer);

      return NextResponse.json({
        message: "Draft created successfully",
        careerId: insertResult.insertedId.toString(),
        lastSaved: new Date(),
      });
    }
  } catch (error) {
    console.error("Error saving career draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
