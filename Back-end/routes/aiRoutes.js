import express from 'express';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Configuration constants
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// Simple in-memory rate limiting (consider Redis for production)
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    // Clean up old entries
    for (const [key, entry] of rateLimitStore) {
        if (entry.timestamp < windowStart) {
            rateLimitStore.delete(key);
        }
    }
    
    const userEntry = rateLimitStore.get(ip) || { count: 0, timestamp: now };
    
    if (userEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.'
        });
    }
    
    rateLimitStore.set(ip, {
        count: userEntry.count + 1,
        timestamp: now
    });
    
    next();
};

// AI Chat endpoint with rate limiting
router.post('/chat', authMiddleware, rateLimiter, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message must be a non-empty string'
            });
        }

        // Validate conversation history structure
        if (!Array.isArray(conversationHistory) || 
            conversationHistory.some(msg => !msg.sender || !msg.text)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation history format'
            });
        }

        // Prepare messages for GitHub Models API
        const messages = [
            {
                role: 'system',
                content: 'You are AI-Forge, a helpful assistant integrated into a Todo/Task management application called Todo Forge. You help users with task management, productivity tips, and general assistance. Keep your responses concise and helpful.'
            },
            ...conversationHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            {
                role: 'user',
                content: message
            }
        ];

        // API call with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        const response = await fetch(process.env.AI_API_URL || 'https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                model: process.env.AI_MODEL || DEFAULT_MODEL,
                messages: messages,
                max_tokens: parseInt(process.env.AI_MAX_TOKENS) || DEFAULT_MAX_TOKENS,
                temperature: parseFloat(process.env.AI_TEMPERATURE) || DEFAULT_TEMPERATURE,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('GitHub Models API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            
            // Handle specific GitHub Models API errors
            let errorMessage = 'AI service temporarily unavailable';
            if (errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('rate limit')) {
                errorMessage = 'AI service unavailable: Rate limit exceeded. Please try again later.';
            } else if (errorData.error?.message?.includes('invalid') || errorData.error?.message?.includes('unauthorized')) {
                errorMessage = 'AI service configuration error: Please check GitHub token configuration.';
            }
            
            return res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorData.error?.message || 'API request failed'
            });
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from AI service');
        }

        res.json({
            success: true,
            message: data.choices[0].message.content,
            usage: data.usage,
            model: data.model
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        
        if (error.name === 'AbortError') {
            return res.status(504).json({
                success: false,
                message: 'AI service timeout. Please try again.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Enhanced health check
router.get('/health', authMiddleware, async (req, res) => {
    try {
        const isConfigured = !!process.env.GITHUB_TOKEN;
        let serviceAvailable = false;
        
        if (isConfigured) {
            // Simple API validation request
            const testResponse = await fetch(process.env.AI_API_URL || 'https://models.inference.ai.azure.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1
                })
            });
            serviceAvailable = testResponse.ok;
        }
        
        res.json({
            success: true,
            configured: isConfigured,
            service_available: serviceAvailable,
            model: process.env.AI_MODEL || DEFAULT_MODEL,
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Test endpoint for debugging API key issues
router.post('/test', authMiddleware, async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
        
        if (!apiKey) {
            return res.json({
                success: false,
                message: 'OPENAI_API_KEY not configured',
                debug: {
                    env_loaded: !!process.env.OPENAI_API_KEY,
                    api_url: apiUrl
                }
            });
        }
        
        // Test the API key
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Hello, this is a test.' }
                ],
                max_tokens: 50,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        res.json({
            success: response.ok,
            status: response.status,
            api_key_prefix: apiKey.substring(0, 12) + '...',
            response: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            debug: {
                env_loaded: !!process.env.OPENAI_API_KEY,
                api_url: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
            }
        });
    }
});

// Fallback chat endpoint for testing without API key
router.post('/chat-fallback', authMiddleware, async (req, res) => {
    const { message } = req.body;
    
    // Simulate AI response for testing
    const responses = [
        "I'm here to help you with your tasks! What would you like to work on?",
        "That's a great question! Let me think about the best approach for your task management.",
        "I can help you organize your todos more effectively. What's your current challenge?",
        "Based on your message, I'd suggest breaking down your task into smaller, manageable steps.",
        "I'm AI-Forge, your productivity assistant. How can I help you manage your tasks better?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
        success: true,
        message: `[TEST MODE] ${randomResponse}`,
        usage: { total_tokens: 50 },
        model: 'fallback-test'
    });
});

export default router;
