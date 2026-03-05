const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Only initialize if we have the keys, otherwise it will crash
const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Helper to check if Supabase is configured
const checkSupabase = (req, res, next) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase is not configured yet. Please add SUPABASE_URL and SUPABASE_KEY to your .env file.' });
    }
    next();
};

// POST /api/users/signup
router.post('/signup', checkSupabase, async (req, res) => {
    try {
        const { email, password, username, gender, age } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, and username are required.' });
        }

        // 1. Check if username already exists in profiles
        const { data: existingUser, error: checkError } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken.' });
        }

        // Ignore the error if no rows returned (which means username is available)

        // 2. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        const userId = authData.user?.id;

        if (!userId) {
            return res.status(500).json({ error: 'Failed to create user in Auth.' });
        }

        // 3. Create profile in the Custom Profiles Table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { id: userId, username, email, gender, age: parseInt(age) || null }
            ]);

        if (profileError) {
            console.error("Profile creation error:", profileError);
            return res.status(500).json({ error: 'User created in auth, but failed to create profile.' });
        }

        res.status(201).json({ message: 'User created successfully', user: { id: userId, username, email } });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users/login
router.post('/login', checkSupabase, async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email OR username

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Username/Email and password are required.' });
        }

        let emailToLogin = identifier;

        // If identifier doesn't have an '@', assume it's a username and fetch the email
        if (!identifier.includes('@')) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('email, id')
                .eq('username', identifier)
                .single();

            if (profileError || !profile) {
                return res.status(400).json({ error: 'Invalid username or password.' });
            }
            emailToLogin = profile.email;
        }

        // Sign in using Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: emailToLogin,
            password,
        });

        if (authError) {
            return res.status(400).json({ error: 'Invalid username/email or password.' });
        }

        // Fetch profile to return username
        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', authData.user.id)
            .single();

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                username: profile?.username || identifier
            },
            session: authData.session
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
