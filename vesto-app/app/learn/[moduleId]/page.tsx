'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MODULES } from '@/types';
import { get10KNarrative } from '@/lib/mock-data/10k-narratives';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';

const MODULE_CONTENT: Record<string, any> = {
  'module-1': {
    title: 'Basic Fundamentals',
    lesson: `Understanding financial fundamentals is crucial for analyzing any company. Let's explore the key metrics that investors use to evaluate businesses.

**P/E Ratio (Price-to-Earnings)**: This shows how much investors are willing to pay per dollar of earnings. A P/E of 25 means investors pay $25 for every $1 of annual earnings. Higher P/E ratios often indicate growth expectations, but can also signal overvaluation.

**EBITDA**: Earnings Before Interest, Taxes, Depreciation, and Amortization. This measures a company's operating profitability before accounting decisions and tax structures affect the numbers. It's useful for comparing companies across different tax jurisdictions.

**ROE (Return on Equity)**: Shows how efficiently a company uses shareholder equity to generate profits. ROE = Net Income / Shareholder Equity. A higher ROE generally indicates better management efficiency.

**D/E Ratio (Debt-to-Equity)**: Measures financial leverage by comparing total debt to shareholder equity. High D/E ratios can indicate higher risk but also potential for higher returns.

**Key Insight**: No single metric tells the whole story. Analysts compare multiple metrics and consider industry context, growth trends, and competitive positioning.`,
    
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'If Company A has a P/E ratio of 35 and Company B has a P/E ratio of 15, what does this typically suggest?',
        options: [
          { label: 'A', text: 'Company A is cheaper than Company B' },
          { label: 'B', text: 'Investors expect higher growth from Company A' },
          { label: 'C', text: 'Company B is more profitable than Company A' },
          { label: 'D', text: 'Company A has more debt than Company B' }
        ],
        correctAnswer: 'B',
        explanation: 'A higher P/E ratio typically indicates that investors expect higher future growth from the company, making them willing to pay more per dollar of current earnings.'
      },
      {
        id: 2,
        type: 'mcq',
        question: 'EBITDA is useful for comparing companies because it:',
        options: [
          { label: 'A', text: 'Includes all expenses to show true profitability' },
          { label: 'B', text: 'Eliminates the impact of different tax structures and accounting methods' },
          { label: 'C', text: 'Shows cash flow directly' },
          { label: 'D', text: 'Is always higher than net income' }
        ],
        correctAnswer: 'B',
        explanation: 'EBITDA removes interest, taxes, depreciation, and amortization, making it easier to compare operating profitability across companies with different capital structures and tax situations.'
      },
      {
        id: 3,
        type: 'mcq',
        question: 'A company with a ROE of 25% and a D/E ratio of 0.5 is likely:',
        options: [
          { label: 'A', text: 'Highly leveraged and risky' },
          { label: 'B', text: 'Efficiently using equity with moderate leverage' },
          { label: 'C', text: 'Not using debt effectively' },
          { label: 'D', text: 'Overvalued' }
        ],
        correctAnswer: 'B',
        explanation: 'A ROE of 25% indicates strong profitability, while a D/E of 0.5 shows moderate, manageable leverage. This combination suggests efficient use of both equity and debt.'
      },
      {
        id: 4,
        type: 'mcq',
        question: 'Which statement about P/E ratios is FALSE?',
        options: [
          { label: 'A', text: 'P/E ratios should be compared within the same industry' },
          { label: 'B', text: 'A high P/E always means a stock is overvalued' },
          { label: 'C', text: 'P/E ratios can vary based on growth expectations' },
          { label: 'D', text: 'Negative P/E ratios indicate the company is losing money' }
        ],
        correctAnswer: 'B',
        explanation: 'A high P/E ratio doesn\'t always mean overvaluation. It could reflect strong growth prospects, competitive advantages, or market confidence. Context and comparison to peers are essential.'
      },
      {
        id: 5,
        type: 'mcq',
        question: 'What does a D/E ratio of 2.0 indicate?',
        options: [
          { label: 'A', text: 'The company has twice as much equity as debt' },
          { label: 'B', text: 'The company has twice as much debt as equity' },
          { label: 'C', text: 'The company has equal debt and equity' },
          { label: 'D', text: 'The company has no debt' }
        ],
        correctAnswer: 'B',
        explanation: 'A D/E ratio of 2.0 means the company has $2 of debt for every $1 of equity, indicating higher leverage and potentially higher financial risk.'
      },
      {
        id: 6,
        type: 'written',
        question: 'Explain the relationship between ROE, ROA, and financial leverage. How does debt affect these ratios? Use your selected company as an example to illustrate these concepts.',
        guidance: 'Describe how ROE = ROA × Equity Multiplier, and explain how using debt can amplify returns but also increase risk. Use your selected company\'s actual metrics as examples.'
      },
      {
        id: 7,
        type: 'written',
        question: 'Analyze the financial metrics for your selected company. Discuss their P/E ratio, profitability metrics (ROE/ROA), and debt levels. Are these metrics attractive for investment? Consider both the absolute values and what they suggest about the company\'s financial health.',
        guidance: 'Your answer should cite specific numbers from your selected company, compare them to reasonable benchmarks, and explain what these metrics reveal about the company\'s valuation, profitability, and risk profile.'
      }
    ]
  },
  
  'module-2': {
    title: '10-K: Business & Risk Factors',
    lesson: `The Business Description and Risk Factors sections of a 10-K report provide crucial qualitative information about a company.

**Business Description Section**: This describes what the company does, its products/services, target markets, competitive advantages, and business model. Look for:
- Revenue streams and their relative importance
- Competitive positioning and market share
- Key partnerships and distribution channels
- Growth strategies and market opportunities

**Risk Factors Section**: Companies must disclose material risks that could affect their business. Common risks include:
- **Competition risks**: New entrants, pricing pressure, loss of market share
- **Regulatory risks**: Changing laws, compliance costs, potential fines
- **Operational risks**: Supply chain disruptions, key customer concentration
- **Market risks**: Economic downturns, currency fluctuations, interest rates

**Critical Analysis**: Don't just read the risks - evaluate their likelihood and potential impact. Compare how companies in the same industry describe similar risks. More specific, detailed risk disclosures often indicate better management awareness.`,
    
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'When analyzing risk factors in a 10-K, which approach provides the most valuable insight?',
        options: [
          { label: 'A', text: 'Counting the total number of risk factors listed' },
          { label: 'B', text: 'Evaluating the specificity and severity of disclosed risks' },
          { label: 'C', text: 'Only focusing on financial risks' },
          { label: 'D', text: 'Assuming all risks are equally important' }
        ],
        correctAnswer: 'B',
        explanation: 'The quality and specificity of risk disclosures matter more than quantity. Detailed, specific risks indicate management is aware of real challenges, while generic risks may hide important issues.'
      },
      {
        id: 2,
        type: 'mcq',
        question: 'A company\'s business description section should help you understand:',
        options: [
          { label: 'A', text: 'Only what products they sell' },
          { label: 'B', text: 'Revenue streams, competitive position, and business model' },
          { label: 'C', text: 'Only their financial performance' },
          { label: 'D', text: 'Only their future plans' }
        ],
        correctAnswer: 'B',
        explanation: 'The business description provides comprehensive information about how the company makes money, its competitive advantages, market position, and overall business strategy.'
      },
      {
        id: 3,
        type: 'mcq',
        question: 'Which type of risk is LEAST likely to be disclosed in a 10-K?',
        options: [
          { label: 'A', text: 'Regulatory risks from changing laws' },
          { label: 'B', text: 'Competition from new market entrants' },
          { label: 'C', text: 'Specific future product launch dates' },
          { label: 'D', text: 'Supply chain disruptions' }
        ],
        correctAnswer: 'C',
        explanation: 'Companies disclose risks but typically don\'t reveal specific future product launch dates in risk factors, as this is forward-looking information that could be considered material non-public information.'
      },
      {
        id: 4,
        type: 'mcq',
        question: 'A company that provides very generic, boilerplate risk factors is likely:',
        options: [
          { label: 'A', text: 'Very safe with no real risks' },
          { label: 'B', text: 'Either hiding real risks or not properly analyzing them' },
          { label: 'C', text: 'Following best practices' },
          { label: 'D', text: 'Required by law to be vague' }
        ],
        correctAnswer: 'B',
        explanation: 'Generic risk factors may indicate poor risk management or an attempt to hide specific vulnerabilities. Well-managed companies typically provide detailed, specific risk disclosures.'
      },
      {
        id: 5,
        type: 'mcq',
        question: 'When evaluating competitive risks, you should look for:',
        options: [
          { label: 'A', text: 'Only the number of competitors mentioned' },
          { label: 'B', text: 'Specific competitive threats, market share trends, and pricing pressures' },
          { label: 'C', text: 'Only positive statements about competition' },
          { label: 'D', text: 'Only financial metrics' }
        ],
        correctAnswer: 'B',
        explanation: 'Effective competitive risk analysis requires understanding specific threats, market dynamics, pricing pressures, and how the company positions itself against competitors.'
      },
      {
        id: 6,
        type: 'written',
        question: 'Compare the risk factors section of your selected company to a competitor. What differences do you notice in how they describe similar risks? What does this tell you about each company\'s risk management?',
        guidance: 'Focus on how specific and detailed each company is in describing risks. Consider whether one company seems more aware of challenges or better at communicating them. Make sure to clearly identify your selected company and the competitor you\'re comparing it to.'
      },
      {
        id: 7,
        type: 'written',
        question: 'Based on the business description and risk factors for your selected company, evaluate their competitive position and major risks. Identify the top 3 risks and assess whether management has competitive advantages that might mitigate these risks.',
        guidance: 'Cite specific details from your selected company\'s business description and risk factors. Explain why certain risks are more significant than others and how the company\'s business model addresses or is vulnerable to these risks.'
      }
    ]
  },
  
  'module-3': {
    title: '10-K: Financial Statements',
    lesson: `Financial statements are the quantitative heart of a 10-K report. Three core statements work together to show a company's financial health.

**Balance Sheet**: Shows what a company owns (assets), owes (liabilities), and the difference (equity) at a specific point in time.
- Current Ratio = Current Assets / Current Liabilities (measures short-term liquidity)
- Look for trends in working capital and debt levels

**Income Statement**: Shows revenue, expenses, and profit over a period.
- Gross Margin = (Revenue - COGS) / Revenue (shows pricing power)
- Operating Margin = Operating Income / Revenue (shows operational efficiency)
- Track revenue growth and margin trends

**Cash Flow Statement**: Shows actual cash movements, which can differ from accounting profits.
- Operating Cash Flow shows cash from core business
- Free Cash Flow = Operating Cash Flow - CapEx (cash available after investments)
- Healthy companies generate consistent positive operating cash flow

**Key Analysis Points**:
- Revenue growth alone isn't enough - check if it's profitable growth
- Compare margins to competitors to assess competitive position
- Cash flow is harder to manipulate than accounting earnings
- Look for discrepancies between profits and cash flow`,
    
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'A company reports strong net income growth but declining operating cash flow. What is the most likely explanation?',
        options: [
          { label: 'A', text: 'The company is very profitable' },
          { label: 'B', text: 'Revenue growth is being driven by extended credit terms' },
          { label: 'C', text: 'The company has too much cash' },
          { label: 'D', text: 'Operating expenses are too low' }
        ],
        correctAnswer: 'B',
        explanation: 'When earnings grow but cash flow declines, it often indicates aggressive revenue recognition, extended payment terms to customers, or inventory buildup - all concerning signs about quality of earnings.'
      },
      {
        id: 2,
        type: 'mcq',
        question: 'The balance sheet shows:',
        options: [
          { label: 'A', text: 'A company\'s financial position at a specific point in time' },
          { label: 'B', text: 'Revenue and expenses over a period' },
          { label: 'C', text: 'Cash movements over time' },
          { label: 'D', text: 'Only assets' }
        ],
        correctAnswer: 'A',
        explanation: 'The balance sheet is a snapshot showing assets, liabilities, and equity at a specific date, while income and cash flow statements show changes over time periods.'
      },
      {
        id: 3,
        type: 'mcq',
        question: 'A current ratio of 0.8 indicates:',
        options: [
          { label: 'A', text: 'The company has strong liquidity' },
          { label: 'B', text: 'The company may struggle to pay short-term obligations' },
          { label: 'C', text: 'The company has no current liabilities' },
          { label: 'D', text: 'The company is highly profitable' }
        ],
        correctAnswer: 'B',
        explanation: 'A current ratio below 1.0 means current liabilities exceed current assets, indicating potential liquidity problems and difficulty meeting short-term obligations.'
      },
      {
        id: 4,
        type: 'mcq',
        question: 'Free Cash Flow is calculated as:',
        options: [
          { label: 'A', text: 'Operating Cash Flow - Capital Expenditures' },
          { label: 'B', text: 'Net Income - Dividends' },
          { label: 'C', text: 'Revenue - Expenses' },
          { label: 'D', text: 'Total Cash - Total Debt' }
        ],
        correctAnswer: 'A',
        explanation: 'Free Cash Flow represents cash available after maintaining or expanding asset base. It\'s Operating Cash Flow minus Capital Expenditures, showing cash available for dividends, buybacks, or debt reduction.'
      },
      {
        id: 5,
        type: 'mcq',
        question: 'If gross margin is declining while revenue is growing, this suggests:',
        options: [
          { label: 'A', text: 'The company is becoming more efficient' },
          { label: 'B', text: 'Pricing pressure or rising costs are squeezing profitability' },
          { label: 'C', text: 'The company has no competition' },
          { label: 'D', text: 'The company is gaining market share' }
        ],
        correctAnswer: 'B',
        explanation: 'Declining gross margins typically indicate competitive pricing pressure, rising input costs, or a shift to lower-margin products, even if revenue is growing.'
      },
      {
        id: 6,
        type: 'mcq',
        question: 'Which statement about the income statement is TRUE?',
        options: [
          { label: 'A', text: 'It shows cash movements' },
          { label: 'B', text: 'It uses accrual accounting, so revenue may not equal cash received' },
          { label: 'C', text: 'It only shows assets and liabilities' },
          { label: 'D', text: 'It is always the same as cash flow' }
        ],
        correctAnswer: 'B',
        explanation: 'The income statement uses accrual accounting, recognizing revenue when earned (not necessarily when cash is received) and expenses when incurred, which can differ significantly from actual cash flows.'
      },
      {
        id: 7,
        type: 'written',
        question: 'Explain the difference between operating cash flow and free cash flow. Why is free cash flow important for investors? Use your selected company\'s financial statements to illustrate these concepts.',
        guidance: 'Describe what each metric represents, how they differ, and why free cash flow is a key indicator of a company\'s financial health and ability to return value to shareholders. Reference your selected company\'s actual cash flow data.'
      },
      {
        id: 8,
        type: 'written',
        question: 'Analyze your selected company\'s financial statements. Evaluate their revenue growth, profitability margins (gross and operating), and cash flow generation. Is the company generating profitable growth? Are there any concerning trends in the relationships between revenue, profit, and cash flow?',
        guidance: 'Use specific numbers and percentages. Compare margins to prior periods and industry averages if possible. Discuss whether the business model generates strong cash conversion from profits.'
      }
    ]
  },
  
  'module-4': {
    title: 'Competitive Analysis & Moats',
    lesson: `A company's competitive advantages ("moats") determine its ability to maintain profitability over time.

**Types of Economic Moats**:

1. **Network Effects**: Product becomes more valuable as more people use it (e.g., social media, payment networks)
2. **Switching Costs**: High cost or difficulty for customers to switch to competitors (e.g., enterprise software, bank accounts)
3. **Cost Advantages**: Ability to produce at lower cost than competitors (e.g., scale economies, proprietary technology)
4. **Intangible Assets**: Brand power, patents, regulatory licenses that competitors can't easily replicate
5. **Scale Economies**: Lower per-unit costs as volume increases

**Evaluating Moat Strength**:
- Stable or expanding profit margins over 5-10 years
- High returns on invested capital (ROIC > 15%)
- Pricing power (ability to raise prices without losing customers)
- Market share trends in core markets
- Barriers to entry for new competitors

**Competitive Risks**:
- Technology disruption
- Changing customer preferences
- Regulatory changes
- Market saturation
- Competitors' responses

**Analysis Framework**: A sustainable competitive advantage should explain why the company maintains high returns despite competition. Look for evidence in financial metrics, not just management claims.`,
    
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Which metric is the best indicator that a company has a durable competitive advantage?',
        options: [
          { label: 'A', text: 'High revenue growth in the most recent quarter' },
          { label: 'B', text: 'Consistently high return on invested capital over 10+ years' },
          { label: 'C', text: 'Large market capitalization' },
          { label: 'D', text: 'Low employee turnover' }
        ],
        correctAnswer: 'B',
        explanation: 'Consistently high ROIC over many years indicates the company can generate strong returns despite competition, suggesting a durable competitive advantage. Short-term metrics or size alone don\'t prove sustainable advantages.'
      },
      {
        id: 2,
        type: 'mcq',
        question: 'Network effects occur when:',
        options: [
          { label: 'A', text: 'A company has many employees' },
          { label: 'B', text: 'A product becomes more valuable as more people use it' },
          { label: 'C', text: 'A company operates in multiple countries' },
          { label: 'D', text: 'A company has many suppliers' }
        ],
        correctAnswer: 'B',
        explanation: 'Network effects create a competitive moat where the value of a product or service increases with each additional user, making it harder for competitors to gain traction.'
      },
      {
        id: 3,
        type: 'mcq',
        question: 'Switching costs are highest for:',
        options: [
          { label: 'A', text: 'Commodity products with many alternatives' },
          { label: 'B', text: 'Products that require significant time, money, or effort to replace' },
          { label: 'C', text: 'Products that are easily replaceable' },
          { label: 'D', text: 'Products with no learning curve' }
        ],
        correctAnswer: 'B',
        explanation: 'High switching costs create a moat by making it expensive or difficult for customers to switch to competitors, often due to integration, training, or data migration requirements.'
      },
      {
        id: 4,
        type: 'mcq',
        question: 'A company with stable or expanding profit margins over 10 years likely has:',
        options: [
          { label: 'A', text: 'No competition' },
          { label: 'B', text: 'A sustainable competitive advantage protecting pricing power' },
          { label: 'C', text: 'Rising costs that are being passed to customers' },
          { label: 'D', text: 'Declining market share' }
        ],
        correctAnswer: 'B',
        explanation: 'Maintaining or expanding margins over long periods despite competition suggests strong competitive advantages, pricing power, or cost advantages that protect profitability.'
      },
      {
        id: 5,
        type: 'mcq',
        question: 'Which is NOT a type of economic moat?',
        options: [
          { label: 'A', text: 'Network effects' },
          { label: 'B', text: 'Cost advantages from scale' },
          { label: 'C', text: 'High stock price' },
          { label: 'D', text: 'Intangible assets like patents or brand' }
        ],
        correctAnswer: 'C',
        explanation: 'A high stock price is a valuation metric, not a competitive advantage. Moats are structural advantages like network effects, cost advantages, switching costs, or intangible assets.'
      },
      {
        id: 6,
        type: 'written',
        question: 'Explain how a company can have a cost advantage moat. What factors create sustainable cost advantages, and how can you identify them in financial statements?',
        guidance: 'Discuss economies of scale, proprietary technology, access to resources, and other cost advantages. Explain how these might show up in gross margins, operating margins, or ROIC metrics.'
      },
      {
        id: 7,
        type: 'written',
        question: 'Identify and analyze the competitive moats for your selected company. What type of moat do they possess (network effects, switching costs, cost advantages, brand, etc.)? Is this moat sustainable or at risk? Support your analysis with evidence from their business model, market position, and financial performance.',
        guidance: 'Be specific about the type of moat and provide concrete evidence. Consider potential threats to the moat and whether competitive advantages are strengthening or weakening. Use margin trends and market share as supporting evidence.'
      }
    ]
  },
  
  'module-5': {
    title: 'Expert: Comparative Analysis',
    lesson: `Comparative analysis synthesizes everything you've learned to evaluate companies against each other.

**Framework for Comparison**:

1. **Business Quality**:
   - Which business model is more attractive?
   - Who has stronger competitive advantages?
   - Which faces less disruption risk?

2. **Financial Performance**:
   - Revenue growth rates and sustainability
   - Margin profiles and trends
   - Cash generation efficiency
   - Balance sheet strength

3. **Valuation**:
   - P/E ratios relative to growth (PEG ratio)
   - EV/EBITDA for capital-intensive businesses
   - Price/Sales for high-growth companies
   - Are higher valuations justified by superior metrics?

4. **Risk Assessment**:
   - Competitive threats
   - Regulatory exposure
   - Financial leverage
   - Execution risks

**Making the Decision**:
- Better business + reasonable valuation often beats cheaper but inferior business
- Consider margin of safety in valuation
- Weight qualitative factors (moats, management) with quantitative metrics
- Think about 3-5 year outlook, not just current metrics

**Common Pitfalls**:
- Focusing only on valuation without considering quality
- Extrapolating recent trends indefinitely
- Ignoring balance sheet risks
- Not considering whether growth is profitable`,
    
    questions: [
      {
        id: 1,
        type: 'mcq',
        question: 'Company A trades at P/E of 30 with 25% revenue growth and 40% margins. Company B trades at P/E of 15 with 5% growth and 20% margins. Which statement is most accurate?',
        options: [
          { label: 'A', text: 'Company B is clearly cheaper and better value' },
          { label: 'B', text: 'Company A is overvalued due to high P/E ratio' },
          { label: 'C', text: 'Company A\'s higher valuation may be justified by superior growth and margins' },
          { label: 'D', text: 'P/E ratios cannot be compared across companies' }
        ],
        correctAnswer: 'C',
        explanation: 'Valuation must be considered relative to quality. Company A\'s 5x higher growth rate and 2x better margins could justify a 2x higher P/E ratio. Quality businesses often deserve premium valuations.'
      },
      {
        id: 2,
        type: 'mcq',
        question: 'The PEG ratio (P/E divided by growth rate) helps evaluate:',
        options: [
          { label: 'A', text: 'Only the P/E ratio' },
          { label: 'B', text: 'Valuation relative to growth expectations' },
          { label: 'C', text: 'Only profitability' },
          { label: 'D', text: 'Only debt levels' }
        ],
        correctAnswer: 'B',
        explanation: 'PEG ratio adjusts P/E for growth rate, helping determine if a stock is fairly valued relative to its growth prospects. A PEG below 1.0 may indicate undervaluation relative to growth.'
      },
      {
        id: 3,
        type: 'mcq',
        question: 'When comparing two companies, you should prioritize:',
        options: [
          { label: 'A', text: 'Only the cheaper valuation' },
          { label: 'B', text: 'Only the highest growth rate' },
          { label: 'C', text: 'A combination of business quality, financial performance, and reasonable valuation' },
          { label: 'D', text: 'Only the largest market cap' }
        ],
        correctAnswer: 'C',
        explanation: 'Effective comparative analysis requires evaluating business quality, competitive advantages, financial performance, and valuation together. The best investment often balances quality with reasonable price.'
      },
      {
        id: 4,
        type: 'mcq',
        question: 'A margin of safety in valuation means:',
        options: [
          { label: 'A', text: 'Buying at any price' },
          { label: 'B', text: 'Buying at a discount to estimated intrinsic value to account for uncertainty' },
          { label: 'C', text: 'Only buying the cheapest stock' },
          { label: 'D', text: 'Ignoring valuation entirely' }
        ],
        correctAnswer: 'B',
        explanation: 'A margin of safety provides a buffer against estimation errors and unexpected challenges, buying below estimated fair value to protect against downside risk.'
      },
      {
        id: 5,
        type: 'mcq',
        question: 'EV/EBITDA is particularly useful for comparing:',
        options: [
          { label: 'A', text: 'Only tech companies' },
          { label: 'B', text: 'Capital-intensive businesses with different debt levels' },
          { label: 'C', text: 'Only profitable companies' },
          { label: 'D', text: 'Only small companies' }
        ],
        correctAnswer: 'B',
        explanation: 'EV/EBITDA normalizes for capital structure differences, making it useful for comparing companies with varying debt levels, especially in capital-intensive industries.'
      },
      {
        id: 6,
        type: 'mcq',
        question: 'When a high-quality business trades at a premium valuation, it may still be attractive if:',
        options: [
          { label: 'A', text: 'It\'s always a bad investment' },
          { label: 'B', text: 'The premium is justified by superior growth, margins, and competitive advantages' },
          { label: 'C', text: 'It has high debt' },
          { label: 'D', text: 'It has declining revenue' }
        ],
        correctAnswer: 'B',
        explanation: 'Quality businesses with strong competitive advantages, superior growth, and high returns on capital often deserve premium valuations. The key is whether the premium is justified by fundamentals.'
      },
      {
        id: 7,
        type: 'written',
        question: 'Explain the concept of "margin of safety" in investment analysis. How would you apply this when comparing two investment opportunities?',
        guidance: 'Define margin of safety, explain why it matters, and describe how you would use it to make investment decisions when comparing companies with different valuations and quality levels.'
      },
      {
        id: 8,
        type: 'written',
        question: 'Compare your selected company to one of its major competitors. Analyze both companies across business model, competitive positioning, financial metrics (growth, margins, ROIC), and valuation. Which company represents the better investment opportunity and why? Consider both the quality of the business and the price you\'re paying.',
        guidance: 'This is expert-level analysis. Provide a balanced view covering qualitative factors (business quality, moats, risks) and quantitative metrics (growth, profitability, valuation). Make a clear recommendation with supporting reasoning. Your analysis should demonstrate synthesis of all concepts from previous modules.'
      }
    ]
  }
};

