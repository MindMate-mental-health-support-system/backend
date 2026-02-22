/**
 * Response Service
 * Generates contextual responses based on emotion and crisis status
 */

class ResponseService {
  /**
   * Emotion-based supportive responses (normal pipeline)
   */
  static EMOTION_RESPONSES = {
    happy: [
      'That\'s wonderful to hear! Keep nurturing this positive energy.',
      'I\'m glad you\'re feeling good! What\'s contributing to your happiness?',
      'Your happiness is contagious! Keep celebrating these good moments.',
    ],
    sad: [
      'I\'m sorry you\'re feeling down. Sadness is a valid emotion. Want to talk about it?',
      'It\'s okay to feel sad sometimes. Is there something specific troubling you?',
      'I\'m here to listen. What\'s making you feel this way?',
    ],
    angry: [
      'It sounds like you\'re frustrated. Taking a moment to breathe might help.',
      'Anger can be a signal that something important matters to you. What triggered this?',
      'Your feelings are valid. Let\'s work through what\'s making you angry.',
    ],
    anxious: [
      'Anxiety can feel overwhelming. Let\'s work through this together.',
      'What you\'re feeling is understandable. Have you tried grounding techniques?',
      'Take a deep breath. Anxiety is treatable, and you\'re not alone in this.',
    ],
    neutral: [
      'How are you really doing today?',
      'I\'m here to listen if you need to talk about anything.',
      'What\'s on your mind?',
    ],
    calm: [
      'You seem grounded right now. That\'s a strength.',
      'It\'s great that you\'re feeling calm. How can I support you?',
      'Your peace is valuable. How can I help you maintain it?',
    ],
    excited: [
      'Your enthusiasm is energizing! What\'s got you so excited?',
      'I love your energy! Tell me more about what\'s happening.',
      'That excitement shows you care about something. Share with me!',
    ],
  };

  /**
   * Generate normal (non-crisis) response
   * @param {string} userEmotion - Detected emotion
   * @param {number} emotionConfidence - Confidence score of emotion detection
   * @param {string} userMessage - Original user message
   * @returns {object} Response package
   */
  static generateNormalResponse(userEmotion, emotionConfidence, userMessage) {
    const emotionKey = userEmotion.toLowerCase();
    const responses = ResponseService.EMOTION_RESPONSES[emotionKey] ||
                     ResponseService.EMOTION_RESPONSES.neutral;
    
    const selectedResponse = responses[
      Math.floor(Math.random() * responses.length)
    ];

    return {
      isCrisis: false,
      response: selectedResponse,
      detectedEmotion: userEmotion,
      emotionConfidence,
      suggestions: ResponseService.getSuggestionsForEmotion(userEmotion),
      followUpQuestions: ResponseService.getFollowUpQuestions(userEmotion),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get coping suggestions based on emotion
   * @param {string} emotion - User's emotion
   * @returns {string[]} Array of suggestions
   */
  static getSuggestionsForEmotion(emotion) {
    const suggestions = {
      happy: [
        'Keep a gratitude journal to remember positive moments',
        'Share your joy with others - it spreads happiness',
        'Plan something fun to look forward to',
      ],
      sad: [
        'Allow yourself to feel - sadness is natural',
        'Spend time with supportive people',
        'Try gentle physical activity like a walk',
        'Express your feelings through writing or art',
      ],
      angry: [
        'Take a timeout to cool down (5-10 minutes)',
        'Try physical activity to release tension',
        'Practice the "STOP" technique: Stop, Take a breath, Observe, Proceed',
        'Identify what triggered the anger',
      ],
      anxious: [
        'Practice deep breathing: 4-7-8 technique',
        'Ground yourself with the 5-4-3-2-1 sensory technique',
        'Limit caffeine and get adequate sleep',
        'Exercise regularly to manage anxiety',
      ],
      neutral: [
        'Reflect on what you\'re grateful for',
        'Set a small, achievable goal for today',
        'Check in with how you\'re really feeling',
      ],
      calm: [
        'Maintain your current practices that keep you grounded',
        'Share your peace with others',
        'Use this clarity to tackle important tasks',
      ],
      excited: [
        'Channel this energy into productive action',
        'Share your excitement with supportive people',
        'Document this moment for later reflection',
      ],
    };

    return suggestions[emotion.toLowerCase()] || suggestions.neutral;
  }

  /**
   * Generate follow-up questions to deepen conversation
   * @param {string} emotion - User's emotion
   * @returns {string[]} Array of follow-up questions
   */
  static getFollowUpQuestions(emotion) {
    const questions = {
      happy: [
        'What made this moment special for you?',
        'How long have you been feeling this way?',
        'Is there someone you\'d like to share this with?',
      ],
      sad: [
        'How long have you been feeling this way?',
        'Is there a specific trigger you can identify?',
        'Who in your life could support you right now?',
      ],
      angry: [
        'What specifically triggered your anger?',
        'Is this a new issue or something ongoing?',
        'What would help you feel better?',
      ],
      anxious: [
        'What are you most worried about?',
        'When did this anxiety start?',
        'What usually helps you feel calmer?',
      ],
      neutral: [
        'What brought you here today?',
        'Is there anything specific on your mind?',
        'How can I best support you?',
      ],
      calm: [
        'What\'s contributing to your sense of calm?',
        'How are you managing your wellbeing right now?',
        'What practices have helped you maintain this peace?',
      ],
      excited: [
        'What\'s the source of your excitement?',
        'What are you looking forward to?',
        'How are you planning to make this happen?',
      ],
    };

    return questions[emotion.toLowerCase()] || questions.neutral;
  }

  /**
   * Validate response completeness
   * @param {object} response - Response object to validate
   * @returns {boolean} Whether response is valid
   */
  static isValidResponse(response) {
    return response &&
           response.response &&
           response.detectedEmotion &&
           typeof response.emotionConfidence === 'number' &&
           response.suggestions &&
           Array.isArray(response.suggestions) &&
           response.followUpQuestions &&
           Array.isArray(response.followUpQuestions);
  }
}

module.exports = ResponseService;
