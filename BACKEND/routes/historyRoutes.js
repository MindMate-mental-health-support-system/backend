const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const authMiddleware = require('../middleware/authMiddleware');

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const checkSupabase = (req, res, next) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase is not configured yet. Please add SUPABASE_URL and SUPABASE_KEY to your .env file.' });
    }
    next();
};

// GET /api/history
// Uses req.userId from authMiddleware when available
router.get('/', checkSupabase, authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const limit = parseInt(req.query.limit, 10) || 50;

        const { data: history, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('Error fetching history:', error);
            return res.status(500).json({ error: 'Failed to fetch chat history' });
        }

        res.status(200).json({ history });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/history
// Expects: { message_data }
router.post('/', checkSupabase, authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { message_data } = req.body;

        if (!userId || !message_data) {
            return res.status(400).json({ error: 'userId and message_data are required' });
        }

        const { data, error } = await supabase
            .from('chat_history')
            .insert([
                {
                    user_id: userId,
                    message_data: message_data
                }
            ]);

        if (error) {
            console.error('Error saving message:', error);
            return res.status(500).json({ error: 'Failed to save message to history' });
        }

        res.status(201).json({ message: 'Saved successfully', data });
    } catch (error) {
        console.error('History API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
