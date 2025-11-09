import { NextResponse } from 'next/server';
import { gradeMCQ } from '@/lib/ai/grade-mcq';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const body = await request.json();
    const { question, selectedAnswer, correctAnswer, options, context } = body;

    if (!question || !selectedAnswer || !correctAnswer || !options) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Grade MCQ with AI
    const feedback = await gradeMCQ(question, selectedAnswer, correctAnswer, options, context);

    return NextResponse.json({
      data: feedback
    });
  } catch (error) {
    console.error('Error grading MCQ:', error);
    return NextResponse.json(
      { error: 'Failed to grade MCQ answer' },
      { status: 500 }
    );
  }
}

