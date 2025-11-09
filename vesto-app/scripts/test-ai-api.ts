/**
 * Test script to verify Google AI Studio API integration
 * Run with: npx tsx scripts/test-ai-api.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testAIIntegration() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables');
    console.log('Please set it in your .env.local file:');
    console.log('GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log('Testing Google AI Studio API integration...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // Test MCQ grading
    console.log('Testing MCQ grading...');
    const mcqPrompt = `You are grading a multiple-choice question.

QUESTION: What does a P/E ratio of 25 mean?
OPTIONS:
A. The company has 25% profit margin
B. Investors pay $25 for every $1 of annual earnings
C. The stock price is $25
D. The company has 25% debt

CORRECT ANSWER: B - Investors pay $25 for every $1 of annual earnings
STUDENT'S SELECTED ANSWER: A - The company has 25% profit margin

Provide feedback in JSON format:
{
  "isCorrect": false,
  "explanation": "Explanation of correct answer",
  "whyWrong": "Why student's answer is wrong",
  "howToUnderstand": "How to better understand this",
  "correctAnswerExplanation": "Detailed explanation"
}`;

    const mcqResult = await model.generateContent(mcqPrompt);
    const mcqText = mcqResult.response.text();
    const mcqJson = JSON.parse(mcqText);
    
    console.log('✅ MCQ grading test passed');
    console.log('Response:', JSON.stringify(mcqJson, null, 2));
    console.log('');

    // Test written answer grading
    console.log('Testing written answer grading...');
    const writtenPrompt = `You are grading a written answer about financial analysis.

QUESTION: Explain what EBITDA means and why it's useful.
STUDENT'S ANSWER: EBITDA is earnings before interest, taxes, depreciation, and amortization. It's useful for comparing companies.

Provide feedback in JSON format with overall_score (0-100) and criteria scores (0-20 each):
{
  "overall_score": 75,
  "criteria": {
    "clarity": {"score": 15, "feedback": "Clear explanation"},
    "evidence": {"score": 10, "feedback": "Could use more examples"},
    "completeness": {"score": 15, "feedback": "Addresses the question"},
    "critical_thinking": {"score": 15, "feedback": "Shows understanding"},
    "risk_analysis": {"score": 20, "feedback": "N/A for this question"}
  },
  "summary": "Overall assessment"
}`;

    const writtenResult = await model.generateContent(writtenPrompt);
    const writtenText = writtenResult.response.text();
    const writtenJson = JSON.parse(writtenText);
    
    console.log('✅ Written answer grading test passed');
    console.log('Response:', JSON.stringify(writtenJson, null, 2));
    console.log('');

    console.log('🎉 All tests passed! Google AI Studio API is working correctly.');
  } catch (error: any) {
    console.error('❌ Error testing AI API:', error.message);
    if (error.message.includes('API_KEY')) {
      console.error('The API key appears to be invalid. Please check your GOOGLE_GENERATIVE_AI_API_KEY.');
    }
    process.exit(1);
  }
}

testAIIntegration();

