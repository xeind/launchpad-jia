import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { category, jobTitle, description, generateAll } = await request.json();

    if (!jobTitle || !description) {
      return NextResponse.json(
        { error: "Job title and description are required" },
        { status: 400 },
      );
    }

    // If generateAll is true, generate only 1 question. Otherwise 3 questions.
    const questionCount = generateAll ? "1" : "3";

    const categoryPrompts: Record<string, string> = {
      cvValidation: `Generate ${questionCount} interview questions to validate the candidate's CV and work experience for the position of ${jobTitle}. Focus on verifying past experiences, projects, and achievements mentioned in their resume.`,
      technical: `Generate ${questionCount} technical interview questions for the position of ${jobTitle}. Focus on skills, technologies, and technical knowledge relevant to: ${description}`,
      behavioral: `Generate ${questionCount} behavioral interview questions for the position of ${jobTitle}. Focus on teamwork, problem-solving, communication, and past experiences.`,
      analytical: `Generate ${questionCount} analytical interview questions for the position of ${jobTitle}. Focus on critical thinking, problem-solving approaches, and decision-making skills.`,
      others: `Generate ${questionCount} general interview questions for the position of ${jobTitle} that don't fit into technical, behavioral, or analytical categories. Focus on motivation, cultural fit, and career goals.`,
    };

    const prompt = categoryPrompts[category] || categoryPrompts.others;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR interviewer. Generate interview questions that are clear, relevant, and effective for evaluating candidates. Return ONLY a JSON array of question strings, nothing else.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON array from the response
    let questions: string[];
    try {
      questions = JSON.parse(content);
    } catch (parseError) {
      // If not valid JSON, try to extract questions from text
      questions = content
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((q) => q.length > 0);
    }

    return NextResponse.json({
      questions: generateAll ? questions.slice(0, 1) : questions.slice(0, 3), // 1 if generateAll, else 3
      category,
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 },
    );
  }
}
