// Script to list available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');
    console.log('\nFetching available models...\n');

    try {
        // Try to list models using the API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );

        if (!response.ok) {
            console.error('Error:', response.status, response.statusText);
            const error = await response.json();
            console.error('Details:', JSON.stringify(error, null, 2));
            return;
        }

        const data = await response.json();

        console.log('Available models:');
        console.log('=================');

        if (data.models) {
            data.models.forEach(model => {
                console.log(`- ${model.name}`);
                console.log(`  Display: ${model.displayName}`);
                console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ')}`);
                console.log('');
            });
        } else {
            console.log('No models found');
        }

    } catch (error) {
        console.error('Error listing models:', error.message);
    }
}

listModels();
