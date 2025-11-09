import { NextResponse } from 'next/server';
import { gradeAnswer } from '@/lib/ai/grade-answer';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const body = await request.json();
    const { userId, questionId, questionText, answerText, context, symbol, expectedCompanyName, expectedCompanySymbol } = body;

    if (!userId || !questionId || !answerText || !questionText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get authenticated user from server-side client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please log in to submit answers' },
        { status: 401 }
      );
    }

    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Grade answer with AI (pass company info for validation)
    const aiFeedback = await gradeAnswer(
      questionText, 
      answerText, 
      context || '',
      expectedCompanyName,
      expectedCompanySymbol
    );

    // Save answer to database using server-side client (with auth session)
    // Note: question_id is nullable because hardcoded questions don't exist in ai_generated_questions table
    // We store the question text in the answer_text field and can reference it by module_id
    const { data: savedAnswer, error: saveError } = await supabase
      .from('user_answers')
      .insert({
        user_id: userId,
        question_id: null, // Hardcoded questions don't have database IDs
        module_id: moduleId,
        symbol: symbol || '',
        answer_text: answerText,
        ai_score: aiFeedback.overall_score,
        ai_feedback: aiFeedback,
        is_correct: aiFeedback.overall_score >= 70,
        submitted_at: new Date().toISOString(),
        graded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving answer:', saveError);
      throw new Error(`Failed to save answer: ${saveError.message}`);
    }

    // Update user progress using server-side client
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        status: 'in_progress',
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,module_id'
      });

    if (progressError) {
      console.error('Error updating progress:', progressError);
      // Don't fail the request if progress update fails
    }

    return NextResponse.json({
      data: {
        answer: savedAnswer,
        feedback: aiFeedback
      }
    });
  } catch (error: any) {
    console.error('Error grading answer:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to grade answer',
        details: error?.message || 'Unknown error',
        type: error?.name || 'Error'
      },
      { status: 500 }
    );
  }
}

