import { NextResponse } from 'next/server';
import { getAllCompanies, getCompanyFundamentals, getCompanyQuote, getMock10KData, getCompanyFinancials } from '@/lib/supabase/queries';

/**
 * Get all companies with their complete data in a single request
 * This reduces API calls from 20+ to just 1 call
 * All data comes from cached Supabase database (no external API calls)
 */
export async function GET() {
  try {
    // Get all companies from cached database
    const companies = await getAllCompanies();
    
    // Load all related data in parallel (all from cached Supabase, no external APIs)
    const companiesWithData = await Promise.all(
      companies.map(async (company) => {
        try {
          const [fundamentals, quote, mock10k, financials] = await Promise.all([
            getCompanyFundamentals(company.symbol).catch(() => null),
            getCompanyQuote(company.symbol).catch(() => null),
            getMock10KData(company.symbol).catch(() => null),
            getCompanyFinancials(company.symbol).catch(() => null)
          ]);

          return {
            company,
            fundamentals,
            quote,
            mock10k,
            financials: financials || []
          };
        } catch (error) {
          console.error(`Error loading data for ${company.symbol}:`, error);
          return {
            company,
            fundamentals: null,
            quote: null,
            mock10k: null,
            financials: []
          };
        }
      })
    );

    return NextResponse.json({ 
      data: companiesWithData,
      note: 'All data loaded from cached Supabase database. No external API calls made.'
    });
  } catch (error) {
    console.error('Error fetching all company data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    );
  }
}

