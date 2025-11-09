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
import Link from 'next/link';

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
        type: 'written',
        question: 'Analyze the financial metrics for the company you selected. Discuss their P/E ratio, profitability metrics (ROE/ROA), and debt levels. Are these metrics attractive for investment? Consider both the absolute values and what they suggest about the company\'s financial health.',
        guidance: 'Your answer should cite specific numbers, compare them to reasonable benchmarks, and explain what these metrics reveal about the company\'s valuation, profitability, and risk profile.'
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
        type: 'written',
        question: 'Based on the business description and risk factors for your selected company, evaluate their competitive position and major risks. Identify the top 3 risks and assess whether management has competitive advantages that might mitigate these risks.',
        guidance: 'Cite specific details from the business description and risk factors. Explain why certain risks are more significant than others and how the company\'s business model addresses or is vulnerable to these risks.'
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

  // Function to save progress to database using client-side Supabase
  const saveProgress = async (currentFeedback: Record<number, any>, completedQuestions: number, totalQuestions: number) => {
    if (!userId || saveInProgressRef.current) return;

    saveInProgressRef.current = true;
    setIsSaving(true);

    // Ensure completion percentage is exactly 100 when all questions are answered
    const completionPercentage = completedQuestions === totalQuestions ? 100 : Math.round((completedQuestions / totalQuestions) * 100);
    
    // Calculate correct answers and average score
    let correctAnswers = 0;
    let totalScore = 0;
    let scoredCount = 0;

    Object.entries(currentFeedback).forEach(([questionId, fb]: [string, any]) => {
      const question = content.questions.find((q: any) => q.id === parseInt(questionId));
      if (question) {
        if (question.type === 'mcq') {
          if (fb.isCorrect) correctAnswers++;
        } else if (question.type === 'written' && fb.overall_score !== undefined) {
          totalScore += fb.overall_score;
          scoredCount++;
        }
      }
    });

    const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;

    try {
      const supabase = createClient();
      
      // First, check if progress exists to preserve timestamps
      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .maybeSingle();

      const status = completionPercentage === 100 ? 'completed' : completionPercentage > 0 ? 'in_progress' : 'not_started';
      
      const updateData: any = {
        user_id: userId,
        module_id: moduleId,
        completion_percentage: completionPercentage,
        status: status,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        average_score: Math.round(averageScore),
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

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

      // Upsert progress
      const { error, data: savedData } = await supabase
        .from('user_progress')
        .upsert(updateData, {
          onConflict: 'user_id,module_id'
        })
        .select();
      
      if (error) {
        console.error('Error saving progress:', error);
      } else {
        console.log(`Progress saved for ${moduleId}: ${completionPercentage}%`, savedData);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  // Auto-save progress whenever feedback changes
  useEffect(() => {
    if (userId && Object.keys(feedback).length > 0 && content) {
      const completedCount = Object.keys(feedback).length;
      const totalQuestions = content.questions.length;
      saveProgress(feedback, completedCount, totalQuestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback, userId]);

  // Handle back button click - ensure progress is saved before navigating
  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Save progress one more time before navigating
    if (userId && Object.keys(feedback).length > 0) {
      const completedCount = Object.keys(feedback).length;
      await saveProgress(feedback, completedCount, content.questions.length);
    }
    
    // Wait longer to ensure save completes and database is updated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    router.push('/learn');
  };

  if (!module || !content) {
    return <div>Module not found</div>;
  }

  const companyData = selectedCompany ? get10KNarrative(selectedCompany) : null;

  const handleCompanySelect = (symbol: string) => {
    setSelectedCompany(symbol);
    setCurrentStep('lesson');
  };

  const handleSubmitMCQ = (questionId: number, answer: string) => {
    const question = content.questions.find((q: any) => q.id === questionId);
    const isCorrect = answer === question.correctAnswer;
    
    const newFeedback = {
      ...feedback,
      [questionId]: {
        isCorrect,
        explanation: question.explanation
      }
    };
    
    setFeedback(newFeedback);
    // Progress will be auto-saved via useEffect
  };

  const handleSubmitWritten = async (questionId: number) => {
    setIsSubmitting(true);
    
    const question = content.questions.find((q: any) => q.id === questionId);
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

    // Simulate AI grading (in production, this calls the API)
    // For MVP, provide realistic mock feedback
    const mockScore = 70 + Math.floor(Math.random() * 25); // 70-95
    
    const newFeedback = {
      ...feedback,
      [questionId]: {
        overall_score: mockScore,
        criteria: {
          clarity: {
            score: Math.floor(mockScore / 5),
            feedback: mockScore >= 80 ? 'Clear and well-organized response' : 'Response could be better structured'
          },
          evidence: {
            score: Math.floor(mockScore / 5),
            feedback: mockScore >= 80 ? 'Good use of specific data points' : 'Include more specific metrics and citations'
          },
          completeness: {
            score: Math.floor(mockScore / 5),
            feedback: mockScore >= 80 ? 'Addresses all parts of the question' : 'Some aspects need more depth'
          },
          critical_thinking: {
            score: Math.floor(mockScore / 5),
            feedback: mockScore >= 80 ? 'Demonstrates strong analytical thinking' : 'Consider implications and connections more deeply'
          },
          risk_analysis: {
            score: Math.floor(mockScore / 5),
            feedback: mockScore >= 80 ? 'Identifies and evaluates key risks well' : 'Risk analysis needs more detail'
          }
        },
        summary: mockScore >= 80 
          ? 'Strong analysis demonstrating good understanding of key concepts. You effectively used specific data points and showed critical thinking.'
          : 'Good effort with room for improvement. Focus on providing more specific evidence and deeper analysis of implications and risks.'
      }
    };
    
    setFeedback(newFeedback);
    // Progress will be auto-saved via useEffect
    
    setIsSubmitting(false);
  };

  const progress = ((Object.keys(feedback).length / content.questions.length) * 100);

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
            <span className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="bg-[#f5f4f2] dark:bg-[#222220]" />
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
                  Company Context: {companyData.companyName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Business Overview</h4>
                  <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed">{companyData.businessDescription}</p>
                </div>
                {moduleId !== 'module-1' && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Risk Factors</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed">{companyData.riskFactors}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Financial Discussion</h4>
                      <p className="text-[#5a5a5a] dark:text-[#9a9a98] leading-relaxed">{companyData.financialDiscussion}</p>
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
          {content.questions.map((question: any, index: number) => (
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
                  {feedback[question.id] && (
                    question.type === 'mcq' ? (
                      feedback[question.id].isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )
                    ) : (
                      <Badge variant={feedback[question.id].overall_score >= 70 ? 'default' : 'secondary'}>
                        {feedback[question.id].overall_score}/100
                      </Badge>
                    )
                  )}
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
                        onClick={() => {
                          setAnswers({ ...answers, [question.id]: option.label });
                          if (!feedback[question.id]) {
                            handleSubmitMCQ(question.id, option.label);
                          }
                        }}
                        disabled={!!feedback[question.id]}
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
                      disabled={!!feedback[question.id]}
                    />
                    {!feedback[question.id] && (
                      <>
                        {answers[question.id] && answers[question.id].length < 50 && (
                          <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
                            Please provide at least 50 characters ({answers[question.id].length}/50)
                          </p>
                        )}
                        <Button 
                          onClick={() => handleSubmitWritten(question.id)}
                          disabled={isSubmitting || !answers[question.id] || answers[question.id].length < 50}
                          className="w-full"
                        >
                          {isSubmitting ? 'Grading...' : 'Submit for AI Grading'}
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
                        <p className="text-sm text-[#4a4a4a] dark:text-[#b8b8b8] leading-relaxed">{feedback[question.id].explanation}</p>
                      ) : feedback[question.id].error ? (
                        <p className="text-sm text-[#c45a5a]">{feedback[question.id].error}</p>
                      ) : (
                        <>
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
                <Link href="/learn">
                  <Button 
                    size="lg" 
                    className="bg-white hover:bg-[#f5f4f2] text-[#2d2d2d] border border-[#e0ddd8] shadow-sm dark:bg-[#242422] dark:hover:bg-[#2a2a28] dark:text-[#e8e6e3] dark:border-[#3a3a38]"
                  >
                    Back to Modules
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