// Mock company data for selection
const COMPANIES = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

export default function ModulePage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  
  const module = MODULES.find(m => m.id === moduleId);
  const content = MODULE_CONTENT[moduleId];
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'select' | 'lesson' | 'questions'>('select');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const saveInProgressRef = useRef(false);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    }
    getUser();
  }, []);

  // Calculate valid completions (only correct MCQ and written answers with score >= 70)
  const getValidCompletions = (currentFeedback: Record<number, any>) => {
    let validCount = 0;
    
    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = customizedQuestions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          // Only count if correct
          if (fb.isCorrect) {
            validCount++;
          }
        } else if (question.type === 'written') {
          // Only count if score >= 70
          if (fb.overall_score !== undefined && fb.overall_score >= 70) {
            validCount++;
          }
        }
      }
    });
    
    return validCount;
  };

  // Calculate wrong answers (incorrect MCQ or written with score < 70)
  const getWrongAnswers = (currentFeedback: Record<number, any>) => {
    let wrongCount = 0;
    
    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = customizedQuestions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          // Count if incorrect
          if (fb.isCorrect === false) {
            wrongCount++;
          }
        } else if (question.type === 'written') {
          // Count if score < 70
          if (fb.overall_score !== undefined && fb.overall_score < 70) {
            wrongCount++;
          }
        }
      }
    });
    
    return wrongCount;
  };

  // Function to save progress to database using API route for better reliability
  const saveProgress = async (currentFeedback: Record<number, any>, totalQuestions: number) => {
    if (!userId || saveInProgressRef.current) {
      console.warn('Cannot save progress: userId missing or save in progress', { userId, saveInProgress: saveInProgressRef.current });
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);

    // Count only valid completions (correct MCQ or written with score >= 70)
    const validCompletions = getValidCompletions(currentFeedback);
    const completionPercentage = validCompletions === totalQuestions ? 100 : Math.round((validCompletions / totalQuestions) * 100);
    
    // Calculate correct answers and average score
    let correctAnswers = 0;
    let totalScore = 0;
    let scoredCount = 0;

    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = customizedQuestions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          if (fb.isCorrect) correctAnswers++;
        } else if (question.type === 'written' && fb.overall_score !== undefined) {
          totalScore += fb.overall_score;
          scoredCount++;
          // Written answers scoring 70+ are considered correct
          if (fb.overall_score >= 70) correctAnswers++;
        }
      }
    });

    const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;
    const status = completionPercentage === 100 ? 'completed' : completionPercentage > 0 ? 'in_progress' : 'not_started';

    try {
      // First, verify user is authenticated
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('User not authenticated:', authError);
        throw new Error('User not authenticated');
      }

      if (user.id !== userId) {
        console.error('User ID mismatch:', { expected: userId, actual: user.id });
        throw new Error('User ID mismatch');
      }

      // Use API route for more reliable server-side saving
      const response = await fetch(`/api/progress/${moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completionPercentage,
          status,
          totalQuestions,
          correctAnswers,
          averageScore: Math.round(averageScore),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save progress: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Progress saved successfully for ${moduleId}: ${completionPercentage}%`, result.data);
      
      // Fallback: Also try direct client save if API route fails (for debugging)
    } catch (error: any) {
      console.error('Error saving progress via API route, trying direct client save:', error);
      
      // Fallback to direct client-side save
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated for fallback save');
        }

        // Ensure user exists in users table (client-side might not have permission, but try anyway)
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingUser) {
          // Try to create user (may fail due to RLS, but worth trying)
          await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
            });
        }

        const updateData: any = {
          user_id: user.id,
          module_id: moduleId,
          completion_percentage: completionPercentage,
          status: status,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          average_score: Math.round(averageScore),
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Check if progress exists to preserve timestamps
        const { data: existing } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();

        // Preserve or set started_at
        if (status === 'in_progress' && !existing?.started_at) {
          updateData.started_at = new Date().toISOString();
        } else if (existing?.started_at) {
          updateData.started_at = existing.started_at;
        }

        // Preserve or set completed_at
        if (completionPercentage === 100 && !existing?.completed_at) {
          updateData.completed_at = new Date().toISOString();
        } else if (existing?.completed_at) {
          updateData.completed_at = existing.completed_at;
        }

        const { error: upsertError, data: savedData } = await supabase
          .from('user_progress')
          .upsert(updateData, {
            onConflict: 'user_id,module_id'
          })
          .select();
        
        if (upsertError) {
          console.error('Fallback save also failed:', upsertError);
          throw upsertError;
        } else {
          console.log(`Progress saved via fallback for ${moduleId}: ${completionPercentage}%`, savedData);
        }
      } catch (fallbackError) {
        console.error('Both API route and fallback save failed:', fallbackError);
        // Show error to user in production
        alert('Failed to save progress. Please check your connection and try again.');
      }
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  // Auto-save progress whenever feedback changes
  useEffect(() => {
    if (userId && Object.keys(feedback).length > 0 && content) {
      const totalQuestions = content.questions.length;
      saveProgress(feedback, totalQuestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, userId]);

  // Handle back button click - ensure progress is saved before navigating
  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Save progress one more time before navigating
    if (userId && Object.keys(feedback).length > 0) {
      await saveProgress(feedback, content.questions.length);
    }
    
    // Wait longer to ensure save completes and database is updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    router.push('/learn');
  };

  if (!module || !content) {
    return <div>Module not found</div>;
  }

  const companyData = selectedCompany ? get10KNarrative(selectedCompany) : null;
  const selectedCompanyName = selectedCompany && companyData ? companyData.companyName : null;

  // Customize questions based on selected company
  const getCustomizedQuestions = () => {
    if (!selectedCompany || !companyData) {
      return content.questions;
    }

    return content.questions.map((q: any) => {
      // Only customize written questions (MCQ questions stay generic)
      if (q.type === 'written') {
        // Replace placeholders in questions
        let customizedQuestion = q.question
          .replace(/your selected company/gi, companyData.companyName)
          .replace(/the company you selected/gi, companyData.companyName)
          .replace(/selected company/gi, companyData.companyName)
          .replace(/this company/gi, companyData.companyName)
          .replace(/the company/gi, companyData.companyName);

        // If question doesn't mention company, add it
        if (!customizedQuestion.toLowerCase().includes(companyData.companyName.toLowerCase()) && 
            !customizedQuestion.toLowerCase().includes(selectedCompany.toLowerCase())) {
          customizedQuestion = `For ${companyData.companyName} (${selectedCompany}): ${customizedQuestion}`;
        }

        return {
          ...q,
          question: customizedQuestion,
          originalQuestion: q.question // Keep original for reference
        };
      }
      return q;
    });
  };

  const customizedQuestions = getCustomizedQuestions();

  const handleCompanySelect = (symbol: string) => {
    setSelectedCompany(symbol);
    setCurrentStep('lesson');
    // Clear answers and feedback when changing company
    setAnswers({});
    setFeedback({});
  };

  const handleSubmitMCQ = async (questionId: number, answer: string) => {
    const question = content.questions.find((q: any) => q.id === questionId);
    
    setIsSubmitting(true);
    
    try {
      // Get company context for better AI feedback
      const companyContext = companyData 
        ? `Company: ${companyData.companyName} (${selectedCompany})\nBusiness: ${companyData.businessDescription}`
        : undefined;
      
      // Call AI grading API
      const response = await fetch(`/api/modules/${moduleId}/grade-mcq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          selectedAnswer: answer,
          correctAnswer: question.correctAnswer,
          options: question.options,
          context: companyContext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to grade answer');
      }

      const result = await response.json();
      const aiFeedback = result.data;
      
      const newFeedback = {
        ...feedback,
        [questionId]: {
          isCorrect: aiFeedback.isCorrect,
          explanation: aiFeedback.explanation,
          whyWrong: aiFeedback.whyWrong,
          howToUnderstand: aiFeedback.howToUnderstand,
          correctAnswerExplanation: aiFeedback.correctAnswerExplanation
        }
      };
      
      setFeedback(newFeedback);
      // Progress will be auto-saved via useEffect
    } catch (error) {
      console.error('Error grading MCQ:', error);
      // Fallback to simple check if API fails
      const isCorrect = answer === question.correctAnswer;
      const newFeedback = {
        ...feedback,
        [questionId]: {
          isCorrect,
          explanation: question.explanation,
          error: 'AI grading unavailable. Showing basic feedback.'
        }
      };
      setFeedback(newFeedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWritten = async (questionId: number) => {
    setIsSubmitting(true);
    
    const question = customizedQuestions.find((q: any) => q.id === questionId);
    const answer = answers[questionId];
    
    if (!answer || answer.length < 50) {
      setFeedback({
        ...feedback,
        [questionId]: {
          error: 'Please provide a more detailed answer (minimum 50 characters)'
        }
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Get company context for better AI grading
      const companyContext = companyData 
        ? `Company: ${companyData.companyName} (${selectedCompany})\nBusiness: ${companyData.businessDescription}\nRisk Factors: ${companyData.riskFactors}\nFinancial Discussion: ${companyData.financialDiscussion}`
        : '';
      
      // Call AI grading API
      const response = await fetch(`/api/modules/${moduleId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          questionId: questionId,
          questionText: question.question,
          answerText: answer,
          context: companyContext,
          symbol: selectedCompany,
          expectedCompanyName: companyData?.companyName || null,
          expectedCompanySymbol: selectedCompany || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to grade answer';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.data || !result.data.feedback) {
        throw new Error(result.error || 'Invalid response from server');
      }
      
      const aiFeedback = result.data.feedback;
      
      const newFeedback = {
        ...feedback,
        [questionId]: aiFeedback
      };
      
      setFeedback(newFeedback);
      // Progress will be auto-saved via useEffect
    } catch (error: any) {
      console.error('Error grading written answer:', error);
      const errorMessage = error?.message || 'Failed to grade answer. Please try again.';
      setFeedback({
        ...feedback,
        [questionId]: {
          error: errorMessage,
          overall_score: 0
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress based on valid completions only
  const validCompletions = getValidCompletions(feedback);
  const wrongAnswers = getWrongAnswers(feedback);
  const progress = content.questions.length > 0 
    ? (validCompletions / content.questions.length) * 100 
    : 0;
  const wrongProgress = content.questions.length > 0
    ? (wrongAnswers / content.questions.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-[#f5f4f2] dark:hover:bg-[#222220]"
            onClick={handleBackClick}
            disabled={isSaving}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2d2d2d] dark:text-[#e8e6e3]">{content.title}</h1>
            <p className="text-[#6a6a6a] dark:text-[#9a9a98]">
              {module.description}
            </p>
          </div>
        </div>
        <Badge 
          className={`capitalize ${
            module.level === 'easy' 
              ? 'bg-[#d4e4d8] text-[#2d2d2d] border-[#b4d4b4]' 
              : module.level === 'expert' 
              ? 'bg-[#f4d5c6] text-[#2d2d2d] border-[#e4c5b6]' 
              : 'bg-[#e6dfe6] text-[#2d2d2d] border-[#d6cfd6]'
          }`}
        >
          {module.level}
        </Badge>
      </div>

      {/* Progress */}
      <Card className="border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2d2d2d] dark:text-[#e8e6e3]">Progress</span>
            <span className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
              {validCompletions}/{content.questions.length} correct
              {wrongAnswers > 0 && ` • ${wrongAnswers} need redo`}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#f5f4f2] dark:bg-[#222220]">
            {/* Red portion for wrong answers */}
            {wrongProgress > 0 && (
              <div
                className="absolute left-0 top-0 h-full bg-red-500 dark:bg-red-600 transition-all"
                style={{ width: `${wrongProgress}%` }}
              />
            )}
            {/* Green portion for correct answers (positioned after red) */}
            {progress > 0 && (
              <div
                className="absolute left-0 top-0 h-full bg-[#b4d4b4] dark:bg-[#8fb48f] transition-all"
                style={{ 
                  width: `${progress}%`,
                  left: `${wrongProgress}%`
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Selection */}
      {currentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Company to Analyze</CardTitle>
            <CardDescription>
              Choose a company to focus your learning on. You'll analyze their financials and business throughout this module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COMPANIES.map((company) => (
                <Button
                  key={company.symbol}
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => handleCompanySelect(company.symbol)}
                >
                  <div className="text-left">
                    <div className="font-semibold">{company.symbol}</div>
                    <div className="text-sm text-muted-foreground">{company.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      {currentStep === 'lesson' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Lesson: {content.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedCompany}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep('select')}>
                  Change Company
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {content.lesson.split('\n\n').map((paragraph: string, index: number) => {
                // Bold text formatting
                const formatText = (text: string) => {
                  const parts = text.split(/(\*\*.*?\*\*)/g);
                  return parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="font-semibold text-[#2d2d2d] dark:text-[#e8e6e3]">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                  });
                };

                // Detect list items
                if (paragraph.startsWith('-')) {
                  const listItems = paragraph.split('\n').filter(item => item.trim());
                  return (
                    <ul key={index} className="space-y-2 ml-6 list-none">
                      {listItems.map((item, i) => (
                        <li key={i} className="relative pl-6 text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">
                          <span className="absolute left-0 text-[#b4d4b4]">•</span>
                          {formatText(item.replace(/^-\s*/, ''))}
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Detect numbered lists
                if (/^\d+\./.test(paragraph)) {
                  const listItems = paragraph.split('\n').filter(item => item.trim());
                  return (
                    <ol key={index} className="space-y-3 ml-6">
                      {listItems.map((item, i) => (
                        <li key={i} className="text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed pl-2">
                          {formatText(item.replace(/^\d+\.\s*\*\*/, '').replace(/\*\*:/, ':'))}
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Regular paragraphs
                return (
                  <p key={index} className="text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">
                    {formatText(paragraph)}
                  </p>
                );
              })}
            </CardContent>
          </Card>

          {companyData && (
            <Card className="bg-[#f9f7f5] dark:bg-[#222220] border-[#e0ddd8] dark:border-[#3a3a38]">
              <CardHeader>
                <CardTitle className="text-lg text-[#2d2d2d] dark:text-[#e8e6e3]">
                  Company Context: {companyData.companyName} ({selectedCompany})
                </CardTitle>
                <CardDescription className="text-[#6a6a6a] dark:text-[#9a9a98]">
                  {moduleId === 'module-1' && 'Use this context to understand the company\'s fundamentals and apply financial metrics.'}
                  {moduleId === 'module-2' && 'Review the business model and risk factors to analyze how the company presents itself in its 10-K filing.'}
                  {moduleId === 'module-3' && 'Examine the financial performance and discussion to understand the company\'s financial statements and accounting practices.'}
                  {moduleId === 'module-4' && 'Analyze the competitive position, business model, and risk factors to identify competitive advantages and market moats.'}
                  {moduleId === 'module-5' && 'Use all available context to conduct a comprehensive comparative analysis and build a complete investment thesis.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {moduleId === 'module-1' && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Company Overview for Fundamental Analysis</h4>
                    <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                    <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                      <strong>Why this matters:</strong> Understanding {companyData.companyName}'s business model helps you interpret financial metrics like P/E ratios, EBITDA margins, and ROE in context. Different industries have different typical ranges for these ratios, so knowing what the company does is essential for meaningful analysis.
                    </p>
                  </div>
                )}
                
                {moduleId === 'module-2' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Description (Item 1)</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>What to look for:</strong> How does {companyData.companyName} describe its business model, revenue streams, and competitive position? Pay attention to how they frame their value proposition and market positioning.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Risk Factors (Item 1A)</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>What to analyze:</strong> Companies are required to disclose material risks. Consider how {companyData.companyName} prioritizes and presents these risks. Are they transparent about challenges, or do they minimize concerns? How do these risks relate to the business description?
                      </p>
                    </div>
                  </>
                )}
                
                {moduleId === 'module-3' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Model Context</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Connection to financials:</strong> Understanding {companyData.companyName}'s business model helps you interpret the balance sheet and income statement. For example, asset-heavy businesses will show different balance sheet structures than software companies.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Management's Discussion & Analysis (MD&A)</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.financialDiscussion}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>What to examine:</strong> The MD&A section provides management's interpretation of the financial statements. Look for how {companyData.companyName} explains revenue trends, margin changes, and balance sheet movements. Compare their narrative to what the numbers actually show.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Key Risk Factors Affecting Financials</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Financial impact:</strong> Consider how these risks could affect {companyData.companyName}'s financial statements. For example, supply chain risks might impact inventory levels, while regulatory risks could affect revenue recognition or require reserves.
                      </p>
                    </div>
                  </>
                )}
                
                {moduleId === 'module-4' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Model & Competitive Position</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Moat analysis:</strong> Identify what gives {companyData.companyName} its competitive advantage. Is it network effects, brand strength, cost advantages, switching costs, or regulatory barriers? Look for language about market share, customer loyalty, or unique capabilities.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Competitive Threats & Risk Factors</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Competitive landscape:</strong> The risk factors reveal {companyData.companyName}'s vulnerabilities and competitive pressures. Analyze which risks suggest weak moats (e.g., intense competition) versus external threats (e.g., regulation) that might actually indicate a strong position.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Financial Performance Indicators</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.financialDiscussion}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Moat validation:</strong> Strong competitive advantages should translate to financial results. Look for evidence in {companyData.companyName}'s financial performance—sustained margins, pricing power, or consistent market share gains suggest durable moats.
                      </p>
                    </div>
                  </>
                )}
                
                {moduleId === 'module-5' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Complete Business Profile</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.businessDescription}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>For comparison:</strong> Use this business description to understand {companyData.companyName}'s core operations, revenue model, and market position. When comparing to another company, identify similarities and differences in business models, even within the same industry.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Risk Profile & Competitive Position</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.riskFactors}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Comparative risk analysis:</strong> Compare {companyData.companyName}'s risk factors to another company's. Which company faces more significant threats? Are the risks company-specific or industry-wide? This helps assess relative investment attractiveness.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Financial Performance & Strategy</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed mb-3">{companyData.financialDiscussion}</p>
                      <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] italic">
                        <strong>Comparative financial analysis:</strong> Use {companyData.companyName}'s financial discussion to understand their performance trends, capital allocation strategy, and management priorities. Compare these to another company's financial narrative to identify which management team is executing better or has a more compelling strategy.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              size="lg" 
              onClick={() => setCurrentStep('questions')}
              className="bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium shadow-sm border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]"
            >
              Continue to Questions
            </Button>
          </div>
        </>
      )}

      {/* Questions */}
      {currentStep === 'questions' && (
        <div className="space-y-6">
          {!selectedCompany && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Please select a company first to view questions.</p>
              </CardContent>
            </Card>
          )}
          {selectedCompany && customizedQuestions.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      Question {index + 1} of {content.questions.length}
                    </Badge>
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                    {question.guidance && (
                      <CardDescription className="mt-2">
                        <strong>Guidance:</strong> {question.guidance}
                      </CardDescription>
                    )}
                  </div>
                  {feedback[question.id] ? (
                    question.type === 'mcq' ? (
                      feedback[question.id].isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-6 w-6 text-red-600" />
                          <Badge variant="destructive" className="text-xs">Redo Required</Badge>
                        </div>
                      )
                    ) : (
                      <Badge 
                        variant={feedback[question.id].overall_score >= 70 ? 'default' : 'destructive'}
                        className={feedback[question.id].overall_score < 70 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                      >
                        {feedback[question.id].overall_score}/100
                        {feedback[question.id].overall_score < 70 && ' - Redo Required'}
                      </Badge>
                    )
                  ) : isSubmitting && answers[question.id] && question.type === 'mcq' ? (
                    <Badge variant="outline">Grading...</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.type === 'mcq' ? (
                  // Multiple Choice Question
                  <div className="space-y-2">
                    {question.options.map((option: any) => (
                      <Button
                        key={option.label}
                        variant={
                          feedback[question.id]
                            ? option.label === question.correctAnswer
                              ? 'default'
                              : answers[question.id] === option.label
                              ? 'destructive'
                              : 'outline'
                            : answers[question.id] === option.label
                            ? 'secondary'
                            : 'outline'
                        }
                        className="w-full justify-start h-auto py-3 text-left"
                        onClick={async () => {
                          setAnswers({ ...answers, [question.id]: option.label });
                          // Allow resubmission if answer was wrong
                          if ((!feedback[question.id] || !feedback[question.id].isCorrect) && !isSubmitting) {
                            await handleSubmitMCQ(question.id, option.label);
                          }
                        }}
                        disabled={(feedback[question.id]?.isCorrect === true) || isSubmitting}
                      >
                        <span className="font-semibold mr-2">{option.label}.</span>
                        {option.text}
                      </Button>
                    ))}
                  </div>
                ) : (
                  // Written Response
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write your detailed analysis here..."
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      rows={8}
                      disabled={feedback[question.id]?.overall_score >= 70}
                    />
                    {(!feedback[question.id] || (feedback[question.id].overall_score !== undefined && feedback[question.id].overall_score < 70)) && (
                      <>
                        {answers[question.id] && answers[question.id].length < 50 && (
                          <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
                            Please provide at least 50 characters ({answers[question.id].length}/50)
                          </p>
                        )}
                        {feedback[question.id] && feedback[question.id].overall_score < 70 && (
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                            Score below 70. Please revise and resubmit to count towards progress.
                          </p>
                        )}
                        <Button 
                          onClick={() => handleSubmitWritten(question.id)}
                          disabled={isSubmitting || !answers[question.id] || answers[question.id].length < 50}
                          className="w-full"
                        >
                          {isSubmitting ? 'Grading...' : feedback[question.id]?.overall_score < 70 ? 'Resubmit for AI Grading' : 'Submit for AI Grading'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Feedback Display */}
                {feedback[question.id] && (
                  <Card className={question.type === 'mcq' 
                    ? feedback[question.id].isCorrect 
                      ? 'bg-[#e8f4e8] dark:bg-[#2a3a2a] border-[#b4d4b4] dark:border-[#4a6a4a]' 
                      : 'bg-[#fce8e8] dark:bg-[#3a2a2a] border-[#e4b4b4] dark:border-[#6a4a4a]'
                    : 'bg-[#f9f7f5] dark:bg-[#222220] border-[#e0ddd8] dark:border-[#3a3a38]'
                  }>
                    <CardHeader>
                      <CardTitle className="text-lg text-[#2d2d2d] dark:text-[#e8e6e3]">
                        {question.type === 'mcq' 
                          ? feedback[question.id].isCorrect ? '✓ Correct!' : '✗ Incorrect'
                          : `Score: ${feedback[question.id].overall_score}/100`
                        }
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {question.type === 'mcq' ? (
                        <div className="space-y-3">
                          {!feedback[question.id].isCorrect && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-3">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Incorrect answer. This question does not count towards progress. Please select the correct answer to proceed.
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">
                            <strong>Explanation:</strong> {feedback[question.id].explanation}
                          </p>
                          {feedback[question.id].whyWrong && (
                            <div className="bg-[#fff4e6] dark:bg-[#3a2e1a] p-3 rounded border border-[#ffd699] dark:border-[#5a4a2a]">
                              <p className="text-sm font-semibold text-[#2d2d2d] dark:text-[#e8e6e3] mb-1">Why this answer is incorrect:</p>
                              <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].whyWrong}</p>
                            </div>
                          )}
                          {feedback[question.id].howToUnderstand && (
                            <div className="bg-[#e8f4e8] dark:bg-[#2a3a2a] p-3 rounded border border-[#b4d4b4] dark:border-[#4a6a4a]">
                              <p className="text-sm font-semibold text-[#2d2d2d] dark:text-[#e8e6e3] mb-1">How to better understand this:</p>
                              <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].howToUnderstand}</p>
                            </div>
                          )}
                          {feedback[question.id].correctAnswerExplanation && (
                            <div className="bg-[#f0f8ff] dark:bg-[#1a2a3a] p-3 rounded border border-[#b4d4f4] dark:border-[#4a6a8a]">
                              <p className="text-sm font-semibold text-[#2d2d2d] dark:text-[#e8e6e3] mb-1">Correct answer explanation:</p>
                              <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].correctAnswerExplanation}</p>
                            </div>
                          )}
                        </div>
                      ) : feedback[question.id].error ? (
                        <p className="text-sm text-[#c45a5a]">{feedback[question.id].error}</p>
                      ) : (
                        <>
                          {feedback[question.id].overall_score < 70 && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-3">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Score below 70. This answer does not count towards progress. Please revise and resubmit to achieve a passing score.
                              </p>
                            </div>
                          )}
                          <p className="text-sm font-medium text-[#2d2d2d] dark:text-[#e8e6e3]">{feedback[question.id].summary}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {Object.entries(feedback[question.id].criteria).map(([key, value]: [string, any]) => (
                              <div key={key} className="text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold capitalize text-[#2d2d2d] dark:text-[#e8e6e3]">{key.replace('_', ' ')}</span>
                                  <Badge className="bg-[#e8e6e3] text-[#2d2d2d] border-[#d0cdc8]">{value.score}/20</Badge>
                                </div>
                                <p className="text-xs text-[#6a6a6a] dark:text-[#9a9a98]">{value.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}

          {progress === 100 && (
            <Card className="bg-[#d4e4d8] dark:bg-[#3a4a3e] border-[#b4d4b4] dark:border-[#5a7a5e]">
              <CardContent className="py-8 text-center">
                <h2 className="text-2xl font-bold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">🎉 Module Complete!</h2>
                <p className="mb-6 text-[#4a4a4a] dark:text-[#b8b8b8]">
                  Great job completing {content.title}. Continue to the next module to keep learning.
                </p>
                <Button 
                  size="lg" 
                  onClick={async () => {
                    // Ensure progress is saved before navigating
                    if (userId && Object.keys(feedback).length > 0) {
                      await saveProgress(feedback, content.questions.length);
                      // Wait a bit more to ensure database commit
                      await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    router.push('/learn');
                  }}
                  disabled={isSaving}
                  className="bg-white hover:bg-[#f5f4f2] text-[#2d2d2d] border border-[#e0ddd8] shadow-sm dark:bg-[#242422] dark:hover:bg-[#2a2a28] dark:text-[#e8e6e3] dark:border-[#3a3a38]"
                >
                  {isSaving ? 'Saving...' : 'Back to Modules'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

