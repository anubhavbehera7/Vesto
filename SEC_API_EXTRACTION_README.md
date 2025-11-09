# SEC-API.IO 10-K Extraction Script

This script extracts the 7 highest-leverage sections from 10-K filings using sec-api.io and stores them in Supabase.

## Sections Extracted

1. **Item 1** - Business Description
2. **Item 1A** - Risk Factors
3. **Item 1C** - Cybersecurity
4. **Item 7** - MD&A (Management's Discussion & Analysis)
5. **Item 7A** - Quantitative & Qualitative Market Risk
6. **Item 8** - Financial Statements & Supplementary Data
7. **Item 9A** - Controls and Procedures

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file or export these variables:

```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Note:** The script will still work without Supabase credentials - it will save to JSON files instead.

### 3. Run Database Migration

Before running the extraction, apply the database migration:

```sql
-- Run this in Supabase SQL Editor
-- File: vesto-app/supabase/migration_add_10k_sections.sql
```

## Usage

### Extract for All Companies (10 companies = 70 API calls)

```bash
python vesto_sec_api_extractor.py
```

This will:
- Read company data from `vesto_finnhub_20_companies.json`
- Extract 7 sections for the first 10 companies
- Store results in Supabase (if configured) or JSON files
- Track API credit usage

### Extract for Single Company (7 API calls)

Modify the script's `__main__` section or call directly:

```python
from vesto_sec_api_extractor import extract_single_company

result = extract_single_company("AAPL")
```

## API Credit Usage

- **Per company:** 7 API calls (one per section)
- **10 companies:** 70 API calls
- **Free tier limit:** 100 API calls

The script tracks API usage and will warn you if approaching limits.

## Output

### Supabase Storage

Data is stored in the `company_10k_sections` table with:
- All 7 section contents (TEXT columns)
- Filing metadata (URL, access number, filed date)
- Extraction status and API call count

### JSON Fallback

If Supabase is not configured, data is saved to:
- `sec_api_extracted_{SYMBOL}.json` (per company)
- `sec_api_extracted_all_companies.json` (summary)

## Database Schema

The `company_10k_sections` table includes:
- `section_1_business` - Item 1 content
- `section_1a_risk_factors` - Item 1A content
- `section_1c_cybersecurity` - Item 1C content
- `section_7_mda` - Item 7 content
- `section_7a_market_risk` - Item 7A content
- `section_8_financial_statements` - Item 8 content
- `section_9a_controls` - Item 9A content

## Accessing Data in Modules

After extraction, modules can query the data:

```typescript
// In your Next.js API route or component
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase
  .from('company_10k_sections')
  .select('*')
  .eq('symbol', 'AAPL')
  .single()

// Access sections:
// data.section_1_business
// data.section_1a_risk_factors
// etc.
```

## Error Handling

The script handles:
- **Processing delays:** Automatically retries if API returns "processing"
- **Empty sections:** Logs warning and continues
- **Missing filings:** Skips company and logs error
- **Supabase errors:** Falls back to JSON storage

## Troubleshooting

### "Company not found in database"
- Run the Finnhub data loader first: `npm run load-data`
- This populates the `companies` table

### "Supabase credentials not set"
- Set environment variables or the script will use JSON fallback
- This is fine for testing, but data won't be accessible to modules

### "Section appears to be empty"
- Some older filings may not have all sections
- The script will mark extraction as "partial" and continue

## Next Steps

After extraction:
1. Verify data in Supabase dashboard
2. Update module queries to use `company_10k_sections` table
3. Generate AI questions using the extracted sections
4. Schedule periodic updates for new 10-K filings

