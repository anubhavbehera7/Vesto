import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Check if API key is set
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables',
          message: 'Please check your .env.local file'
        },
        { status: 500 }
      );
    }

    if (apiKey.length < 20) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API key appears to be invalid (too short)',
          message: 'Please verify your API key in .env.local'
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list available models first
    let availableModels: string[] = [];
    try {
      const models = await genAI.listModels();
      availableModels = models.map((m: any) => m.name || m).slice(0, 10);
    } catch (e) {
      // Ignore if listing fails
    }

    // Try different free model names (prioritize free models)
    const modelNames = [
      'gemini-2.5-flash',   // Free tier - latest flash model
      'gemini-2.0-flash-exp', // Free tier - experimental
      'gemini-1.5-flash',   // Free tier - fast and efficient
      'gemini-pro',         // Free tier - older but reliable
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro-latest'
    ];

    let workingModel: string | null = null;
    let testResult: any = null;
    let lastError: any = null;

    // Test each model name
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const testPrompt = 'Say "Hello" in one word.';
        const result = await model.generateContent(testPrompt);
        const response = result.response.text();
        
        if (response && response.length > 0) {
          workingModel = modelName;
          testResult = response;
          break;
        }
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }

    if (!workingModel) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Could not find a working model',
          lastError: lastError?.message || 'Unknown error',
          availableModels: availableModels.length > 0 ? availableModels : 'Could not list models',
          triedModels: modelNames,
          message: 'None of the tested model names worked. Check the Gemini API documentation for the correct model name.'
        },
        { status: 500 }
      );
    }

    // Test JSON generation with the working model
    let jsonTestSuccess = false;
    let jsonResponse: any = null;
    try {
      const model = genAI.getGenerativeModel({ 
        model: workingModel,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const jsonPrompt = `Return a JSON object with this exact structure: {"status": "success", "message": "API is working", "test": true}`;
      const result = await model.generateContent(jsonPrompt);
      const text = result.response.text();
      jsonResponse = JSON.parse(text);
      jsonTestSuccess = jsonResponse.status === 'success';
    } catch (e) {
      // JSON test failed, but text generation works
    }

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working correctly!',
      workingModel: workingModel,
      tests: {
        apiKeySet: true,
        apiKeyLength: apiKey.length,
        textGeneration: {
          prompt: 'Say "Hello" in one word.',
          response: testResult,
          success: true
        },
        jsonGeneration: {
          success: jsonTestSuccess,
          response: jsonResponse
        }
      },
      availableModels: availableModels.length > 0 ? availableModels : 'Could not list models'
    });
  } catch (error: any) {
    console.error('Gemini API test error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Unknown error',
        details: error.toString(),
        message: 'Gemini API test failed. Check your API key and network connection.'
      },
      { status: 500 }
    );
  }
}

