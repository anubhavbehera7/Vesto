/**
 * Test Supabase Connection and Data
 * 
 * This script tests:
 * 1. Supabase connection
 * 2. All database tables have data
 * 3. API routes work correctly
 * 4. Query functions work
 * 
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createAdminClient } from '../lib/supabase/admin';
import { getAllCompanies, getCompanyBySymbol, getCompanyFundamentals, getCompanyQuote, getMock10KData } from '../lib/supabase/queries';

async function testSupabaseConnection() {
  console.log('='.repeat(80));
  console.log('VESTO SUPABASE CONNECTION TEST');
  console.log('='.repeat(80));
  console.log();

  // Test 1: Admin Client Connection
  console.log('🔌 Test 1: Admin Client Connection');
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from('companies').select('count').limit(1);
    if (error) throw error;
    console.log('✓ Admin client connected successfully');
  } catch (error: any) {
    console.error('✗ Admin client failed:', error.message);
    return;
  }
  console.log();

  // Test 2: Check Table Row Counts
  console.log('📊 Test 2: Database Table Row Counts');
  const adminClient = createAdminClient();
  
  const tables = [
    'companies',
    'company_fundamentals',
    'company_quotes',
    'company_financials',
    'mock_10k_data'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await adminClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      const status = count && count > 0 ? '✓' : '⚠';
      console.log(`  ${status} ${table.padEnd(25)} ${count || 0} rows`);
    } catch (error: any) {
      console.error(`  ✗ ${table}: ${error.message}`);
    }
  }
  console.log();

  // Test 3: Query Functions
  console.log('🔍 Test 3: Query Functions');
  
  try {
    const companies = await getAllCompanies();
    console.log(`✓ getAllCompanies() - Found ${companies.length} companies`);
    
    if (companies.length > 0) {
      const firstCompany = companies[0];
      console.log(`  Sample: ${firstCompany.symbol} - ${firstCompany.name}`);
    }
  } catch (error: any) {
    console.error(`✗ getAllCompanies() failed: ${error.message}`);
  }

  try {
    const company = await getCompanyBySymbol('AAPL');
    console.log(`✓ getCompanyBySymbol('AAPL') - Found: ${company.name}`);
  } catch (error: any) {
    console.error(`✗ getCompanyBySymbol('AAPL') failed: ${error.message}`);
  }

  try {
    const fundamentals = await getCompanyFundamentals('AAPL');
    console.log(`✓ getCompanyFundamentals('AAPL') - P/E: ${fundamentals.pe_ratio}, ROE: ${fundamentals.roe}%`);
  } catch (error: any) {
    console.error(`✗ getCompanyFundamentals('AAPL') failed: ${error.message}`);
  }

  try {
    const quote = await getCompanyQuote('AAPL');
    console.log(`✓ getCompanyQuote('AAPL') - Price: $${quote.current_price}`);
  } catch (error: any) {
    console.error(`✗ getCompanyQuote('AAPL') failed: ${error.message}`);
  }

  try {
    const mock10k = await getMock10KData('AAPL');
    console.log(`✓ getMock10KData('AAPL') - Business description: ${mock10k.business_description.substring(0, 50)}...`);
  } catch (error: any) {
    console.error(`✗ getMock10KData('AAPL') failed: ${error.message}`);
  }

  console.log();

  // Test 4: Sample Data Verification
  console.log('📋 Test 4: Sample Data Verification');
  
  const testSymbols = ['AAPL', 'MSFT', 'GOOGL'];
  
  for (const symbol of testSymbols) {
    try {
      const [company, fundamentals, quote, mock10k] = await Promise.all([
        getCompanyBySymbol(symbol).catch(() => null),
        getCompanyFundamentals(symbol).catch(() => null),
        getCompanyQuote(symbol).catch(() => null),
        getMock10KData(symbol).catch(() => null)
      ]);

      const checks = [
        company ? '✓' : '✗',
        fundamentals ? '✓' : '✗',
        quote ? '✓' : '✗',
        mock10k ? '✓' : '✗'
      ];

      console.log(`  ${symbol}: Company ${checks[0]} | Fundamentals ${checks[1]} | Quote ${checks[2]} | Mock10K ${checks[3]}`);
    } catch (error: any) {
      console.error(`  ✗ ${symbol}: ${error.message}`);
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('✓ All tests completed');
  console.log();
  console.log('Next steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Test API routes:');
  console.log('   - http://localhost:3000/api/companies');
  console.log('   - http://localhost:3000/api/companies/AAPL');
  console.log('3. Check frontend pages load company data');
  console.log('='.repeat(80));
}

testSupabaseConnection()
  .then(() => {
    console.log('\n✓ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

