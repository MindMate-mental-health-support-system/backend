/**
 * Response Service
 * Generates contextual responses based on emotion and crisis status
 */

class ResponseService {
  /**
   * Emotion-based supportive responses (normal pipeline)
   */
  static EMOTION_RESPONSES = {
    joy: [
      'That\'s wonderful to hear! Keep nurturing this positive energy.',
      'I\'m glad you\'re feeling good! What\'s contributing to your joy?',
      'Your happiness is contagious! Keep celebrating these good moments.',
    ],
    sadness: [
      'I\'m sorry you\'re feeling down. Sadness is a valid emotion. Want to talk about it?',
      'It\'s okay to feel sad sometimes. Is there something specific troubling you?',
      'I\'m here to listen. What\'s making you feel this way?',
    ],
    anger: [
      'It sounds like you\'re frustrated. Taking a moment to breathe might help.',
      'Anger can be a signal that something important matters to you. What triggered this?',
      'Your feelings are valid. Let\'s work through what\'s making you angry.',
    ],
    fear: [
      'Fear and anxiety can feel overwhelming. Let\'s work through this together.',
      'What you\'re feeling is understandable. Have you tried grounding techniques?',
      'Take a deep breath. You are safe here, and you\'re not alone in this.',
    ],
    love: [
      'That is so beautiful to hear. Connection and love are so important.',
      'It\'s wonderful that you\'re feeling love right now. How is it making you feel overall?',
      'Cherish these moments of warmth and affection.',
    ],
    surprise: [
      'Oh, wow! That sounds unexpected. How are you processing that?',
      'That must have been surprising! Is it a good kind of surprise?',
      'I love hearing about the unexpected. Tell me more about what happened!',
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
      ResponseService.EMOTION_RESPONSES.sadness;

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
      joy: [
        'Keep a gratitude journal to remember positive moments',
        'Share your joy with others - it spreads happiness',
        'Plan something fun to look forward to',
      ],
      sadness: [
        'Allow yourself to feel - sadness is natural',
        'Spend time with supportive people',
        'Try gentle physical activity like a walk',
        'Express your feelings through writing or art',
      ],
      anger: [
        'Take a timeout to cool down (5-10 minutes)',
        'Try physical activity to release tension',
        'Practice the "STOP" technique: Stop, Take a breath, Observe, Proceed',
        'Identify what triggered the anger',
      ],
      fear: [
        'Practice deep breathing: 4-7-8 technique',
        'Ground yourself with the 5-4-3-2-1 sensory technique',
        'Limit caffeine and get adequate sleep',
        'Focus on the present moment and things you can control',
      ],
      love: [
        'Express your appreciation to the people you care about',
        'Reflect on the positive relationships in your life',
        'Carry this warm feeling into your daily interactions',
      ],
      surprise: [
        'Give yourself a moment to process the unexpected news',
        'Journal about how this surprise makes you feel',
        'Discuss what just happened with a close friend',
      ],
    };

    return suggestions[emotion.toLowerCase()] || suggestions.sadness;
  }

  /**
   * Generate follow-up questions to deepen conversation
   * @param {string} emotion - User's emotion
   * @returns {string[]} Array of follow-up questions
   */
  static getFollowUpQuestions(emotion) {
    const questions = {
      joy: [
        'What made this moment special for you?',
        'How long have you been feeling this way?',
        'Is there someone you\'d like to share this with?',
      ],
      sadness: [
        'How long have you been feeling this way?',
        'Is there a specific trigger you can identify?',
        'Who in your life could support you right now?',
      ],
      anger: [
        'What specifically triggered your anger?',
        'Is this a new issue or something ongoing?',
        'What would help you feel better?',
      ],
      fear: [
        'What are you most afraid of right now?',
        'When did this fear or anxiety start?',
        'What usually helps you feel safer or calmer?',
      ],
      love: [
        'What makes this feeling so strong for you today?',
        'How does this connection impact your daily life?',
        'Can you tell me more about what inspired this?',
      ],
      surprise: [
        'What was your initial reaction?',
        'Does this change anything significant for you?',
        'How are you planning to proceed?',
      ],
    };

    return questions[emotion.toLowerCase()] || questions.sadness;
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
