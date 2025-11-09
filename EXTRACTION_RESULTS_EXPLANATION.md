# 10-K Extraction Results Explanation

## Why Only 49 API Calls Instead of 70?

### Expected vs Actual
- **Expected:** 10 companies × 7 sections = 70 API calls
- **Actual:** 49 API calls

### Breakdown

#### ✅ Successfully Extracted (7 companies × 7 sections = 49 calls)
1. **AAPL** - Apple Inc. - 7 sections extracted
2. **MSFT** - Microsoft - 7 sections extracted
3. **AMZN** - Amazon - 7 sections extracted
4. **NVDA** - NVIDIA - 7 sections extracted
5. **TSLA** - Tesla - 7 sections extracted
6. **V** - Visa - 7 sections extracted
7. **JNJ** - Johnson & Johnson - 7 sections extracted

#### ❌ Skipped (3 companies - no filing data)
1. **GOOGL** - Alphabet - 0 calls (no 10-K filings in Finnhub data)
2. **META** - Meta Platforms - 0 calls (no 10-K filings in Finnhub data)
3. **JPM** - JPMorgan Chase - 0 calls (no 10-K filings in Finnhub data)

## Why Were These Companies Skipped?

The script checks the Finnhub data file (`vesto_finnhub_20_companies.json`) for 10-K filing URLs. For GOOGL, META, and JPM, the filings array was empty:

```json
{
  "symbol": "GOOGL",
  "total_10k_filings": 0,
  "filings": []
}
```

This means:
- The Finnhub API didn't return 10-K filings when the data was extracted
- OR the companies use different ticker symbols/CIKs
- OR the filings weren't available at extraction time

## Solutions

### Option 1: Re-run Finnhub Extractor (Recommended)
Re-extract Finnhub data to get fresh filing information:

```bash
python3 vesto_finnhub_extractor.py
```

This will fetch the latest 10-K filing URLs for all companies, including GOOGL, META, and JPM.

### Option 2: Add Manual Filing URLs
You can manually add filing URLs in the script. Edit `vesto_sec_api_extractor.py` and add to `MANUAL_FILING_URLS`:

```python
MANUAL_FILING_URLS = {
    "GOOGL": {
        "filing_url": "https://www.sec.gov/Archives/edgar/data/...",
        "access_number": "000...",
        "filed_date": "2024-..."
    },
    "META": {
        "filing_url": "https://www.sec.gov/Archives/edgar/data/...",
        "access_number": "000...",
        "filed_date": "2024-..."
    },
    "JPM": {
        "filing_url": "https://www.sec.gov/Archives/edgar/data/...",
        "access_number": "000...",
        "filed_date": "2024-..."
    }
}
```

To find filing URLs:
1. Go to https://www.sec.gov/edgar/searchedgar/companysearch.html
2. Search for the company
3. Find their latest 10-K filing
4. Copy the filing URL

### Option 3: Extract Remaining Companies Separately
Run the extraction script again, but only for the 3 missing companies after you've added their filing URLs:

```python
# In the script's __main__ section, modify to:
extract_single_company("GOOGL")
extract_single_company("META")
extract_single_company("JPM")
```

## Current Status

✅ **7 companies fully extracted** (49 sections total)
- All 7 sections extracted for each company
- Data stored in Supabase (if configured) or JSON files

❌ **3 companies pending** (21 sections missing)
- Need filing URLs from Finnhub or manual entry
- Will require 21 additional API calls (3 companies × 7 sections)

## Next Steps

1. **Check if you need all 10 companies:**
   - If 7 companies is sufficient for your MVP, you're done!
   - You have 51 API calls remaining (100 - 49 = 51)

2. **If you need all 10 companies:**
   - Re-run Finnhub extractor to get fresh filing data
   - OR manually add the 3 missing companies' filing URLs
   - Then re-run the extraction script

3. **Verify data in Supabase:**
   - Check the `company_10k_sections` table
   - Should have 7 records (one per company)

## API Credit Summary

- **Used:** 49 calls
- **Remaining:** 51 calls
- **Needed for 3 remaining companies:** 21 calls
- **Total after completion:** 70 calls

