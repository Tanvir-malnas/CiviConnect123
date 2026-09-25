
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { GoogleGenAI } from '@google/genai';
import civiKnowledge from './chatbot/knowledge.js';
import { findSemanticAnswer } from './chatbot/semanticMatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==========================================
// GEMINI AI
// ==========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ==========================================
// CIVICONNECT KNOWLEDGE + INTENT MATCHING
// ==========================================

const findKnowledgeAnswer = (message) => {
  const normalizedMessage = message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // ------------------------------------------
  // 1. Direct knowledge matching
  // ------------------------------------------

  for (const item of civiKnowledge) {
    const matched = item.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase())
    );

    if (matched) {
      return item.answer;
    }
  }

  // ------------------------------------------
  // 2. Intent-based matching
  // ------------------------------------------

  const hasComplaintWord =
    /\b(complaint|complain|issue|problem|report|request)\b/.test(
      normalizedMessage
    );

  const hasSubmitIntent =
    /\b(submit|file|create|raise|make|report|register|send)\b/.test(
      normalizedMessage
    );

  const hasTrackIntent =
    /\b(track|status|progress|check|follow|history)\b/.test(
      normalizedMessage
    );

  const hasLoginIntent =
    /\b(login|log in|signin|sign in|password)\b/.test(
      normalizedMessage
    );

  const hasRegisterIntent =
    /\b(register|registration|signup|sign up|account)\b/.test(
      normalizedMessage
    );

  // ------------------------------------------
  // Submit complaint
  // ------------------------------------------

  if (hasComplaintWord && hasSubmitIntent) {
    const item = civiKnowledge.find(
      (item) => item.id === 'submit-complaint'
    );

    return item?.answer || null;
  }

  // ------------------------------------------
  // Track complaint
  // ------------------------------------------

  if (hasComplaintWord && hasTrackIntent) {
    const item = civiKnowledge.find(
      (item) => item.id === 'track-complaint'
    );

    return item?.answer || null;
  }

  // ------------------------------------------
  // Login
  // ------------------------------------------

  if (hasLoginIntent) {
    const item = civiKnowledge.find(
      (item) => item.id === 'login'
    );

    return item?.answer || null;
  }

  // ------------------------------------------
  // Registration
  // ------------------------------------------

  if (hasRegisterIntent) {
    const item = civiKnowledge.find(
      (item) => item.id === 'register'
    );

    return item?.answer || null;
  }

  return null;
};

// ==========================================
// CORS
// ==========================================

const clientOrigin =
  process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === clientOrigin ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// HTTP LOGGER
// ==========================================

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ==========================================
// UPLOADS
// ==========================================

const uploadsDir = path.join(__dirname, '../uploads');

app.use('/uploads', express.static(uploadsDir));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'CiviConnect API',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// AI CHATBOT
// ==========================================

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // ------------------------------------------
    // Validate message
    // ------------------------------------------

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // ------------------------------------------
// First: exact + intent matching
// ------------------------------------------

const knowledgeAnswer = findKnowledgeAnswer(message);

if (knowledgeAnswer) {
  return res.status(200).json({
    success: true,
    reply: knowledgeAnswer,
    source: 'civi-knowledge',
  });
}

// ------------------------------------------
// Second: semantic matching
// ------------------------------------------

const semanticAnswer = await findSemanticAnswer(
  message,
  civiKnowledge
);

console.log("Semantic result:", semanticAnswer);

if (semanticAnswer?.confidence === 'high') {
  return res.status(200).json({
    success: true,
    reply: semanticAnswer.answer,
    source: semanticAnswer.source,
    score: semanticAnswer.score,
  });
}

if (semanticAnswer?.confidence === 'medium') {
  return res.status(200).json({
    success: true,
    reply: 'I can help you report an issue. Could you tell me what kind of problem it is, such as garbage, potholes, streetlights, water supply, or something else?',
    source: 'civi-semantic-clarification',
    score: semanticAnswer.score,
  });
}

    // ------------------------------------------
    // Second: Gemini fallback
    // ------------------------------------------

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',

      contents: `
You are Civi Assistant, the official assistant for the
CiviConnect municipal services platform.

Your job is to help users understand and use CiviConnect.

Rules:

- Only answer questions related to CiviConnect.
- Be friendly, clear, concise, and helpful.
- Do not invent CiviConnect features.
- Do not claim that a feature exists unless you have information
  confirming it.
- If you do not know whether CiviConnect supports something,
  clearly say that you do not have that information.
- Do not pretend to perform actions such as submitting complaints,
  changing account information, or checking private user data.
- If the question is unrelated to CiviConnect, politely explain
  that you can only help with CiviConnect.

User message:
${message}
      `,
    });

    const reply = response.text;

    return res.status(200).json({
      success: true,
      reply,
      source: 'gemini',
    });
  } catch (error) {
    console.error('Gemini API Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to get AI response',
    });
  }
});

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// 404 FALLBACK
// ==========================================

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error('[Application Error]:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;

