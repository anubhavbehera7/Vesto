// Core type definitions for Vesto application

export interface Company {
  id: number;
  symbol: string;
  name: string;
  industry: string | null;
  sector: string | null;
  market_cap: number | null;
  shares_outstanding: number | null;
  exchange: string | null;
  country: string | null;
  currency: string | null;
  ipo: string | null;
  website: string | null;
  logo: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyFundamentals {
  id: number;
  company_id: number;
  symbol: string;
  pe_ratio: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  peg_ratio: number | null;
  forward_pe: number | null;
  roe: number | null;
  roa: number | null;
  gross_margin: number | null;
  operating_margin: number | null;
  net_profit_margin: number | null;
  ebitda: number | null;
  debt_to_equity: number | null;
  current_ratio: number | null;
  quick_ratio: number | null;
  long_term_debt_to_equity: number | null;
  eps_growth_yoy: number | null;
  revenue_growth_yoy: number | null;
  eps_growth_5y: number | null;
  revenue_growth_5y: number | null;
  beta: number | null;
  market_cap: number | null;
  week_52_high: number | null;
  week_52_low: number | null;
  extracted_at: string;
  created_at: string;
}

export interface CompanyQuote {
  id: number;
  company_id: number;
  symbol: string;
  current_price: number;
  change: number | null;
  percent_change: number | null;
  high: number | null;
  low: number | null;
  open: number | null;
  previous_close: number | null;
  market_timestamp: number | null;
  created_at: string;
}

export interface Mock10KData {
  id: number;
  company_id: number;
  symbol: string;
  business_description: string;
  risk_factors: string;
  financial_discussion: string;
  fiscal_year: number;
  created_at: string;
}

export interface Company10KSections {
  id: number;
  company_id: number;
  symbol: string;
  filing_url: string;
  access_number: string | null;
  filed_date: string | null;
  fiscal_year: number | null;
  section_1_business: string | null;
  section_1a_risk_factors: string | null;
  section_1c_cybersecurity: string | null;
  section_7_mda: string | null;
  section_7a_market_risk: string | null;
  section_8_financial_statements: string | null;
  section_9a_controls: string | null;
  extracted_at: string;
  extraction_status: 'completed' | 'partial' | 'failed';
  sections_extracted: number;
  api_calls_used: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  level: 'easy' | 'intermediate' | 'advanced' | 'expert';
  order: number;
}

export interface Question {
  id: number;
  module_id: string;
  company_id: number;
  symbol: string;
  question_type: 'mcq' | 'written';
  question_text: string;
  question_context: string | null;
  options: Array<{ label: string; text: string }> | null;
  correct_answer: string | null;
  grading_rubric: any;
  sample_answer: string | null;
  difficulty: 'easy' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  total_questions: number;
  correct_answers: number;
  average_score: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserAnswer {
  id: number;
  user_id: string;
  question_id: number;
  module_id: string;
  symbol: string;
  answer_text: string;
  ai_score: number | null;
  ai_feedback: AIFeedback | null;
  is_correct: boolean | null;
  submitted_at: string;
  graded_at: string | null;
  created_at: string;
}

export interface AIFeedback {
  overall_score: number;
  criteria: {
    clarity: { score: number; feedback: string };
    evidence: { score: number; feedback: string };
    completeness: { score: number; feedback: string };
    critical_thinking: { score: number; feedback: string };
    risk_analysis: { score: number; feedback: string };
  };
  summary: string;
}

export interface UserPortfolio {
  id: number;
  user_id: string;
  symbol: string;
  company_name: string;
  shares: number;
  buy_price: number;
  buy_date: string;
  current_price: number | null;
  current_value: number | null;
  gain_loss: number | null;
  gain_loss_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface PitchSubmission {
  id: number;
  user_id: string;
  company_id: number;
  symbol: string;
  company_name: string;
  pitch_text: string;
  status: 'approved' | 'rejected' | 'pending';
  ai_feedback: string | null;
  ai_score: number | null;
  invested: boolean;
  investment_amount: number | null;
  shares_purchased: number | null;
  purchase_price: number | null;
  invested_at: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Module definitions
export const MODULES: Module[] = [
  {
    id: 'module-1',
    title: 'Basic Fundamentals',
    description: 'Learn P/E Ratios, EBITDA, D/E Ratios, and more.',
    level: 'easy',
    order: 1
  },
  {
    id: 'module-2',
    title: '10-K: Business & Risk Factors',
    description: 'Analyze how a company presents itself and its risks.',
    level: 'intermediate',
    order: 2
  },
  {
    id: 'module-3',
    title: '10-K: Financial Statements',
    description: 'Deep dive into Balance Sheets and Income Statements.',
    level: 'intermediate',
    order: 3
  },
  {
    id: 'module-4',
    title: 'Competitive Analysis & Moats',
    description: 'Understand what gives a company its edge.',
    level: 'advanced',
    order: 4
  },
  {
    id: 'module-5',
    title: 'Expert: Comparative Analysis',
    description: 'Put it all together. Compare two companies head-to-head.',
    level: 'expert',
    order: 5
  }
];

