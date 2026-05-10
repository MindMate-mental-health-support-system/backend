/**
 * API Testing Examples & Usage Guide
 * Test the emotion-aware chatbot system with these examples
 */

// ============================================
// 1. NORMAL PIPELINE - TEXT EMOTION
// ============================================

/**
 * Example 1: Happy user (text)
 */
const happyTextRequest = {
  method: 'POST',
  url: 'http://localhost:5000/api/data/process',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    text: 'I just got promoted at work! I\'m so happy and excited about this opportunity!',
    userId: 'user123',
  }),
};

// Expected Response:
/**
{
  "success": true,
  "data": {
    "isCrisis": false,
    "response": "That's wonderful to hear! Keep nurturing this positive energy.",
    "detectedEmotion": "happy",
    "emotionConfidence": 0.92,
    "suggestions": [
      "Keep a gratitude journal to remember positive moments",
      "Share your joy with others - it spreads happiness",
      "Plan something fun to look forward to"
    ],
    "followUpQuestions": [
      "What made this moment special for you?",
      "How long have you been feeling this way?",
      "Is there someone you'd like to share this with?"
    ],
    "timestamp": "2026-02-23T10:30:00.000Z"
  }
}
*/

// ============================================
// 2. NORMAL PIPELINE - VOICE EMOTION
// ============================================

/**
 * Example 2: Sad user (voice)
 * Requires FormData with voice file and type
 */
const sadVoiceRequest = {
  method: 'POST',
  url: 'http://localhost:5000/api/data/process',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: `
    --boundary
    Content-Disposition: form-data; name="type"

    voice
    --boundary
    Content-Disposition: form-data; name="voice"; filename="sad_message.wav"
    Content-Type: audio/wav

    [BINARY AUDIO DATA]
    --boundary--
  `,
};

// Expected Response:
/**
{
  "success": true,
  "data": {
    "isCrisis": false,
    "response": "I'm sorry you're feeling down. Sadness is a valid emotion. Want to talk about it?",
    "detectedEmotion": "sad",
    "emotionConfidence": 0.88,
    "suggestions": [
      "Allow yourself to feel - sadness is natural",
      "Spend time with supportive people",
      "Try gentle physical activity like a walk",
      "Express your feelings through writing or art"
    ],
    "followUpQuestions": [
      "How long have you been feeling this way?",
      "Is there a specific trigger you can identify?",
      "Who in your life could support you right now?"
    ]
  }
}
*/

// ============================================
// 3. CRISIS PIPELINE - MODERATE SEVERITY
// ============================================

/**
 * Example 3: Moderate crisis (anxiety)
 */
const moderateCrisisRequest = {
  method: 'POST',
  url: 'http://localhost:5000/api/data/process',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    text: 'I\'m feeling really anxious and stressed about my upcoming exams. My anxiety is unbearable.',
    userId: 'user456',
  }),
};

// Expected Response:
/**
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "MODERATE",
    "supportMessage": "It sounds like you're going through a challenging time. Taking care of your mental health is important.",
    "resources": [
      {
        "name": "Sangath - Mental Health Support",
        "number": "011-41198666",
        "availability": "10 AM - 6 PM"
      },
      {
        "name": "TISS iCall Helpline",
        "number": "9152987821",
        "url": "https://icallhelpline.org",
        "availability": "Mon-Sat, 8 AM - 10 PM"
      }
    ],
    "detectedKeywords": ["anxious", "stress", "unbearable"],
    "detectedEmotion": "anxious",
    "guidedNextSteps": [
      "Journal about your feelings",
      "Practice stress-relief techniques (breathing, meditation)",
      "Maintain healthy routines (sleep, exercise, nutrition)",
      "Connect with supportive friends or family",
      "Consider talking to a counselor or therapist"
    ]
  }
}
*/

// ============================================
// 4. CRISIS PIPELINE - SEVERE CRISIS
// ============================================

/**
 * Example 4: Severe crisis (depression/hopelessness)
 */
const severeCrisisRequest = {
  method: 'POST',
  url: 'http://localhost:5000/api/data/process',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    text: 'I feel so depressed and hopeless. Everything is too difficult. I can\'t go on anymore.',
    userId: 'user789',
  }),
};

// Expected Response:
/**
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "SEVERE",
    "supportMessage": "I hear that you're struggling with deep pain. You deserve professional support to work through this.",
    "resources": [
      {
        "name": "SAMHSA National Helpline",
        "number": "1-800-662-4357",
        "url": "https://www.samhsa.gov/find-help/national-helpline",
        "availability": "24/7, Free & Confidential"
      },
      {
        "name": "Mental Health America",
        "url": "https://www.mhanational.org",
        "availability": "Online resources & screening"
      }
    ],
    "detectedKeywords": ["depressed", "hopeless", "can't go on"],
    "detectedEmotion": "sad",
    "guidedNextSteps": [
      "Schedule an appointment with a mental health professional",
      "Contact your doctor or psychiatrist",
      "Reach out to someone you trust about how you're feeling",
      "Practice self-care activities (exercise, sleep, nutrition)",
      "Consider joining a support group"
    ]
  }
}
*/

