import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    let requestData = await request.json();
    const { _id } = requestData;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { error: "Job Object ID is required" },
        { status: 400 },
      );
    }

    const { db } = await connectMongoDB();

    let dataUpdates = { ...requestData };

    delete dataUpdates._id;

    // Ensure backward compatibility for location/city field
    if (dataUpdates.city && !dataUpdates.location) {
      dataUpdates.location = dataUpdates.city;
    }
    if (dataUpdates.location && !dataUpdates.city) {
      dataUpdates.city = dataUpdates.location;
    }

    // Ensure backward compatibility for screening settings
    if (dataUpdates.cvScreeningSetting && !dataUpdates.screeningSetting) {
      dataUpdates.screeningSetting = dataUpdates.cvScreeningSetting;
    }
    if (dataUpdates.screeningSetting && !dataUpdates.cvScreeningSetting) {
      dataUpdates.cvScreeningSetting = dataUpdates.screeningSetting;
    }

    console.log(
      "🔍 [API update-career] Updating preScreeningQuestions:",
      dataUpdates.preScreeningQuestions,
    );

    const career = {
      ...dataUpdates,
      updatedAt: new Date(),
    };

    await db
      .collection("careers")
      .updateOne({ _id: new ObjectId(_id) }, { $set: career });

    return NextResponse.json({
      message: "Career updated successfully",
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
