#!/usr/bin/env python3
"""
Quick script to check if Supabase environment variables are set.
"""

import os

def load_env_file(filepath: str) -> dict:
    """Load environment variables from a .env file."""
    env_vars = {}
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
        except Exception as e:
            print(f"⚠️  Warning: Could not read {filepath}: {e}")
    return env_vars

# Check all possible .env file locations
env_files = [
    "vesto-app/.env.local",
    "vesto-app/.env",
    ".env.local",
    ".env"
]

print("=" * 80)
print("CHECKING SUPABASE ENVIRONMENT VARIABLES")
print("=" * 80)
print()

# Load from .env files
env_vars = {}
for env_file in env_files:
    loaded = load_env_file(env_file)
    if loaded:
        print(f"✓ Found: {env_file}")
        env_vars.update(loaded)
    else:
        print(f"✗ Not found: {env_file}")

print()

# Check required variables
required_vars = {
    "NEXT_PUBLIC_SUPABASE_URL": "Supabase Project URL",
    "SUPABASE_SERVICE_ROLE_KEY": "Supabase Service Role Key"
}

print("Environment Variable Status:")
print("-" * 80)

all_set = True
for var_name, description in required_vars.items():
    # Check in loaded env vars first, then system environment
    value = env_vars.get(var_name) or os.getenv(var_name)
    
    if value:
        # Show first/last few chars for verification
        if len(value) > 20:
            display_value = f"{value[:10]}...{value[-10:]}"
        else:
            display_value = "***SET***"
        print(f"✓ {var_name}")
        print(f"  Description: {description}")
        print(f"  Value: {display_value}")
        print(f"  Source: {'Loaded from .env file' if var_name in env_vars else 'System environment'}")
    else:
        print(f"✗ {var_name} - NOT SET")
        print(f"  Description: {description}")
        all_set = False
    print()

print("=" * 80)
if all_set:
    print("✅ All required environment variables are set!")
    print("\nYou can run: python3 vesto_sec_api_extractor.py")
else:
    print("⚠️  Some environment variables are missing!")
    print("\nTo set them:")
    print("1. Edit vesto-app/.env.local or vesto-app/.env")
    print("2. Or export them in your shell:")
    print("   export NEXT_PUBLIC_SUPABASE_URL='your-url'")
    print("   export SUPABASE_SERVICE_ROLE_KEY='your-key'")
print("=" * 80)

