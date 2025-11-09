import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error in progress API:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in progress API');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No user found' },
        { status: 401 }
      );
    }

    // Fetch progress directly using server client
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

