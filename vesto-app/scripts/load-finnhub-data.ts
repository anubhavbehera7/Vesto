/**
 * Load Finnhub Data into Supabase
 * 
 * This script reads the vesto_finnhub_20_companies.json file
 * and populates the Supabase database with company data.
 * 
 * Run with: npx tsx scripts/load-finnhub-data.ts
 * 
 * Prerequisites:
 * - NEXT_PUBLIC_SUPABASE_URL must be set in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 * - vesto_finnhub_20_companies.json must exist in project root
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import fs from 'fs';
import path from 'path';
import { createAdminClient } from '../lib/supabase/admin';
import { mock10KNarratives } from '../lib/mock-data/10k-narratives';

interface FinnhubData {
  extracted_at: string;
  companies: {
    [symbol: string]: {
      symbol: string;
      name: string;
      fundamentals: any;
      filings: any;
      financials: any;
      profile: any;
      quote: any;
      recommendations: any;
      news: any;
    };
  };
}

async function loadFinnhubData() {
  console.log('='.repeat(80));
  console.log('VESTO DATA LOADER - Loading Finnhub Data into Supabase');
  console.log('='.repeat(80));
  console.log();

  // 1. Read JSON file
  console.log('📂 Step 1: Reading JSON file...');
  const jsonPath = path.join(process.cwd(), '..', 'vesto_finnhub_20_companies.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Error: vesto_finnhub_20_companies.json not found at:', jsonPath);
    console.error('Expected location: /Users/moizfakhri/Developer/Projects/Vesto/vesto_finnhub_20_companies.json');
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const finnhubData: FinnhubData = JSON.parse(rawData);
  console.log(`✓ Loaded data for ${Object.keys(finnhubData.companies).length} companies`);
  console.log();

  // 2. Initialize Supabase admin client
  console.log('🔌 Step 2: Connecting to Supabase...');
  const supabase = createAdminClient();
  console.log('✓ Connected with service role key (admin access)');
  console.log();

  // 3. Process each company
  console.log('📊 Step 3: Processing company data...');
  let successCount = 0;
  let errorCount = 0;

  for (const [symbol, companyData] of Object.entries(finnhubData.companies)) {
    try {
      console.log(`\n→ Processing ${symbol} (${companyData.name})...`);

      // 3a. Insert/Update Company Profile
      console.log('  • Inserting company profile...');
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .upsert({
          symbol: companyData.symbol,
          name: companyData.name,
          industry: companyData.profile?.industry || null,
          sector: companyData.profile?.sector || null,
          market_cap: companyData.profile?.marketCap || null,
          shares_outstanding: companyData.profile?.sharesOutstanding || null,
          exchange: companyData.profile?.exchange || null,
          country: companyData.profile?.country || null,
          currency: companyData.profile?.currency || null,
          ipo: companyData.profile?.ipo || null,
          website: companyData.profile?.website || null,
          logo: companyData.profile?.logo || null,
          phone: companyData.profile?.phone || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'symbol',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (companyError) {
        console.error(`  ✗ Company insert failed:`, companyError.message);
        errorCount++;
        continue;
      }

      const companyId = company.id;
      console.log(`  ✓ Company profile inserted (ID: ${companyId})`);

      // 3b. Insert Fundamentals
      if (companyData.fundamentals?.valuation) {
        console.log('  • Inserting fundamentals...');
        
        // Delete existing fundamentals for this symbol first
        await supabase
          .from('company_fundamentals')
          .delete()
          .eq('symbol', symbol);
        
        const { error: fundamentalsError } = await supabase
          .from('company_fundamentals')
          .insert({
            company_id: companyId,
            symbol: symbol,
            pe_ratio: companyData.fundamentals.valuation?.peRatio,
            pb_ratio: companyData.fundamentals.valuation?.pbRatio,
            ps_ratio: companyData.fundamentals.valuation?.psRatio,
            peg_ratio: companyData.fundamentals.valuation?.pegRatio,
            forward_pe: companyData.fundamentals.valuation?.forwardPE,
            roe: companyData.fundamentals.profitability?.roe,
            roa: companyData.fundamentals.profitability?.roa,
            gross_margin: companyData.fundamentals.profitability?.grossMargin,
            operating_margin: companyData.fundamentals.profitability?.operatingMargin,
            net_profit_margin: companyData.fundamentals.profitability?.netProfitMargin,
            ebitda: companyData.fundamentals.profitability?.ebitda,
            debt_to_equity: companyData.fundamentals.leverage?.debtToEquity,
            current_ratio: companyData.fundamentals.leverage?.currentRatio,
            quick_ratio: companyData.fundamentals.leverage?.quickRatio,
            long_term_debt_to_equity: companyData.fundamentals.leverage?.longTermDebtToEquity,
            eps_growth_yoy: companyData.fundamentals.growth?.epsGrowthYoY,
            revenue_growth_yoy: companyData.fundamentals.growth?.revenueGrowthYoY,
            eps_growth_5y: companyData.fundamentals.growth?.epsGrowth5Y,
            revenue_growth_5y: companyData.fundamentals.growth?.revenueGrowth5Y,
            beta: companyData.fundamentals.market?.beta,
            market_cap: companyData.fundamentals.market?.marketCap,
            week_52_high: companyData.fundamentals.market?.week52High,
            week_52_low: companyData.fundamentals.market?.week52Low,
            extracted_at: companyData.fundamentals.timestamp || new Date().toISOString()
          });

        if (fundamentalsError) {
          console.error(`  ✗ Fundamentals insert failed:`, fundamentalsError.message);
        } else {
          console.log('  ✓ Fundamentals inserted');
        }
      }

      // 3c. Insert Quote
      if (companyData.quote?.currentPrice) {
        console.log('  • Inserting quote...');
        const { error: quoteError } = await supabase
          .from('company_quotes')
          .insert({
            company_id: companyId,
            symbol: symbol,
            current_price: companyData.quote.currentPrice,
            change: companyData.quote.change,
            percent_change: companyData.quote.percentChange,
            high: companyData.quote.high,
            low: companyData.quote.low,
            open: companyData.quote.open,
            previous_close: companyData.quote.previousClose,
            market_timestamp: companyData.quote.marketTimestamp
          });

        if (quoteError) {
          console.error(`  ✗ Quote insert failed:`, quoteError.message);
        } else {
          console.log('  ✓ Quote inserted');
        }
      }

      // 3d. Insert Financial Statements
      if (companyData.financials?.reports && companyData.financials.reports.length > 0) {
        console.log(`  • Inserting ${companyData.financials.reports.length} financial reports...`);
        
        for (const report of companyData.financials.reports.slice(0, 3)) {
          const { error: financialsError } = await supabase
            .from('company_financials')
            .insert({
              company_id: companyId,
              symbol: symbol,
              year: report.year,
              quarter: report.quarter,
              form: report.form,
              filed_date: report.filedDate,
              start_date: report.startDate,
              end_date: report.endDate,
              access_number: report.accessNumber,
              balance_sheet: report.balanceSheet || {},
              income_statement: report.incomeStatement || {},
              cash_flow: report.cashFlow || {}
            });

          if (financialsError && !financialsError.message.includes('duplicate')) {
            console.error(`  ✗ Financial report insert failed:`, financialsError.message);
          }
        }
        console.log('  ✓ Financial reports inserted');
      }

      successCount++;
      console.log(`  ✓✓ ${symbol} completed successfully`);

    } catch (error: any) {
      console.error(`  ✗✗ Error processing ${symbol}:`, error.message);
      errorCount++;
    }
  }

  console.log();
  console.log('='.repeat(80));

  // 4. Load Mock 10K Data
  console.log('\n📝 Step 4: Loading Mock 10-K Narratives...');
  console.log(`Found ${mock10KNarratives.length} mock narratives in TypeScript file`);

  let mock10kSuccess = 0;
  let mock10kError = 0;

  for (const narrative of mock10KNarratives) {
    try {
      // Get company ID from companies table
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('symbol', narrative.symbol)
        .single();

      if (!company) {
        console.log(`  ⚠ Company ${narrative.symbol} not found, skipping mock data`);
        continue;
      }

      // Delete existing mock 10K data for this symbol first
      await supabase
        .from('mock_10k_data')
        .delete()
        .eq('symbol', narrative.symbol);
      
      const { error } = await supabase
        .from('mock_10k_data')
        .insert({
          company_id: company.id,
          symbol: narrative.symbol,
          business_description: narrative.businessDescription,
          risk_factors: narrative.riskFactors,
          financial_discussion: narrative.financialDiscussion,
          fiscal_year: narrative.fiscalYear
        });

      if (error) {
        console.error(`  ✗ Mock 10K insert failed for ${narrative.symbol}:`, error.message);
        mock10kError++;
      } else {
        console.log(`  ✓ Mock 10K inserted for ${narrative.symbol}`);
        mock10kSuccess++;
      }

    } catch (error: any) {
      console.error(`  ✗ Error inserting mock 10K for ${narrative.symbol}:`, error.message);
      mock10kError++;
    }
  }

  // 5. Summary
  console.log();
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✓ Companies processed successfully: ${successCount}`);
  console.log(`✗ Companies with errors: ${errorCount}`);
  console.log(`✓ Mock 10K narratives inserted: ${mock10kSuccess}`);
  console.log(`✗ Mock 10K errors: ${mock10kError}`);
  console.log();

  if (successCount > 0) {
    console.log('🎉 Data loading completed successfully!');
    console.log();
    console.log('Next steps:');
    console.log('1. Check your Supabase dashboard to verify data');
    console.log('2. Test API routes:');
    console.log('   - http://localhost:3000/api/companies');
    console.log('   - http://localhost:3000/api/companies/AAPL');
    console.log('3. Start developing your application!');
  } else {
    console.log('❌ Data loading failed. Please check the errors above.');
  }

  console.log('='.repeat(80));
}

// Run the script
loadFinnhubData()
  .then(() => {
    console.log('\n✓ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

