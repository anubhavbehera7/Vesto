'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Company {
  id: number;
  symbol: string;
  name: string;
  industry?: string;
  sector?: string;
}

interface Quote {
  current_price: number;
  change: number;
  percent_change: number;
}

interface Fundamentals {
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
}

interface FinancialData {
  year: number;
  quarter: number;
  income_statement: any;
}

interface CompanyData {
  company: Company;
  quote: Quote | null;
  fundamentals: Fundamentals | null;
  mock10k: { business_description: string } | null;
  financials: FinancialData[];
}

export default function SimulatorPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyData, setCompanyData] = useState<Record<string, CompanyData>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [pitch, setPitch] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmittingPitch, setIsSubmittingPitch] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const initialCash = 10000;

  // Load portfolio holdings
  const loadPortfolio = async (userId: string) => {
    try {
      const response = await fetch(`/api/portfolio?userId=${userId}`);
      const result = await response.json();
      if (result.data) {
        // Update holdings with current prices from companyData
        const updatedHoldings = result.data.map((holding: any) => {
          const companyInfo = companyData[holding.symbol];
          const currentPrice = companyInfo?.quote?.current_price || holding.buy_price;
          const currentValue = holding.shares * currentPrice;
          const costBasis = holding.shares * holding.buy_price;
          const gainLoss = currentValue - costBasis;
          const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
          
          return {
            ...holding,
            current_price: currentPrice,
            current_value: currentValue,
            gain_loss: gainLoss,
            gain_loss_percent: gainLossPercent
          };
        });
        setPortfolio(updatedHoldings);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  // Get authenticated user and load portfolio
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user?.id) {
        // Wait for companyData to load before loading portfolio
        if (Object.keys(companyData).length > 0) {
          loadPortfolio(user.id);
        }
      }
    }
    getUser();
  }, []);

  // Reload portfolio when companyData updates (for current prices)
  useEffect(() => {
    if (userId && Object.keys(companyData).length > 0) {
      loadPortfolio(userId);
    }
  }, [companyData, userId]);

  // Load all companies with their data in a single API call (from cached database)
  useEffect(() => {
    async function loadCompanies() {
      try {
        // Single API call to get all companies with quotes, fundamentals, and mock10k data
        // All data comes from cached Supabase database (no external API calls)
        const response = await fetch('/api/companies/all-data');
        const result = await response.json();
        
        if (result.data) {
          // Extract companies list
          const companiesList = result.data.map((item: CompanyData) => item.company);
          setCompanies(companiesList);
          
          // Build data map for quick lookup
          const dataMap: Record<string, CompanyData> = {};
          result.data.forEach((item: CompanyData) => {
            dataMap[item.company.symbol] = item;
          });
          setCompanyData(dataMap);
        }
      } catch (error) {
        console.error('Error loading cached companies from database:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  // No need for separate data loading - all data is loaded in the initial call
  // Data is already cached in companyData state from the single API call

  const selectedStock = selectedSymbol && companyData[selectedSymbol] ? {
    symbol: companyData[selectedSymbol].company.symbol,
    name: companyData[selectedSymbol].company.name,
    price: companyData[selectedSymbol].quote?.current_price || 0,
    change: companyData[selectedSymbol].quote?.percent_change || 0,
    profile: companyData[selectedSymbol].mock10k?.business_description || companyData[selectedSymbol].company.name,
    fundamentals: companyData[selectedSymbol].fundamentals,
    financials: companyData[selectedSymbol].financials || []
  } : null;

  // Extract revenue data from financials for chart
  const getRevenueData = () => {
    if (!selectedStock?.financials || selectedStock.financials.length === 0) return [];
    
    // Process all financial records
    const allRevenueData = selectedStock.financials
      .filter(f => f.income_statement && f.year)
      .map(f => {
        // Try to find revenue in income statement
        const incomeStatement = f.income_statement;
        let revenue = 0;
        
        // Common revenue field names in the JSON structure
        const revenueKeys = [
          'us-gaap_RevenueFromContractWithCustomerExcludingAssessedTax',
          'us-gaap_Revenues',
          'us-gaap_SalesRevenueNet',
          'us-gaap_RevenueFromContractWithCustomerIncludingAssessedTax'
        ];
        
        for (const key of revenueKeys) {
          if (incomeStatement[key]?.value) {
            revenue = incomeStatement[key].value;
            break;
          }
        }
        
        return {
          year: f.year,
          quarter: f.quarter,
          revenue: revenue / 1e9, // Convert to billions
          label: f.quarter > 0 ? `Q${f.quarter} ${f.year}` : `${f.year}`
        };
      })
      .filter(d => d.revenue > 0);
    
    // Group by year and take the most recent record per year (in case of duplicates)
    const yearMap = new Map<number, typeof allRevenueData[0]>();
    for (const data of allRevenueData) {
      const existing = yearMap.get(data.year);
      if (!existing || data.quarter > existing.quarter) {
        yearMap.set(data.year, data);
      }
    }
    
    // Convert to array, sort by year descending, and take last 4 years
    return Array.from(yearMap.values())
      .sort((a, b) => b.year - a.year)
      .slice(0, 4)
      .reverse(); // Reverse to show oldest to newest (left to right)
  };

  const revenueData = getRevenueData();
  // Calculate max revenue with some padding for better visualization
  const maxRevenue = revenueData.length > 0 
    ? Math.max(...revenueData.map(d => d.revenue)) * 1.1 // Add 10% padding
    : 1;

  const handleSubmitPitch = async () => {
    console.log('handleSubmitPitch called', { selectedStock, pitchLength: pitch.length, userId });
    
    if (!selectedStock) {
      console.log('No stock selected');
      setFeedback({
        status: 'rejected',
        message: 'Please select a stock first.',
      });
      return;
    }

    if (pitch.length < 50) {
      console.log('Pitch too short');
      setFeedback({
        status: 'rejected',
        message: 'Please provide a more detailed analysis (minimum 50 characters).',
      });
      return;
    }

    if (!userId) {
      console.log('No user ID');
      setFeedback({
        status: 'rejected',
        message: 'Please log in to submit a pitch.',
      });
      return;
    }

    setIsSubmittingPitch(true);
    setFeedback(null); // Clear previous feedback

    try {
      console.log('Submitting pitch to API...', {
        userId,
        symbol: selectedStock.symbol,
        companyName: selectedStock.name,
        pitchLength: pitch.length
      });

      // Call the actual API to submit pitch
      const response = await fetch('/api/simulator/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          symbol: selectedStock.symbol,
          companyName: selectedStock.name,
          pitchText: pitch
        })
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to submit pitch');
      }

      const result = await response.json();
      console.log('API result:', result);

      if (result.data) {
        setFeedback({
          status: result.data.review.status,
          message: result.data.review.feedback,
          score: result.data.review.score,
          submissionId: result.data.submission?.id
        });
        
        // Reload portfolio if pitch was approved and already invested
        if (result.data.review.status === 'approved' && userId) {
          loadPortfolio(userId);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error submitting pitch:', error);
      setFeedback({
        status: 'rejected',
        message: error?.message || 'Failed to submit pitch. Please try again.',
      });
    } finally {
      setIsSubmittingPitch(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedStock || !userId || !investmentAmount) {
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setFeedback({
        ...feedback,
        message: 'Please enter a valid investment amount.',
      });
      return;
    }

    const currentPrice = selectedStock.price;
    if (currentPrice <= 0) {
      setFeedback({
        ...feedback,
        message: 'Unable to get current stock price. Please try again.',
      });
      return;
    }

    const shares = Math.floor(amount / currentPrice);
    if (shares <= 0) {
      setFeedback({
        ...feedback,
        message: 'Investment amount is too small to buy any shares.',
      });
      return;
    }

    const actualInvestment = shares * currentPrice;
    const availableCash = initialCash - portfolio.reduce((sum, h) => sum + (h.shares * h.buy_price), 0);
    
    if (actualInvestment > availableCash) {
      setFeedback({
        ...feedback,
        message: `Insufficient funds. Available: ${formatCurrency(availableCash)}`,
      });
      return;
    }

    setIsInvesting(true);

    try {
      const response = await fetch('/api/portfolio/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          symbol: selectedStock.symbol,
          companyName: selectedStock.name,
          shares: shares,
          buyPrice: currentPrice,
          investmentAmount: actualInvestment,
          pitchSubmissionId: feedback.submissionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to invest');
      }

      const result = await response.json();
      
      // Reload portfolio
      if (userId) {
        await loadPortfolio(userId);
      }

      // Clear investment form
      setInvestmentAmount('');
      setFeedback({
        ...feedback,
        message: `Successfully invested ${formatCurrency(actualInvestment)} in ${selectedStock.symbol} (${shares} shares).`,
      });
    } catch (error: any) {
      console.error('Error investing:', error);
      setFeedback({
        ...feedback,
        message: error?.message || 'Failed to complete investment. Please try again.',
      });
    } finally {
      setIsInvesting(false);
    }
  };

  // Calculate portfolio totals
  const totalHoldingsValue = portfolio.reduce((sum, h) => sum + (h.current_value || 0), 0);
  const totalCostBasis = portfolio.reduce((sum, h) => sum + (h.shares * h.buy_price), 0);
  const totalGainLoss = totalHoldingsValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  const availableCash = initialCash - totalCostBasis;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Column 1: Market & Portfolio */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Market</h2>
          <Card className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Loading companies...
                    </TableCell>
                  </TableRow>
                ) : companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => {
                    const data = companyData[company.symbol];
                    const price = data?.quote?.current_price || 0;
                    const change = data?.quote?.percent_change || 0;
                    
                    return (
                      <TableRow
                        key={company.symbol}
                        onClick={() => {
                          setSelectedSymbol(company.symbol);
                          setFeedback(null);
                          setPitch('');
                          setShowAllMetrics(false);
                        }}
                        className={`cursor-pointer ${
                          selectedSymbol === company.symbol ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                        }`}
                      >
                        <TableCell>
                          <div className="font-medium">{company.symbol}</div>
                          <div className="text-xs text-muted-foreground">{company.name}</div>
                        </TableCell>
                        <TableCell>{price > 0 ? formatCurrency(price) : 'Loading...'}</TableCell>
                        <TableCell className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {price > 0 ? (
                            <>
                              {change >= 0 ? '+' : ''}{formatPercent(change, 1)}
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Portfolio</CardTitle>
            <CardDescription>
              Total Assets: <span className="font-medium">{formatCurrency(initialCash + totalGainLoss)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Holdings</span>
                <span className="font-medium">{formatCurrency(totalHoldingsValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available Cash</span>
                <span className="font-medium">{formatCurrency(availableCash)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span>Total Gain/Loss</span>
                <span className={`font-medium ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)} ({totalGainLossPercent >= 0 ? '+' : ''}{formatPercent(totalGainLossPercent, 2)})
                </span>
              </div>
            </div>
            {portfolio.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Get a pitch approved to start investing!
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">Holdings:</p>
                {portfolio.map((holding) => (
                  <div key={holding.id} className="p-2 border rounded text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-medium">{holding.symbol}</span>
                        <span className="text-muted-foreground ml-2">{holding.shares} shares</span>
                      </div>
                      <span className={`font-medium ${holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.gain_loss >= 0 ? '+' : ''}{formatPercent(holding.gain_loss_percent || 0, 2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: {formatCurrency(holding.buy_price)}</span>
                      <span>Current: {formatCurrency(holding.current_price || holding.buy_price)}</span>
                      <span>Value: {formatCurrency(holding.current_value || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Column 2 & 3: Details & AI Manager */}
      <div className="lg:col-span-2 space-y-6">
        {selectedStock ? (
          <>
            <div>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">Details</h2>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedStock.name} ({selectedStock.symbol})
                  </CardTitle>
                  <CardDescription>
                    {formatCurrency(selectedStock.price)}{' '}
                    <span className={selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {selectedStock.change >= 0 ? '+' : ''}{formatPercent(selectedStock.change, 1)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Company Profile</h4>
                    <p className="text-sm text-muted-foreground">{selectedStock.profile}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Key Metrics</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllMetrics(!showAllMetrics)}
                        className="text-xs h-7"
                      >
                        {showAllMetrics ? 'Show Less' : 'View More'}
                      </Button>
                    </div>
                    
                    {/* Default 4 Key Metrics */}
                    <div className="grid grid-cols-4 gap-4 text-center mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">P/E Ratio</p>
                        <p className="text-xl font-bold">
                          {selectedStock.fundamentals?.pe_ratio ? selectedStock.fundamentals.pe_ratio.toFixed(1) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">EBITDA</p>
                        <p className="text-xl font-bold">
                          {selectedStock.fundamentals?.ebitda 
                            ? `${selectedStock.fundamentals.ebitda.toFixed(1)}B` 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">ROE</p>
                        <p className="text-xl font-bold">
                          {selectedStock.fundamentals?.roe ? `${selectedStock.fundamentals.roe.toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">D/E Ratio</p>
                        <p className="text-xl font-bold">
                          {selectedStock.fundamentals?.debt_to_equity ? selectedStock.fundamentals.debt_to_equity.toFixed(2) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Additional Metrics (Collapsible) */}
                    {showAllMetrics && (
                      <div className="space-y-4 pt-4 border-t">
                        {/* Valuation Metrics */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Valuation</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">P/B Ratio</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.pb_ratio ? selectedStock.fundamentals.pb_ratio.toFixed(1) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Forward P/E</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.forward_pe ? selectedStock.fundamentals.forward_pe.toFixed(1) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">P/S Ratio</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.ps_ratio ? selectedStock.fundamentals.ps_ratio.toFixed(1) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Profitability Metrics */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Profitability</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">ROA</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.roa ? `${selectedStock.fundamentals.roa.toFixed(1)}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Net Margin</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.net_profit_margin ? `${selectedStock.fundamentals.net_profit_margin.toFixed(1)}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Gross Margin</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.gross_margin ? `${selectedStock.fundamentals.gross_margin.toFixed(1)}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Operating Metrics */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Operating</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Operating Margin</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.operating_margin ? `${selectedStock.fundamentals.operating_margin.toFixed(1)}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Current Ratio</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.current_ratio ? selectedStock.fundamentals.current_ratio.toFixed(2) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Quick Ratio</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.quick_ratio ? selectedStock.fundamentals.quick_ratio.toFixed(2) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Growth & Market */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Growth & Market</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Revenue Growth</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.revenue_growth_yoy 
                                  ? `${selectedStock.fundamentals.revenue_growth_yoy >= 0 ? '+' : ''}${selectedStock.fundamentals.revenue_growth_yoy.toFixed(1)}%` 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">EPS Growth</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.eps_growth_yoy 
                                  ? `${selectedStock.fundamentals.eps_growth_yoy >= 0 ? '+' : ''}${selectedStock.fundamentals.eps_growth_yoy.toFixed(1)}%` 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Beta</p>
                              <p className="text-lg font-bold">
                                {selectedStock.fundamentals?.beta ? selectedStock.fundamentals.beta.toFixed(2) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      {revenueData.length > 0 ? 'Annual Revenue' : 'Revenue Data'}
                    </h4>
                    {revenueData.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-end justify-between gap-3 h-48">
                          {revenueData.map((data, index) => {
                            const heightPercent = Math.max((data.revenue / maxRevenue) * 100, 5); // Min 5% height
                            
                            // Determine trend: compare with previous year (if available)
                            const previousRevenue = index > 0 ? revenueData[index - 1].revenue : null;
                            const isTrendingUp = previousRevenue !== null ? data.revenue > previousRevenue : true; // First bar defaults to up
                            
                            // Use pastel colors matching the website theme
                            const barColor = isTrendingUp 
                              ? 'bg-[#b4d4b4] hover:bg-[#a0c5a0]' // Pastel green (matches --primary)
                              : 'bg-[#f4a5a5] hover:bg-[#e89595]'; // Pastel red
                            
                            return (
                              <div key={`${data.year}-${data.quarter}`} className="flex-1 flex flex-col justify-end items-center h-full">
                                <div className="w-full flex flex-col items-center justify-end h-full">
                                  <div 
                                    className={`${barColor} rounded-t w-full transition-all`}
                                    style={{ 
                                      height: `${heightPercent}%`,
                                      minHeight: '20px' // Minimum visible height
                                    }}
                                    title={`${data.label}: $${data.revenue.toFixed(1)}B ${previousRevenue !== null ? (isTrendingUp ? '↑' : '↓') : ''}`}
                                  ></div>
                                  <p className="text-xs font-semibold mt-2 text-center">
                                    ${data.revenue.toFixed(1)}B
                                  </p>
                                </div>
                                <p className="text-xs text-center text-muted-foreground mt-1">
                                  {data.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          Annual revenue in billions (USD)
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-dashed rounded">
                        Revenue data not available for this company
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">AI Fund Manager</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Pitch: {selectedStock.name} ({selectedStock.symbol})</CardTitle>
                  <CardDescription>
                    Your goal is to get your stock pick approved by the AI Portfolio Manager. Base your pitch on fundamental analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write your analysis here. Cover the business model, financials, risks, and your core thesis..."
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    rows={8}
                  />
                  <Button 
                    onClick={handleSubmitPitch} 
                    className="w-full"
                    disabled={isSubmittingPitch || !pitch || pitch.length < 50}
                  >
                    {isSubmittingPitch ? 'Submitting to AI Portfolio Manager...' : 'Submit Pitch to AI Portfolio Manager'}
                  </Button>

                  {feedback && (
                    <Card className="mt-4">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Badge variant={feedback.status === 'approved' ? 'default' : 'destructive'}>
                            {feedback.status}
                          </Badge>
                          <CardTitle className="text-lg">AI Portfolio Manager Feedback</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{feedback.message}</p>
                        
                        {feedback.status === 'approved' && selectedStock && (
                          <div className="pt-4 border-t space-y-4">
                            <div>
                              <Label htmlFor="investmentAmount" className="text-sm font-medium">
                                Investment Amount (Available: {formatCurrency(availableCash)})
                              </Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  id="investmentAmount"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={investmentAmount}
                                  onChange={(e) => setInvestmentAmount(e.target.value)}
                                  min="0"
                                  max={availableCash}
                                  step="0.01"
                                  disabled={isInvesting}
                                />
                                <Button 
                                  onClick={handleInvest}
                                  disabled={isInvesting || !investmentAmount || parseFloat(investmentAmount) <= 0}
                                  className="whitespace-nowrap"
                                >
                                  {isInvesting ? 'Investing...' : 'Invest'}
                                </Button>
                              </div>
                              {investmentAmount && parseFloat(investmentAmount) > 0 && selectedStock.price > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  You'll buy approximately {Math.floor(parseFloat(investmentAmount) / selectedStock.price)} shares at {formatCurrency(selectedStock.price)} per share
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Select a Stock</CardTitle>
              <CardDescription>
                Choose a company from the market list to view details and submit a pitch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Click on a stock in the market table to get started
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