// ============================================
// 5. CRISIS PIPELINE - CRITICAL SEVERITY
// ============================================

/**
 * Example 5: Critical crisis (suicidal ideation) - IMMEDIATE ATTENTION
 */
const criticalCrisisRequest = {
  method: 'POST',
  url: 'http://localhost:5000/api/data/process',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    text: 'I want to die. I can\'t take this pain anymore. Suicide feels like the only way out.',
    userId: 'user999',
  }),
};

// Expected Response:
/**
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "CRITICAL",
    "supportMessage": "I'm really concerned about what you're sharing. Your safety is the most important thing right now.",
    "resources": [
      {
        "name": "Tele-MANAS (Govt of India Official Helpline)",
        "number": "14416",
        "altNumber": "1800-891-4416",
        "url": "https://telemanas.mohfw.gov.in",
        "availability": "24/7, Toll-Free, Multiple Languages"
      },
      {
        "name": "Kiran Mental Health Helpline (Govt of India)",
        "number": "1800-599-0019",
        "availability": "24/7, Toll-Free"
      },
      {
        "name": "NIMHANS Psychosocial Support Helpline",
        "number": "080-46110007",
        "availability": "24/7"
      }
    ],
    "detectedKeywords": ["want to die", "suicide"],
    "detectedEmotion": "sad",
    "guidedNextSteps": [
      "Contact a crisis helpline immediately (numbers provided above)",
      "Reach out to a trusted friend or family member",
      "Go to the nearest emergency room if you're in immediate danger",
      "Remove access to means of self-harm if possible",
      "Stay in a safe environment"
    ]
  }
}
*/

// ============================================
// 6. GET HEALTH CHECK
// ============================================

/**
 * Example 6: Health check endpoint
 */
const healthCheckRequest = {
  method: 'GET',
  url: 'http://localhost:5000/api/data/health',
};

// Expected Response:
/**
{
  "status": "operational",
  "timestamp": "2026-02-23T10:30:00.000Z",
  "services": {
    "emotion_detection": "mock",
    "voice_detection": "mock",
    "crisis_detection": "active"
  }
}
*/

// ============================================
// 7. GET CRISIS RESOURCES
// ============================================

/**
 * Example 7: Get resources for a specific severity
 */
const getResourcesRequest = {
  method: 'GET',
  url: 'http://localhost:5000/api/data/resources?severity=CRITICAL',
};

// Expected Response:
/**
{
  "severity": "CRITICAL",
  "resources": [
    {
      "name": "Tele-MANAS (Govt of India Official Helpline)",
      "number": "14416",
      "altNumber": "1800-891-4416",
      "url": "https://telemanas.mohfw.gov.in",
      "availability": "24/7, Toll-Free, Multiple Languages"
    },
    {
      "name": "Kiran Mental Health Helpline (Govt of India)",
      "number": "1800-599-0019",
      "availability": "24/7, Toll-Free"
    },
    {
      "name": "NIMHANS Psychosocial Support Helpline",
      "number": "080-46110007",
      "availability": "24/7"
    }
  ],
  "timestamp": "2026-02-23T10:30:00.000Z"
}
*/

// ============================================
// 8. CURL EXAMPLES
// ============================================

/**
 * Test with curl (text - happy)
 */
/*
curl -X POST http://localhost:5000/api/data/process \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "I just got promoted at work! I am so happy and excited!",
    "userId": "user123"
  }'
*/

/**
 * Test with curl (text - critical crisis)
 */
/*
curl -X POST http://localhost:5000/api/data/process \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "I want to die. I cannot take this pain anymore.",
    "userId": "user999"
  }'
*/

/**
 * Test with curl (voice)
 */
/*
curl -X POST http://localhost:5000/api/data/process \
  -F "type=voice" \
  -F "voice=@path/to/audio.wav" \
  -F "userId=user456"
*/

/**
 * Test health endpoint
 */
/*
curl http://localhost:5000/api/data/health
*/

/**
 * Get critical resources
 */
/*
curl "http://localhost:5000/api/data/resources?severity=CRITICAL"
*/

module.exports = {
  happyTextRequest,
  sadVoiceRequest,
  moderateCrisisRequest,
  severeCrisisRequest,
  criticalCrisisRequest,
  healthCheckRequest,
  getResourcesRequest,
};
