// TODO (Vince) - For Merging

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  const { db } = await connectMongoDB();
  const { email, interviewID } = await request.json();

  // If interviewID is provided, fetch specific interview with career details
  if (interviewID) {
    const interview = await db
      .collection("interviews")
      .aggregate([
        { $match: { email, interviewID } },
        {
          $lookup: {
            from: "careers",
            localField: "lookupField",
            foreignField: "id",
            as: "career",
          },
        },
        { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    return NextResponse.json(interview);
  }

  // Otherwise, return all interviews for the user with career data
  const interviews = await db
    .collection("interviews")
    .aggregate([
      { $match: { email } },
      {
        $lookup: {
          from: "careers",
          localField: "careerID",
          foreignField: "id",
          as: "career",
        },
      },
      { $unwind: { path: "$career", preserveNullAndEmptyArrays: true } },
      { $sort: { updatedAt: -1 } },
    ])
    .toArray();

  return NextResponse.json(interviews);
}
