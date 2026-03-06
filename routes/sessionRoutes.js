const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const authMiddleware = require('../middleware/authMiddleware');
const AIContentService = require('../services/aiContentService');

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const checkSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase is not configured yet. Please add SUPABASE_URL and SUPABASE_KEY to your .env file.',
    });
  }
  next();
};

// GET /api/sessions
// Returns all (non-archived) sessions for the authenticated user, ordered by last_message_at desc
router.get('/', checkSupabase, authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const limit = parseInt(req.query.limit, 10) || 50;

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('last_message_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }

    res.status(200).json({ sessions: data || [] });
  } catch (error) {
    console.error('Sessions GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sessions
// Body: { title? }
router.post('/', checkSupabase, authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([
        {
          user_id: userId,
          title: title || 'New session',
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.status(201).json({ session: data });
  } catch (error) {
    console.error('Sessions POST error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/:sessionId/history
router.get('/:sessionId/history', checkSupabase, authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: 'sessionId and userId are required' });
    }

    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching session history:', error);
      return res.status(500).json({ error: 'Failed to fetch session history' });
    }

    res.status(200).json({ history: data || [] });
  } catch (error) {
    console.error('Session history GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sessions/:sessionId/messages
// Body: { message_data, mood? }
router.post('/:sessionId/messages', checkSupabase, authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;
    const { message_data, mood } = req.body;

    if (!sessionId || !userId || !message_data) {
      return res.status(400).json({
        error: 'sessionId, userId and message_data are required',
      });
    }

    const now = new Date().toISOString();
    const lastMessage = Array.isArray(message_data) && message_data.length > 0
      ? message_data[message_data.length - 1]
      : null;

    const lastPreview = lastMessage && typeof lastMessage.text === 'string'
      ? lastMessage.text.slice(0, 180)
      : null;

    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('title')
      .eq('id', sessionId)
      .single();

    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          message_data,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Error saving session message:', error);
      return res.status(500).json({ error: 'Failed to save message to history' });
    }

    // Update session metadata (best-effort; ignore failures)
    try {
      const updatePayload = {
        last_message_at: now,
      };

      if (lastPreview) {
        updatePayload.last_message_preview = lastPreview;
      }

      if (mood) {
        updatePayload.mood = mood;
      }

      // Automatically generate a session title if it is still the default
      if (sessionData && sessionData.title === 'New session' && message_data.length > 0) {
        const firstUserMessage = message_data.find(m => m.sender === 'user');
        if (firstUserMessage && firstUserMessage.text) {
          try {
            const aiAvailable = await AIContentService.isAvailable();
            if (aiAvailable) {
              const prompt = `Summarize the following message into a short, concise title (maximum 3 to 4 words). Return ONLY the title with no quotes, no extra text, and no punctuation: "${firstUserMessage.text.slice(0, 500)}"`;
              const generatedTitle = await AIContentService.callAI(prompt);
              if (generatedTitle && generatedTitle.trim()) {
                updatePayload.title = generatedTitle.trim().replace(/^"|"$/g, '');
              }
            }
          } catch (titleErr) {
            console.error('Failed to generate AI title:', titleErr.message);
          }
        }
      }

      await supabase
        .from('chat_sessions')
        .update(updatePayload)
        .eq('id', sessionId);
    } catch (updateError) {
      console.error('Error updating session metadata:', updateError);
    }

    res.status(201).json({ message: 'Saved successfully', data });
  } catch (error) {
    console.error('Session messages POST error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

