import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { completionPercentage, status, totalQuestions, correctAnswers, averageScore } = body;

    // Calculate completion percentage if not provided
    const calculatedPercentage = completionPercentage || 0;

    // Determine status if not provided
    let finalStatus = status || 'not_started';
    if (calculatedPercentage === 100) {
      finalStatus = 'completed';
    } else if (calculatedPercentage > 0) {
      finalStatus = 'in_progress';
    }

    // First, check if progress exists to preserve timestamps
    const { data: existing, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle();

    // Update or insert progress
    const updateData: any = {
      user_id: user.id,
      module_id: moduleId,
      completion_percentage: calculatedPercentage,
      status: finalStatus,
      total_questions: totalQuestions || 0,
      correct_answers: correctAnswers || 0,
      average_score: averageScore || 0,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Preserve or set started_at
    if (finalStatus === 'in_progress' && !existing?.started_at) {
      updateData.started_at = new Date().toISOString();
    } else if (existing?.started_at) {
      updateData.started_at = existing.started_at;
    }

    // Preserve or set completed_at
    if (calculatedPercentage === 100 && !existing?.completed_at) {
      updateData.completed_at = new Date().toISOString();
    } else if (existing?.completed_at) {
      updateData.completed_at = existing.completed_at;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(updateData, {
        onConflict: 'user_id,module_id'
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

