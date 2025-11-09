import { NextResponse } from 'next/server';
import { reviewPitch } from '@/lib/ai/review-pitch';
import { submitPitch } from '@/lib/supabase/queries';
import { getCompanyBySymbol, getCompanyFundamentals, getMock10KData } from '@/lib/supabase/queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, symbol, companyName, pitchText } = body;

    if (!userId || !symbol || !pitchText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get company data for AI to evaluate against
    const [company, fundamentals, mock10k] = await Promise.all([
      getCompanyBySymbol(symbol),
      getCompanyFundamentals(symbol).catch(() => null),
      getMock10KData(symbol).catch(() => null)
    ]);

    const companyData = `
Company: ${companyName} (${symbol})
Business: ${mock10k?.business_description || 'N/A'}
Risk Factors: ${mock10k?.risk_factors || 'N/A'}
Key Metrics: P/E ${fundamentals?.pe_ratio}, ROE ${fundamentals?.roe}%, Debt/Equity ${fundamentals?.debt_to_equity}
    `.trim();

    // Review pitch with AI
    const review = await reviewPitch(companyName, symbol, pitchText, companyData);

    // Save pitch submission
    const submission = await submitPitch({
      user_id: userId,
      company_id: company.id,
      symbol,
      company_name: companyName,
      pitch_text: pitchText,
      status: review.status,
      ai_feedback: review.feedback,
      ai_score: review.score,
      invested: false,
      investment_amount: null,
      shares_purchased: null,
      purchase_price: null,
      invested_at: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    });

    return NextResponse.json({
      data: {
        submission,
        review
      }
    });
  } catch (error) {
    console.error('Error processing pitch:', error);
    return NextResponse.json(
      { error: 'Failed to process pitch' },
      { status: 500 }
    );
  }
}

