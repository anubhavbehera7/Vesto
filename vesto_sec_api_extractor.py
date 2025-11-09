"""
VESTO SEC-API.IO 10-K EXTRACTOR
================================
Extracts the 7 highest-leverage sections from 10-K filings using sec-api.io
and stores them in Supabase for use in Vesto learning modules.

Sections extracted:
- Item 1: Business Description
- Item 1A: Risk Factors
- Item 1C: Cybersecurity
- Item 7: MD&A (Management's Discussion & Analysis)
- Item 7A: Quantitative & Qualitative Market Risk
- Item 8: Financial Statements & Supplementary Data
- Item 9A: Controls and Procedures

API Credit Usage: 7 calls per company (70 calls for 10 companies)
"""

import requests
import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import time
from supabase import create_client, Client

# ============================================================================
# LOAD ENVIRONMENT VARIABLES FROM .env FILES
# ============================================================================

def load_env_file(filepath: str) -> Dict[str, str]:
    """Load environment variables from a .env file."""
    env_vars = {}
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    line = line.strip()
                    # Skip comments and empty lines
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
        except Exception as e:
            print(f"⚠️  Warning: Could not read {filepath}: {e}")
    return env_vars

# Try to load from .env files (check both root and vesto-app directory)
env_vars = {}
for env_file in [
    "vesto-app/.env.local",  # Next.js local env (highest priority)
    "vesto-app/.env",         # Next.js env
    ".env.local",              # Root local env
    ".env"                     # Root env
]:
    loaded = load_env_file(env_file)
    env_vars.update(loaded)  # Later files override earlier ones

# Set environment variables from loaded .env files
for key, value in env_vars.items():
    if key not in os.environ:  # Don't override existing env vars
        os.environ[key] = value

# ============================================================================
# CONFIGURATION
# ============================================================================

SEC_API_KEY = "5209b7194fd639dc532e347fef8cb8c82efb287592845d5616342d1a0f7d7481"
SEC_API_ENDPOINT = "https://api.sec-api.io/extractor"

# Supabase configuration (from environment variables or .env files)
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# The 7 sections to extract (as per requirements)
SECTIONS_TO_EXTRACT = {
    "1": {
        "code": "1",
        "name": "Business Description",
        "db_column": "section_1_business"
    },
    "1A": {
        "code": "1A",
        "name": "Risk Factors",
        "db_column": "section_1a_risk_factors"
    },
    "1C": {
        "code": "1C",
        "name": "Cybersecurity",
        "db_column": "section_1c_cybersecurity"
    },
    "7": {
        "code": "7",
        "name": "MD&A",
        "db_column": "section_7_mda"
    },
    "7A": {
        "code": "7A",
        "name": "Market Risk",
        "db_column": "section_7a_market_risk"
    },
    "8": {
        "code": "8",
        "name": "Financial Statements",
        "db_column": "section_8_financial_statements"
    },
    "9A": {
        "code": "9A",
        "name": "Controls and Procedures",
        "db_column": "section_9a_controls"
    }
}

# ============================================================================
# SUPABASE CLIENT
# ============================================================================

