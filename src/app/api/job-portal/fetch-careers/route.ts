import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { decodeHtmlEntities } from "@/lib/utils/sanitize";

/**
 * Decode HTML entities in career data for display
 */
function decodeCareerData(career: any) {
  if (!career) return career;

  const decoded = { ...career };

  // Decode pre-screening questions
  if (
    decoded.preScreeningQuestions &&
    Array.isArray(decoded.preScreeningQuestions)
  ) {
    decoded.preScreeningQuestions = decoded.preScreeningQuestions.map(
      (q: any) => ({
        ...q,
        question: decodeHtmlEntities(q.question || ""),
        options: q.options
          ? q.options.map((opt: string) => decodeHtmlEntities(opt || ""))
          : q.options,
      }),
    );
  }

  // Decode AI interview questions
  if (decoded.aiInterviewQuestions) {
    for (const category in decoded.aiInterviewQuestions) {
      if (decoded.aiInterviewQuestions[category]?.questions) {
        decoded.aiInterviewQuestions[category].questions =
          decoded.aiInterviewQuestions[category].questions.map((q: any) => ({
            ...q,
            text: decodeHtmlEntities(q.text || ""),
          }));
      }
    }
  }

  return decoded;
}

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const { jobID } = await request.json();
  const careerModel = db.collection("careers");
  const matchConditions: any = [{ status: "active" }];

  if (jobID != "all") {
    if (!ObjectId.isValid(jobID)) {
      return NextResponse.json({ error: "No job found for the given ID." });
    }

    matchConditions.push({ _id: new ObjectId(jobID) });
  }

  const careers = await careerModel
    .aggregate([
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

  if (jobID != "all" && careers.length == 0) {
    return NextResponse.json({ error: "No job found for the given ID." });
  }

  // Decode HTML entities in the career data before returning
  const decodedCareers = careers.map(decodeCareerData);

  return NextResponse.json(decodedCareers);
}
