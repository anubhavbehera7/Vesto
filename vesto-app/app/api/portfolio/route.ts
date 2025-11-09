import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get authenticated user from server-side client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Please log in to view portfolio' },
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

    // Fetch portfolio using server-side client
    const { data: portfolio, error } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('buy_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: portfolio || [] });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, shares, buyPrice } = body;

    if (!userId || !symbol || !shares || !buyPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const holding = await addToPortfolio({
      user_id: userId,
      symbol,
      company_name: companyName,
      shares,
      buy_price: buyPrice,
      buy_date: new Date().toISOString(),
      current_price: buyPrice,
      current_value: shares * buyPrice,
      gain_loss: 0,
      gain_loss_percent: 0
    });

    return NextResponse.json({ data: holding });
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to add to portfolio' },
      { status: 500 }
    );
  }
}

