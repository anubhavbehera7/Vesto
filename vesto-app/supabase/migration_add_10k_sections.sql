-- Migration: Add table for storing extracted 10-K filing sections
-- This table stores the 7 highest-leverage sections from 10-K filings
-- extracted via sec-api.io for use in Vesto learning modules

-- ============================================================================
-- 12. COMPANY_10K_SECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_10k_sections (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  
  -- Filing metadata
  filing_url TEXT NOT NULL,
  access_number TEXT,
  filed_date DATE,
  fiscal_year INTEGER,
  
  -- The 7 highest-leverage sections (as per requirements)
  -- Item 1: Business Description
  section_1_business TEXT,
  
  -- Item 1A: Risk Factors
  section_1a_risk_factors TEXT,
  
  -- Item 1C: Cybersecurity
  section_1c_cybersecurity TEXT,
  
  -- Item 7: MD&A (Management's Discussion & Analysis)
  section_7_mda TEXT,
  
  -- Item 7A: Quantitative & Qualitative Market Risk
  section_7a_market_risk TEXT,
  
  -- Item 8: Financial Statements & Supplementary Data
  section_8_financial_statements TEXT,
  
  -- Item 9A: Controls and Procedures
  section_9a_controls TEXT,
  
  -- Extraction metadata
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  extraction_status TEXT DEFAULT 'completed' CHECK (extraction_status IN ('completed', 'partial', 'failed')),
  sections_extracted INTEGER DEFAULT 0, -- Count of successfully extracted sections (0-7)
  api_calls_used INTEGER DEFAULT 0, -- Track API credit usage
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per company per filing
  UNIQUE(symbol, access_number)
);

-- Indexes for fast lookups
CREATE INDEX idx_10k_sections_symbol ON company_10k_sections(symbol);
CREATE INDEX idx_10k_sections_company_id ON company_10k_sections(company_id);
CREATE INDEX idx_10k_sections_fiscal_year ON company_10k_sections(fiscal_year DESC);
CREATE INDEX idx_10k_sections_extracted_at ON company_10k_sections(extracted_at DESC);

-- Row Level Security: Public read access (for learning modules)
ALTER TABLE company_10k_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "10K sections are viewable by everyone" ON company_10k_sections
  FOR SELECT USING (true);

-- Update trigger for updated_at
CREATE TRIGGER update_10k_sections_updated_at BEFORE UPDATE ON company_10k_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE company_10k_sections IS 'Extracted 10-K filing sections from sec-api.io for use in learning modules';
COMMENT ON COLUMN company_10k_sections.section_1_business IS 'Item 1: Business Description - Core products, services, segments, strategy';
COMMENT ON COLUMN company_10k_sections.section_1a_risk_factors IS 'Item 1A: Risk Factors - Qualitative risk landscape';
COMMENT ON COLUMN company_10k_sections.section_1c_cybersecurity IS 'Item 1C: Cybersecurity - Operational & regulatory risk controls';
COMMENT ON COLUMN company_10k_sections.section_7_mda IS 'Item 7: MD&A - Performance drivers, margins, trends, capital allocation';
COMMENT ON COLUMN company_10k_sections.section_7a_market_risk IS 'Item 7A: Market Risk - Sensitivity tables (FX, rates, commodities)';
COMMENT ON COLUMN company_10k_sections.section_8_financial_statements IS 'Item 8: Financial Statements - Income, balance sheet, cash flows, footnotes';
COMMENT ON COLUMN company_10k_sections.section_9a_controls IS 'Item 9A: Controls and Procedures - Disclosure controls and ICFR';

