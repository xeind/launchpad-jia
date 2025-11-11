import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const { email, interviewID } = await request.json();
  console.log("🔍 [API job-portal/fetch-interviews] Request params:", {
    email,
    interviewID,
  });
  const interviewModel = db.collection("interviews");

  // First, let's see what we have without status filter
  if (interviewID != "all") {
    const debugInterview = await interviewModel.findOne({
      email,
      interviewID,
    });
    console.log(
      "🔍 [DEBUG] Interview found (no status filter):",
      debugInterview
        ? {
            interviewID: debugInterview.interviewID,
            applicationStatus: debugInterview.applicationStatus,
            cvStatus: debugInterview.cvStatus,
          }
        : "NOT FOUND",
    );
  }

  const matchConditions: any = [{ email }];

  if (interviewID != "all") {
    matchConditions.push({ interviewID: interviewID });
  }

  matchConditions.push({
    applicationStatus: {
      $in: ["Ongoing", "Dropped", "Cancelled"],
    },
  });

  const interviews = await interviewModel
    .aggregate([
      { $match: { $and: matchConditions } },
      {
        $addFields: {
          debugCareerID: "$careerID",
          debugID: "$id",
          lookupField: { $ifNull: ["$careerID", "$id"] },
        },
      },
      {
        $lookup: {
          from: "careers",
          localField: "lookupField",
          foreignField: "id",
          as: "career",
        },
      },
      {
        $unwind: {
          path: "$career",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          let: { orgID: "$orgID" },
          pipeline: [
            {
              $addFields: {
                _id: { $toString: "$_id" },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$orgID"],
                },
              },
            },
          ],
          as: "organization",
        },
      },
      {
        $unwind: {
          path: "$organization",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: { $and: matchConditions } },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
    .toArray();

  console.log(
    "🔍 [API job-portal/fetch-interviews] Match conditions:",
    matchConditions,
  );
  console.log(
    "🔍 [API job-portal/fetch-interviews] Found interviews:",
    interviews.length,
  );
  if (interviews.length > 0) {
    console.log(
      "🔍 [API job-portal/fetch-interviews] First interview FULL:",
      JSON.stringify(interviews[0], null, 2),
    );
    console.log(
      "🔍 [API job-portal/fetch-interviews] First interview careerID:",
      interviews[0].careerID,
    );
    console.log(
      "🔍 [API job-portal/fetch-interviews] First interview id field:",
      interviews[0].id,
    );
  }

  if (interviewID != "all" && interviews.length == 0) {
    return NextResponse.json({
      error: "No application found for the given ID.",
    });
  }

  return NextResponse.json(interviews);
}
