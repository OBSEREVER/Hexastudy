/**
 * HexaStudy — Full-Stack Server
 * Express Backend with Vite Dev Middlewares & Failure-Isolated AI Plug-in Routes
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Simple circuit breaker for AI calls
let consecutiveFailures = 0;
let circuitBreakerOpenUntil = 0;

function isCircuitBreakerOpen(): boolean {
  if (Date.now() < circuitBreakerOpenUntil) return true;
  return false;
}

function recordSuccess() {
  consecutiveFailures = 0;
  circuitBreakerOpenUntil = 0;
}

function recordFailure() {
  consecutiveFailures += 1;
  if (consecutiveFailures >= 3) {
    // Open circuit breaker for 30 seconds
    circuitBreakerOpenUntil = Date.now() + 30000;
  }
}

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// OPTIONAL AI PLUG-IN ENDPOINTS (/api/ai/*)
// CORE functionality never depends on these.
// ==========================================

// 1. Health & Circuit Breaker Status
app.get('/api/ai/status', (req, res) => {
  res.json({
    available: !!ai && !isCircuitBreakerOpen(),
    provider: apiKey ? 'gemini' : 'none',
    circuitBreakerOpen: isCircuitBreakerOpen(),
    consecutiveFailures,
  });
});

// 2. Structured Narrative Commentary Generation
app.post('/api/ai/narrative', async (req, res) => {
  if (isCircuitBreakerOpen()) {
    return res.status(503).json({
      error: 'AI service temporarily unavailable (circuit breaker open). Try again in 30s.',
    });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured. Running in offline zero-AI mode.',
    });
  }

  const { snapshot } = req.body;
  if (!snapshot) {
    return res.status(400).json({ error: 'Missing assessment snapshot in body.' });
  }

  try {
    const prompt = `Analyze this college student's academic diagnostic assessment snapshot:
Subject Breakdown:
${snapshot.subjects
  .map(
    (s: any) =>
      `- ${s.subjectName} (${s.subjectCode}): Score ${s.score}/5.0. Coverage: ${s.ratings.coverage}, Concepts: ${s.ratings.understanding}, Problems: ${s.ratings.problemSolving}, Practical: ${s.ratings.practical}, Exam Readiness: ${s.ratings.examReadiness}.`
  )
  .join('\n')}

Overall Mean: ${snapshot.overallMean}/5.0.
Strongest Subject: ${snapshot.gapAnalysis.highestSubject?.name}
Lowest Subject: ${snapshot.gapAnalysis.lowestSubject?.name}
Lowest Dimension Across Subjects: ${snapshot.gapAnalysis.lowestDimension?.label}

Provide a concise, realistic, objective interpretation. Return JSON with the following structure:
{
  "narrativeText": "A 2-3 paragraph objective analysis of their readiness, distinguishing superficial coverage from deep exam preparedness.",
  "strengths": ["Array of 2-3 specific verified strengths"],
  "criticalRisks": ["Array of 2-3 critical failure risks or gaps that need urgent attention"],
  "examStrategy": ["Array of 2-3 concrete study advice points"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    recordSuccess();

    res.json({
      id: `ai_${Date.now()}`,
      assessmentId: snapshot.id,
      provider: 'gemini',
      model: 'gemini-3.5-flash',
      narrativeText: parsed.narrativeText || 'Analysis generated successfully.',
      strengths: parsed.strengths || [],
      criticalRisks: parsed.criticalRisks || [],
      examStrategy: parsed.examStrategy || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    recordFailure();
    console.error('Gemini narrative error:', err);
    res.status(500).json({
      error: err.message || 'AI generation failed. Core features remain operational.',
    });
  }
});

// 3. Text-to-Speech (TTS) Narration using gemini-3.8-flash-tts
app.post('/api/ai/tts', async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text string.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // Enforce reasonable length
              speechMetadata: {
                style: 'Clear, encouraging academic advisor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data returned from Gemini TTS.');
    }

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    res.setHeader('Content-Type', 'audio/wav');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('Gemini TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed.' });
  }
});

// 4. Multi-Turn CSE Tutor Chat with Search Grounding & High Thinking
app.post('/api/ai/chat', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      reply: 'AI Chat is currently offline. Your local Study Repository & CSE Suite remain 100% functional.',
    });
  }

  const { message, history, useSearch, useThinking, subjectContext } = req.body;

  try {
    const systemInstruction = `You are HexaStudy, an expert Computer Science & Engineering academic tutor and advisor.
The student is currently enrolled in: ${subjectContext || 'Computer Science courses'}.
Help them understand complex algorithms, Operating Systems derivations, Database normalization, Computer Architecture pipelining, and semester exam tips.
Be concise, mathematically accurate, and provide code examples in C, Python, or SQL when asked.`;

    const modelName = useThinking
      ? 'gemini-3.1-pro-preview'
      : useSearch
      ? 'gemini-3.5-flash'
      : 'gemini-3.5-flash';

    const config: any = {
      systemInstruction,
    };

    if (useThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config,
    });

    const reply = response.text || 'I processed your query.';

    // Extract search grounding sources if present
    const sources: { title: string; url: string }[] = [];
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      groundingChunks.forEach((c: any) => {
        if (c.web?.uri) {
          sources.push({ title: c.web.title || c.web.uri, url: c.web.uri });
        }
      });
    }

    res.json({
      reply,
      sources,
      thinking: useThinking ? 'Deep algorithmic reasoning applied with gemini-3.1-pro-preview.' : undefined,
    });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({
      reply: `Error communicating with AI: ${err.message}. Your local workstation remains fully accessible.`,
    });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HexaStudy Windows 11 Workstation server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();
