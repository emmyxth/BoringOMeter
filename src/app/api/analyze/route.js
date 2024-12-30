// /pages/api/analyze/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // optionally organization/project if needed
});

const prompt = `You are an AI assistant that evaluates a user’s spoken response. Your job is to:

1. Assign an engagement score out of 100.
2. Provide detailed, constructive feedback on how the user can improve. 
   - Reference specific examples from their speech to illustrate strengths and areas needing improvement.

Make sure your feedback is positive, actionable, and directly addresses the user’s speech patterns, content, and delivery.

Give your answer in this format: 
{
  "Score": XYZ,
  "Feedback": XYZ
}
`;

export async function POST(request) {
  try {
    const res = await request.json();
    const transcript = res["transcript"];
    const message = {
      model: "gpt-4", // or gpt-4, etc.
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: transcript },
      ],
      temperature: 0.7,
    };
    const completion = await openai.chat.completions.create(message);
    const feedback =
      completion.choices?.[0]?.message?.content ?? "No feedback available.";
    // console.log("completion message: ", feedback);
    return NextResponse.json({ feedback }); // App Router uses NextResponse
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
