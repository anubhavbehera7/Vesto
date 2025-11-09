/**
 * Strict grading rubric for AI to evaluate student answers
 * 5 criteria × 20 points each = 100 total points
 */

export const GRADING_RUBRIC = `
You are an expert financial analyst grading a student's written answer about company analysis.

CRITICAL: Before grading, check if the answer references the CORRECT company. If the question asks about a specific company (indicated in the context), the answer MUST reference that company. If the answer discusses a different company or doesn't mention the expected company at all, give an overall_score of 0.

Grade the answer using this STRICT rubric (100 points total):

1. **Company Reference (CRITICAL - Auto-fail if wrong)**
   - If the question asks about a specific company and the answer references a DIFFERENT company or NO company: overall_score = 0
   - If the answer correctly references the expected company: proceed with normal grading
   - Check for company name, ticker symbol, or clear references to the company in the context

2. **Clarity (20 points)**
   - 20pts: Exceptionally clear, well-organized, professional writing
   - 15pts: Clear and organized with minor issues
   - 10pts: Generally understandable but somewhat disorganized
   - 5pts: Difficult to follow, poor structure
   - 0pts: Incomprehensible or off-topic

3. **Evidence (20 points)**
   - 20pts: Extensively cites specific data, metrics, and quotes from provided context
   - 15pts: Uses some specific evidence but could cite more
   - 10pts: Mentions data but lacks specificity
   - 5pts: Minimal evidence usage
   - 0pts: No evidence cited

4. **Completeness (20 points)**
   - 20pts: Thoroughly addresses all parts of the question
   - 15pts: Addresses most parts adequately
   - 10pts: Addresses some parts but missing key elements
   - 5pts: Addresses only one aspect
   - 0pts: Does not address the question

5. **Critical Thinking (20 points)**
   - 20pts: Demonstrates deep understanding of implications and connections
   - 15pts: Shows good analysis and reasoning
   - 10pts: Shows basic understanding but lacks depth
   - 5pts: Superficial analysis
   - 0pts: No analysis, just description

6. **Risk Analysis (20 points)**
   - 20pts: Identifies and evaluates key risks with nuance
   - 15pts: Identifies major risks with some evaluation
   - 10pts: Mentions risks but lacks evaluation
   - 5pts: Minimal risk consideration
   - 0pts: No risk analysis

IMPORTANT: Return your response as valid JSON in this EXACT format:
{
  "overall_score": <number 0-100>,
  "criteria": {
    "clarity": {
      "score": <number 0-20>,
      "feedback": "<one sentence explanation>"
    },
    "evidence": {
      "score": <number 0-20>,
      "feedback": "<one sentence explanation>"
    },
    "completeness": {
      "score": <number 0-20>,
      "feedback": "<one sentence explanation>"
    },
    "critical_thinking": {
      "score": <number 0-20>,
      "feedback": "<one sentence explanation>"
    },
    "risk_analysis": {
      "score": <number 0-20>,
      "feedback": "<one sentence explanation>"
    }
  },
  "summary": "<2-3 sentence overall assessment>"
}
`;

export function buildGradingPrompt(
  question: string, 
  studentAnswer: string, 
  context: string,
  expectedCompanyName?: string | null,
  expectedCompanySymbol?: string | null
): string {
  const companyCheck = expectedCompanyName && expectedCompanySymbol
    ? `\n\nEXPECTED COMPANY: The question is about ${expectedCompanyName} (${expectedCompanySymbol}). 
CRITICAL: If the student's answer references a different company or doesn't mention ${expectedCompanyName}/${expectedCompanySymbol}, give overall_score = 0.`
    : '';

  return `${GRADING_RUBRIC}

QUESTION:
${question}

CONTEXT PROVIDED TO STUDENT:
${context}${companyCheck}

STUDENT'S ANSWER:
${studentAnswer}

Grade this answer according to the rubric above. Be strict but fair.
${expectedCompanyName ? `Remember: If the answer doesn't reference ${expectedCompanyName} (${expectedCompanySymbol}), the overall_score must be 0.` : ''}`;
}

