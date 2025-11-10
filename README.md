# Vesto - Financial Literacy Platform

## 🎯 MVP Status: Complete

A Next.js 14 application that teaches financial analysis through AI-powered interactive modules and a stock simulator.

### ✅ What's Built (Ready to Use)
- Complete Next.js 14 application with TypeScript
- Supabase database schema (11 tables)
- Gemini AI integration for grading (5 criteria, 100-point scale)
- API routes for all features
- Landing page, Learn overview, Simulator, Account pages
- Mock data for 20 companies
- UI components with shadcn/ui


## 📚 Quick Start

```bash
cd vesto-app
npm install
npm run dev
```

See **QUICK_START.md** for detailed setup instructions.
See **IMPLEMENTATION_SUMMARY.md** for complete technical details.

## 📁 Key Files

- `/vesto-app` - Main Next.js application
- `/vesto_finnhub_20_companies.json` - Extracted company data
- `/vesto_finnhub_extractor.py` - Data extraction script
- `/QUICK_START.md` - Setup instructions
- `/IMPLEMENTATION_SUMMARY.md` - Technical documentation

---

## Original Requirements

High-Level Features:
Learn 10-Ks through modules where AI generates questions based on real company numbers, these questions should make users apply skills how they would in real market research

Modules:
Basic Fundamentals: P/E ratio, EBITDA, DCF, D/E ratio, etc (EASY)
10k Report: Business & Risk factors (Intermediate → advanced)
10k Reports: Financial Statements (Intermediate → advanced)
Competitive analysis, Moats, market share analysis (Intermediate → advanced)
10k comparative analysis (Expert)

Difficulties:
Easy - simple calculations and definitions
Intermediate: Real 10-K excerpts with guided questions
Advanced: analysis with minimal guidance - graded with AI
Expert: Comparative analysis, thesis building - graded by AGENTIC AI
