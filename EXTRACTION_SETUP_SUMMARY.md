# 10-K Extraction Setup Summary

## ✅ What's Been Created

### 1. Database Migration
**File:** `vesto-app/supabase/migration_add_10k_sections.sql`
- Creates `company_10k_sections` table
- Stores all 7 sections as TEXT columns
- Includes metadata (filing URL, access number, fiscal year)
- Tracks extraction status and API usage

### 2. Python Extraction Script
**File:** `vesto_sec_api_extractor.py`
- Extracts 7 sections from 10-K filings using sec-api.io
- Integrates with Supabase for storage
- Falls back to JSON if Supabase not configured
- Tracks API credit usage (7 calls per company)

### 3. TypeScript Types & Queries
**Files:** 
- `vesto-app/types/index.ts` - Added `Company10KSections` interface
- `vesto-app/lib/supabase/queries.ts` - Added query functions:
  - `getCompany10KSections(symbol)` - Get latest filing
  - `getAllCompany10KSections(symbol)` - Get all filings

### 4. Documentation
**Files:**
- `SEC_API_EXTRACTION_README.md` - Complete usage guide
- `requirements.txt` - Python dependencies

## 🚀 Quick Start

### Step 1: Apply Database Migration
```sql
-- Run in Supabase SQL Editor
-- Copy contents of: vesto-app/supabase/migration_add_10k_sections.sql
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Set Environment Variables (Optional)
```bash
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
```

**Note:** Script works without these - will save to JSON instead.

### Step 4: Run Extraction
```bash
python vesto_sec_api_extractor.py
```

This will:
- Extract 7 sections for first 10 companies (70 API calls)
- Store in Supabase if configured
- Save to JSON as fallback

## 📊 API Credit Usage

- **Per company:** 7 API calls
- **10 companies:** 70 API calls
- **Free tier:** 100 API calls total

The script tracks usage and warns if approaching limits.

## 📁 Files Created

```
Vesto/
├── vesto_sec_api_extractor.py          # Main extraction script
├── requirements.txt                     # Python dependencies
├── SEC_API_EXTRACTION_README.md        # Detailed documentation
├── EXTRACTION_SETUP_SUMMARY.md         # This file
└── vesto-app/
    ├── supabase/
    │   └── migration_add_10k_sections.sql  # Database migration
    ├── types/
    │   └── index.ts                     # Added Company10KSections type
    └── lib/
        └── supabase/
            └── queries.ts               # Added query functions
```

## 🔍 Sections Extracted

1. **Item 1** - Business Description
2. **Item 1A** - Risk Factors
3. **Item 1C** - Cybersecurity
4. **Item 7** - MD&A
5. **Item 7A** - Market Risk
6. **Item 8** - Financial Statements
7. **Item 9A** - Controls and Procedures

## 💻 Using in Modules

After extraction, access data in your modules:

```typescript
import { getCompany10KSections } from '@/lib/supabase/queries'

// Get latest 10-K sections for a company
const sections = await getCompany10KSections('AAPL')

if (sections) {
  // Access sections:
  const business = sections.section_1_business
  const risks = sections.section_1a_risk_factors
  const cybersecurity = sections.section_1c_cybersecurity
  const mda = sections.section_7_mda
  const marketRisk = sections.section_7a_market_risk
  const financials = sections.section_8_financial_statements
  const controls = sections.section_9a_controls
}
```

## ⚠️ Important Notes

1. **Run Finnhub loader first:** The script needs companies in the database
   ```bash
   npm run load-data
   ```

2. **API Key:** Already configured in script (sec-api.io key provided)

3. **Supabase optional:** Script works without Supabase (saves to JSON)

4. **Error handling:** Script continues if some sections fail (marks as "partial")

## 🎯 Next Steps

1. Apply database migration
2. Run extraction script
3. Verify data in Supabase
4. Update modules to use `getCompany10KSections()`
5. Generate AI questions from extracted sections

