import { generateJSON } from './gemini-client';
import { buildGradingPrompt } from './prompts/grading-rubric';
import type { AIFeedback } from '@/types';

export async function gradeAnswer(
  question: string,
  studentAnswer: string,
  context: string,
  expectedCompanyName?: string | null,
  expectedCompanySymbol?: string | null
): Promise<AIFeedback> {
  const prompt = buildGradingPrompt(question, studentAnswer, context, expectedCompanyName, expectedCompanySymbol);
  
  try {
    console.log('Grading answer with prompt length:', prompt.length);
    const result = await generateJSON(prompt);
    
    // Validate the result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from AI');
    }
    
    // Ensure all required fields exist
    if (typeof result.overall_score !== 'number' || !result.criteria) {
      throw new Error('Missing required fields in AI response');
    }
    
    return result as AIFeedback;
  } catch (error: any) {
    console.error('Error grading answer:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    // Re-throw the error so the API route can handle it properly
    throw new Error(`Grading failed: ${error?.message || 'Unknown error'}`);
  }
}

