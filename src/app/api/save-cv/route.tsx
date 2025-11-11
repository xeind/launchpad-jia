import { sendEmail } from "@/lib/Email";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { db } = await connectMongoDB();

  let { cvData } = body;

  const { _id, ...updateData } = cvData;
  cvData = updateData;

  await db.collection("applicant-cv").updateOne(
    {
      email: cvData.email,
    },
    { $set: cvData },
    { upsert: true },
  );

  // Try to send email, but don't fail if it errors
  try {
    await sendEmail({
      recipient: cvData.email,
      html: `
        <div>
          <p>Dear ${cvData.name || "Applicant"},</p>
          <p>Your CV has been successfully uploaded and is now under review.</p>
          <p>You can manage your CV here: <a href="https://jia-alpha.vercel.app/applicant/manage-cv">Manage CV</a></p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send CV confirmation email:", emailError);
    // Continue anyway - email failure shouldn't prevent CV save
  }

  return NextResponse.json({
    message: "CV saved successfully",
  });
}
