import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, shares, buyPrice, investmentAmount, pitchSubmissionId } = body;

    if (!userId || !symbol || !shares || !buyPrice || !investmentAmount) {
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
        { error: 'Unauthorized', details: 'Please log in to invest' },
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

    // Check existing portfolio to calculate available cash
    const { data: existingHoldings } = await supabase
      .from('user_portfolios')
      .select('shares, buy_price')
      .eq('user_id', userId);

    const totalInvested = (existingHoldings || []).reduce(
      (sum, h) => sum + (h.shares * h.buy_price),
      0
    );
    const availableCash = 10000 - totalInvested;

    if (investmentAmount > availableCash) {
      return NextResponse.json(
        { error: 'Insufficient funds', details: `Available: $${availableCash.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Check if user already has this stock
    const { data: existingHolding } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    let holding;
    if (existingHolding) {
      // Update existing holding (add shares)
      const newShares = existingHolding.shares + shares;
      const totalCost = (existingHolding.shares * existingHolding.buy_price) + investmentAmount;
      const newAvgPrice = totalCost / newShares;

      const { data: updated, error: updateError } = await supabase
        .from('user_portfolios')
        .update({
          shares: newShares,
          buy_price: newAvgPrice,
          current_price: buyPrice,
          current_value: newShares * buyPrice,
          gain_loss: (newShares * buyPrice) - totalCost,
          gain_loss_percent: totalCost > 0 ? (((newShares * buyPrice) - totalCost) / totalCost) * 100 : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingHolding.id)
        .select()
        .single();

      if (updateError) throw updateError;
      holding = updated;
    } else {
      // Create new holding
      const { data: newHolding, error: insertError } = await supabase
        .from('user_portfolios')
        .insert({
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
        })
        .select()
        .single();

      if (insertError) throw insertError;
      holding = newHolding;
    }

    // Update pitch submission to mark as invested
    if (pitchSubmissionId) {
      await supabase
        .from('pitch_submissions')
        .update({
          invested: true,
          investment_amount: investmentAmount,
          shares_purchased: shares,
          purchase_price: buyPrice,
          invested_at: new Date().toISOString()
        })
        .eq('id', pitchSubmissionId);
    }

    return NextResponse.json({
      data: holding,
      message: `Successfully invested $${investmentAmount.toFixed(2)} in ${symbol}`
    });
  } catch (error: any) {
    console.error('Error investing:', error);
    return NextResponse.json(
      {
        error: 'Failed to invest',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

