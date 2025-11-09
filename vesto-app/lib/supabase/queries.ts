import { createClient } from './client';
import type { Company, CompanyFundamentals, CompanyQuote, Mock10KData, UserProgress, UserAnswer, UserPortfolio, PitchSubmission, Question } from '@/types';

// Note: Using browser client for both server and client contexts
// The browser client works fine in API routes since we're using anon key with RLS
// For authenticated operations, use the server client directly in API routes
function getSupabaseClient() {
  return createClient();
}

// Company queries
export async function getAllCompanies() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('symbol');
  
  if (error) throw error;
  return data as Company[];
}

export async function getCompanyBySymbol(symbol: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('symbol', symbol)
    .single();
  
  if (error) throw error;
  return data as Company;
}

export async function getCompanyFundamentals(symbol: string) {
  const supabase = getSupabaseClient();
  const { data, error} = await supabase
    .from('company_fundamentals')
    .select('*')
    .eq('symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data as CompanyFundamentals;
}

export async function getCompanyQuote(symbol: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('company_quotes')
    .select('*')
    .eq('symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data as CompanyQuote;
}

export async function getMock10KData(symbol: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('mock_10k_data')
    .select('*')
    .eq('symbol', symbol)
    .single();
  
  if (error) throw error;
  return data as Mock10KData;
}

export async function getCompanyFinancials(symbol: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('company_financials')
    .select('*')
    .eq('symbol', symbol)
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
    .limit(10); // Get up to 10 records to ensure we have enough distinct years
  
  if (error && error.code !== 'PGRST116') throw error;
  return (data || []) as Array<{
    id: number;
    company_id: number;
    symbol: string;
    year: number;
    quarter: number;
    form: string;
    income_statement: any;
    balance_sheet: any;
    cash_flow: any;
  }>;
}

// Module and question queries
export async function getQuestionsForModule(moduleId: string, symbol?: string) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('ai_generated_questions')
    .select('*')
    .eq('module_id', moduleId);
  
  if (symbol) {
    query = query.eq('symbol', symbol);
  }
  
  const { data, error } = await query.order('created_at');
  
  if (error) throw error;
  return data as Question[];
}

// User progress queries
export async function getUserProgress(userId: string, moduleId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data as UserProgress | null;
}

export async function getAllUserProgress(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data as UserProgress[];
}

export async function updateUserProgress(userId: string, moduleId: string, updates: Partial<UserProgress>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as UserProgress;
}

// User answer queries
export async function saveUserAnswer(answer: Omit<UserAnswer, 'id' | 'created_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_answers')
    .insert(answer)
    .select()
    .single();
  
  if (error) throw error;
  return data as UserAnswer;
}

export async function getUserAnswersForModule(userId: string, moduleId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_answers')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data as UserAnswer[];
}

// Portfolio queries
export async function getUserPortfolio(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('buy_date', { ascending: false });
  
  if (error) throw error;
  return data as UserPortfolio[];
}

export async function addToPortfolio(holding: Omit<UserPortfolio, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_portfolios')
    .upsert(holding, {
      onConflict: 'user_id,symbol'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as UserPortfolio;
}

// Pitch submission queries
export async function submitPitch(pitch: Omit<PitchSubmission, 'id' | 'created_at'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pitch_submissions')
    .insert(pitch)
    .select()
    .single();
  
  if (error) throw error;
  return data as PitchSubmission;
}

export async function getUserPitches(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pitch_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data as PitchSubmission[];
}

export async function getPitchStats(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pitch_submissions')
    .select('status')
    .eq('user_id', userId);
  
  if (error) throw error;
  
  const total = data.length;
  const approved = data.filter(p => p.status === 'approved').length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  
  return {
    totalPitches: total,
    approvedPitches: approved,
    approvalRate
  };
}