def get_supabase_client() -> Optional[Client]:
    """Create and return Supabase client."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("⚠️  WARNING: Supabase credentials not set. Data will not be saved to database.")
        print("   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
        return None
    
    try:
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"⚠️  ERROR creating Supabase client: {e}")
        return None

# ============================================================================
# SEC-API.IO EXTRACTION FUNCTIONS
# ============================================================================

def extract_section(filing_url: str, item: str, return_type: str = "text", max_retries: int = 3) -> Optional[str]:
    """
    Extract a specific section from a 10-K filing using sec-api.io.
    
    Args:
        filing_url: Full URL to the 10-K filing on SEC website
        item: Section item code (e.g., "1A" for Risk Factors)
        return_type: "text" for plain text, "html" for HTML format
        max_retries: Maximum number of retries if processing
    
    Returns:
        Extracted section content as string, or None if error
    
    API Credit Usage: 1 call per extraction
    """
    
    params = {
        "url": filing_url,
        "item": item,
        "type": return_type,
        "token": SEC_API_KEY
    }
    
    for attempt in range(max_retries):
        try:
            section_name = SECTIONS_TO_EXTRACT.get(item, {}).get("name", f"Item {item}")
            print(f"    Requesting item {item} ({section_name})...")
            
            response = requests.get(SEC_API_ENDPOINT, params=params, timeout=30)
            response.raise_for_status()
            
            content = response.text
            
            # Check if response is "processing" (common for recent filings)
            if content.strip().lower() == "processing":
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 0.5  # 0.5s, 1s, 1.5s
                    print(f"    ⏳ Processing... waiting {wait_time}s and retrying...")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"    ⚠️  Still processing after {max_retries} attempts. Section may not be available yet.")
                    return None
            
            # Check if section is empty
            if len(content.strip()) < 100:
                print(f"    ⚠️  Section appears to be empty or very short ({len(content)} chars)")
                return None
            
            print(f"    ✓ Extracted {len(content)} characters")
            return content
            
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"    ⚠️  API Error (attempt {attempt + 1}/{max_retries}): {e}")
                time.sleep(1)
                continue
            else:
                print(f"    ✗ API Error after {max_retries} attempts: {e}")
                return None
    
    return None

def extract_all_sections_for_company(symbol: str, filing_url: str, access_number: str = None, 
                                     filed_date: str = None) -> Dict[str, Any]:
    """
    Extract all 7 key sections from a company's 10-K filing.
    
    Args:
        symbol: Stock ticker (e.g., "AAPL")
        filing_url: Full URL to the 10-K filing
        access_number: SEC access number (optional)
        filed_date: Filing date (optional)
    
    Returns:
        Dictionary with extracted sections and metadata
    
    API Credit Usage: 7 calls (one per section)
    """
    
    print(f"\n{'='*80}")
    print(f"Extracting 10-K sections for {symbol}")
    print(f"{'='*80}")
    print(f"Filing URL: {filing_url}")
    print(f"Sections to extract: {len(SECTIONS_TO_EXTRACT)} sections")
    print()
    
    extracted_data = {
        "symbol": symbol,
        "filing_url": filing_url,
        "access_number": access_number,
        "filed_date": filed_date,
        "extracted_at": datetime.now().isoformat(),
        "sections": {},
        "sections_extracted": 0,
        "api_calls_made": 0,
        "errors": []
    }
    
    # Extract each section
    for item_code, section_info in SECTIONS_TO_EXTRACT.items():
        section_name = section_info["name"]
        
        # Extract as plain text (better for AI processing)
        content = extract_section(filing_url, item_code, return_type="text")
        extracted_data["api_calls_made"] += 1
        
        if content:
            extracted_data["sections"][item_code] = {
                "item_code": item_code,
                "section_name": section_name,
                "db_column": section_info["db_column"],
                "content": content,
                "content_length": len(content),
                "preview": content[:500] + "..." if len(content) > 500 else content
            }
            extracted_data["sections_extracted"] += 1
            print(f"    ✓ Item {item_code} ({section_name}) extracted successfully")
        else:
            extracted_data["sections"][item_code] = {
                "item_code": item_code,
                "section_name": section_name,
                "db_column": section_info["db_column"],
                "error": "Failed to extract or section empty"
            }
            extracted_data["errors"].append(f"Item {item_code} ({section_name})")
            print(f"    ✗ Item {item_code} ({section_name}) failed to extract")
        
        # Small delay between requests to be respectful
        time.sleep(0.5)
    
    # Determine extraction status
    if extracted_data["sections_extracted"] == len(SECTIONS_TO_EXTRACT):
        extracted_data["extraction_status"] = "completed"
    elif extracted_data["sections_extracted"] > 0:
        extracted_data["extraction_status"] = "partial"
    else:
        extracted_data["extraction_status"] = "failed"
    
    print(f"\n✓ Extraction complete: {extracted_data['sections_extracted']}/{len(SECTIONS_TO_EXTRACT)} sections")
    print(f"  API calls made: {extracted_data['api_calls_made']}")
    
    return extracted_data

# ============================================================================
# SUPABASE STORAGE FUNCTIONS
# ============================================================================

def get_company_id_from_symbol(supabase: Client, symbol: str) -> Optional[int]:
    """Get company_id from symbol."""
    try:
        result = supabase.table("companies").select("id").eq("symbol", symbol).limit(1).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
        return None
    except Exception as e:
        print(f"    ⚠️  Error getting company_id for {symbol}: {e}")
        return None

def parse_filed_date(filed_date: str) -> Optional[str]:
    """Parse filed_date string to YYYY-MM-DD format."""
    if not filed_date:
        return None
    
    try:
        # Handle various date formats
        if " " in filed_date:
            date_part = filed_date.split(" ")[0]
        else:
            date_part = filed_date
        
        # Try to parse
        dt = datetime.strptime(date_part, "%Y-%m-%d")
        return dt.strftime("%Y-%m-%d")
    except:
        return None

def extract_fiscal_year(filed_date: str, access_number: str = None) -> Optional[int]:
    """Extract fiscal year from filed_date or access_number."""
    if filed_date:
        try:
            dt = datetime.strptime(filed_date.split(" ")[0], "%Y-%m-%d")
            return dt.year
        except:
            pass
    
    # Try to extract from access number (format: 0000320193-25-000079, where 25 = 2025)
    if access_number and "-" in access_number:
        try:
            parts = access_number.split("-")
            if len(parts) >= 2:
                year_code = int(parts[1])
                # Convert 2-digit year code to 4-digit year
                if year_code < 50:
                    return 2000 + year_code
                else:
                    return 1900 + year_code
        except:
            pass
    
    return None

def store_in_supabase(supabase: Client, extracted_data: Dict[str, Any]) -> bool:
    """
    Store extracted 10-K sections in Supabase.
    
    Returns:
        True if successful, False otherwise
    """
    
    if not supabase:
        print("⚠️  Cannot store in Supabase: client not available")
        return False
    
    symbol = extracted_data["symbol"]
    print(f"\n📊 Storing data in Supabase for {symbol}...")
    
    try:
        # Get company_id
        company_id = get_company_id_from_symbol(supabase, symbol)
        if not company_id:
            print(f"    ⚠️  Company {symbol} not found in database. Skipping Supabase storage.")
            print(f"    💡 Tip: Run the Finnhub data loader first to populate companies table.")
            return False
        
        # Prepare data for insertion
        db_data = {
            "company_id": company_id,
            "symbol": symbol,
            "filing_url": extracted_data["filing_url"],
            "access_number": extracted_data.get("access_number"),
            "filed_date": parse_filed_date(extracted_data.get("filed_date")),
            "fiscal_year": extract_fiscal_year(
                extracted_data.get("filed_date"),
                extracted_data.get("access_number")
            ),
            "extraction_status": extracted_data.get("extraction_status", "completed"),
            "sections_extracted": extracted_data.get("sections_extracted", 0),
            "api_calls_used": extracted_data.get("api_calls_made", 0)
        }
        
        # Add section content
        for item_code, section_info in SECTIONS_TO_EXTRACT.items():
            section_data = extracted_data["sections"].get(item_code, {})
            if "content" in section_data:
                db_data[section_info["db_column"]] = section_data["content"]
        
        # Upsert (insert or update if exists)
        result = supabase.table("company_10k_sections").upsert(
            db_data,
            on_conflict="symbol,access_number"
        ).execute()
        
        if result.data:
            print(f"    ✓ Successfully stored in Supabase (id: {result.data[0].get('id')})")
            return True
        else:
            print(f"    ⚠️  No data returned from Supabase")
            return False
            
    except Exception as e:
        print(f"    ✗ Error storing in Supabase: {e}")
        return False

# ============================================================================
# INTEGRATION WITH FINNHUB DATA
# ============================================================================

# Manual fallback URLs for companies missing from Finnhub data
# You can add more here if needed
MANUAL_FILING_URLS = {
    # Add manual filing URLs here if Finnhub data is missing
    # Format: "SYMBOL": {"filing_url": "...", "access_number": "...", "filed_date": "..."}
    # Example:
    # "GOOGL": {
    #     "filing_url": "https://www.sec.gov/Archives/edgar/data/...",
    #     "access_number": "000...",
    #     "filed_date": "2024-..."
    # }
}

def get_filing_url_from_finnhub_data(symbol: str, 
                                     finnhub_data_file: str = "vesto_finnhub_20_companies.json") -> Optional[Dict[str, str]]:
    """
    Get the 10-K filing URL from previously extracted Finnhub data.
    
    First checks manual fallback URLs, then Finnhub data.
    
    Returns:
        Dictionary with filing_url, access_number, and filed_date, or None
    """
    # Check manual fallback first
    if symbol in MANUAL_FILING_URLS:
        print(f"✓ Using manual filing URL for {symbol}")
        return MANUAL_FILING_URLS[symbol]
    
    try:
        with open(finnhub_data_file, 'r') as f:
            data = json.load(f)
        
        company_data = data.get("companies", {}).get(symbol, {})
        filings = company_data.get("filings", {}).get("filings", [])
        
        if filings and len(filings) > 0:
            # Get the most recent 10-K filing
            latest_filing = filings[0]
            filing_url = latest_filing.get("reportUrl") or latest_filing.get("filingUrl")
            access_number = latest_filing.get("accessNumber")
            filed_date = latest_filing.get("filedDate")
            
            print(f"✓ Found 10-K filing for {symbol}")
            print(f"  Filed: {filed_date}")
            print(f"  Access Number: {access_number}")
            print(f"  URL: {filing_url}")
            
            return {
                "filing_url": filing_url,
                "access_number": access_number,
                "filed_date": filed_date
            }
        else:
            print(f"✗ No 10-K filings found for {symbol} in Finnhub data")
            print(f"  💡 Tip: Add manual URL in MANUAL_FILING_URLS or re-run Finnhub extractor")
            return None
            
    except Exception as e:
        print(f"✗ Error reading Finnhub data: {e}")
        return None

# ============================================================================
# MAIN EXTRACTION FUNCTIONS
# ============================================================================

def extract_single_company(symbol: str, test_mode: bool = False) -> Dict[str, Any]:
    """
    Extract 10-K sections for a single company.
    
    Args:
        symbol: Stock ticker
        test_mode: If True, only extract first section for testing
    
    Returns:
        Extracted data dictionary
    """
    
    print("\n" + "="*80)
    print(f"EXTRACTING 10-K SECTIONS FOR {symbol}")
    print("="*80)
    
    # Get filing URL from Finnhub data
    filing_info = get_filing_url_from_finnhub_data(symbol)
    
    if not filing_info:
        return {
            "symbol": symbol,
            "error": "No filing URL found",
            "api_calls_made": 0
        }
    
    # Extract sections
    if test_mode:
        # Test mode: only extract first section
        print("🧪 TEST MODE: Extracting only first section")
        sections_to_extract = {list(SECTIONS_TO_EXTRACT.keys())[0]: SECTIONS_TO_EXTRACT[list(SECTIONS_TO_EXTRACT.keys())[0]]}
        # Temporarily modify SECTIONS_TO_EXTRACT for this call
        original_sections = SECTIONS_TO_EXTRACT.copy()
        # This is a simplified version - in practice, you'd modify the extraction logic
        print("⚠️  Test mode not fully implemented - extracting all sections")
    
    extracted_data = extract_all_sections_for_company(
        symbol,
        filing_info["filing_url"],
        filing_info.get("access_number"),
        filing_info.get("filed_date")
    )
    
    # Store in Supabase
    supabase = get_supabase_client()
    if supabase:
        store_in_supabase(supabase, extracted_data)
    else:
        # Save to JSON as fallback
        output_file = f"sec_api_extracted_{symbol}.json"
        with open(output_file, 'w') as f:
            json.dump(extracted_data, f, indent=2)
        print(f"\n💾 Saved to JSON file: {output_file}")
    
    return extracted_data

def extract_multiple_companies(symbols: List[str], max_companies: int = 10) -> Dict[str, Any]:
    """
    Extract 10-K sections for multiple companies.
    
    Args:
        symbols: List of stock tickers
        max_companies: Maximum number of companies to process
    
    Returns:
        Dictionary with results for all companies
    """
    
    print("\n" + "="*80)
    print("EXTRACTING 10-K SECTIONS FOR MULTIPLE COMPANIES")
    print("="*80)
    print(f"Companies: {', '.join(symbols[:max_companies])}")
    print(f"Total API calls expected: {len(symbols[:max_companies]) * 7}")
    print()
    
    all_results = {}
    total_api_calls = 0
    supabase = get_supabase_client()
    
    for i, symbol in enumerate(symbols[:max_companies], 1):
        print(f"\n[{i}/{len(symbols[:max_companies])}] Processing {symbol}...")
        
        # Get filing info
        filing_info = get_filing_url_from_finnhub_data(symbol)
        
        if not filing_info:
            all_results[symbol] = {
                "symbol": symbol,
                "error": "No filing URL found",
                "api_calls_made": 0
            }
            continue
        
        # Extract sections
        extracted_data = extract_all_sections_for_company(
            symbol,
            filing_info["filing_url"],
            filing_info.get("access_number"),
            filing_info.get("filed_date")
        )
        
        all_results[symbol] = extracted_data
        total_api_calls += extracted_data.get("api_calls_made", 0)
        
        # Store in Supabase
        if supabase:
            store_in_supabase(supabase, extracted_data)
        
        # Delay between companies
        if i < len(symbols[:max_companies]):
            time.sleep(1)
    
    # Save summary to JSON
    summary = {
        "extracted_at": datetime.now().isoformat(),
        "total_companies": len(all_results),
        "total_api_calls": total_api_calls,
        "results": all_results
    }
    
    output_file = "sec_api_extracted_all_companies.json"
    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n" + "="*80)
    print("EXTRACTION COMPLETE")
    print("="*80)
    print(f"✓ Companies processed: {len(all_results)}")
    print(f"✓ Total API calls made: {total_api_calls}")
    print(f"✓ Results saved to: {output_file}")
    if supabase:
        print(f"✓ Data stored in Supabase")
    else:
        print(f"⚠️  Data NOT stored in Supabase (credentials missing)")
    
    return summary

# ============================================================================
# DEMO EXECUTION
# ============================================================================

if __name__ == "__main__":
    """
    Main execution script.
    
    Usage:
        python vesto_sec_api_extractor.py
    """
    
    print("\n" + "="*80)
    print("VESTO SEC-API.IO 10-K EXTRACTOR")
    print("="*80)
    print("\nExtracting 7 highest-leverage sections from 10-K filings")
    print("Sections: 1, 1A, 1C, 7, 7A, 8, 9A")
    print("\nAPI Credit Usage: 7 calls per company")
    print("="*80)
    
    # Get list of companies from Finnhub data
    try:
        with open("vesto_finnhub_20_companies.json", 'r') as f:
            finnhub_data = json.load(f)
        
        companies = list(finnhub_data.get("companies", {}).keys())
        print(f"\n✓ Found {len(companies)} companies in Finnhub data")
        print(f"  Companies: {', '.join(companies[:10])}")
        
        # Extract for first 10 companies (70 API calls)
        print(f"\n▶ Extracting for first 10 companies...")
        extract_multiple_companies(companies, max_companies=10)
        
    except FileNotFoundError:
        print("\n⚠️  Finnhub data file not found. Testing with single company (AAPL)...")
        extract_single_company("AAPL")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

