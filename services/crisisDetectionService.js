/**
 * Crisis Detection Service
 * Detects crisis-related keywords and flags messages requiring immediate support
 */

class CrisisDetectionService {
  /**
   * Crisis keywords organized by severity
   */
  static CRISIS_KEYWORDS = {
    CRITICAL: [
      'suicide', 'suicidal', 'kill myself', 'end my life',
      'harm myself', 'self harm', 'self-harm',
      'overdose', 'jump off',
      'no point living', 'life is meaningless',
      'want to die', 'dying', 'end it all'
    ],
    SEVERE: [
      'depressed', 'depression', 'hopeless', 'hopelessness',
      'worthless', 'worthless life',
      'can\'t go on', 'can\'t take it anymore',
      'suffering', 'unbearable',
      'alone', 'isolation', 'lonely',
      'panic', 'panic attack', 'severe anxiety',
      'trauma', 'traumatic', 'ptsd'
    ],
    MODERATE: [
      'anxious', 'anxiety', 'stressed', 'stress',
      'sad', 'sadness', 'upset',
      'struggling', 'struggle', 'difficult',
      'overwhelmed', 'overwhelm',
      'angry', 'rage', 'irritated'
    ]
  };

  /**
   * Supportive resources for crisis situations
   */
  static CRISIS_RESOURCES = {
    CRITICAL: [
      {
        name: 'National Suicide Prevention Lifeline (US)',
        number: '988',
        url: 'https://988lifeline.org',
        availability: '24/7',
      },
      {
        name: 'Crisis Text Line',
        number: 'Text HOME to 741741',
        url: 'https://www.crisistextline.org',
        availability: '24/7',
      },
      {
        name: 'International Association for Suicide Prevention',
        url: 'https://www.iasp.info/resources/Crisis_Centres/',
        availability: 'Worldwide resources',
      },
    ],
    SEVERE: [
      {
        name: 'SAMHSA National Helpline',
        number: '1-800-662-4357',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
        availability: '24/7, Free & Confidential',
      },
      {
        name: 'Mental Health America',
        url: 'https://www.mhanational.org',
        availability: 'Online resources & screening',
      },
    ],
  };

  /**
   * Detect crisis indicators in text
   * @param {string} text - User message to analyze
   * @returns {{isCrisis: boolean, severity: string|null, keywords: string[], matchedSeverity: string|null}}
   */
  static detectCrisis(text) {
    if (!text || typeof text !== 'string') {
      return {
        isCrisis: false,
        severity: null,
        keywords: [],
        matchedSeverity: null,
      };
    }

    const lowerText = text.toLowerCase();
    const foundKeywords = [];
    let highestSeverity = null;
    let matchedSeverity = null;

    // Check CRITICAL keywords (highest priority)
    for (const keyword of CrisisDetectionService.CRISIS_KEYWORDS.CRITICAL) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        if (!highestSeverity) {
          highestSeverity = 'CRITICAL';
          matchedSeverity = 'CRITICAL';
        }
      }
    }

    // Check SEVERE keywords if no CRITICAL found
    if (!highestSeverity) {
      for (const keyword of CrisisDetectionService.CRISIS_KEYWORDS.SEVERE) {
        if (lowerText.includes(keyword)) {
          foundKeywords.push(keyword);
          if (!highestSeverity) {
            highestSeverity = 'SEVERE';
            matchedSeverity = 'SEVERE';
          }
        }
      }
    }

    // Check MODERATE keywords if no higher severity found
    if (!highestSeverity) {
      for (const keyword of CrisisDetectionService.CRISIS_KEYWORDS.MODERATE) {
        if (lowerText.includes(keyword)) {
          foundKeywords.push(keyword);
          highestSeverity = 'MODERATE';
          matchedSeverity = 'MODERATE';
          break; // Only need one moderate match
        }
      }
    }

    return {
      isCrisis: highestSeverity !== null,
      severity: highestSeverity,
      keywords: [...new Set(foundKeywords)], // Remove duplicates
      matchedSeverity: matchedSeverity,
    };
  }

  /**
   * Get supportive resources based on crisis severity
   * @param {string} severity - Crisis severity level (CRITICAL, SEVERE, MODERATE)
   * @returns {object[]} Array of support resources
   */
  static getResourcesForSeverity(severity) {
    return CrisisDetectionService.CRISIS_RESOURCES[severity] || [];
  }

  /**
   * Generate crisis support message
   * @param {string} severity - Crisis severity level
   * @param {string} userEmotion - Detected emotion from AI model
   * @returns {string} Supportive message for user
   */
  static generateCrisisSupportMessage(severity, userEmotion) {
    const supportMessages = {
      CRITICAL: [
        'I\'m really concerned about what you\'re sharing. Your safety is the most important thing right now.',
        'What you\'re experiencing sounds overwhelming. Please reach out to a crisis professional who can provide immediate support.',
        'You\'re not alone in this. There are people trained to help you through this exact situation, available right now.',
      ],
      SEVERE: [
        'I hear that you\'re struggling with deep pain. You deserve professional support to work through this.',
        'What you\'re describing sounds really difficult. A mental health professional can help you develop coping strategies.',
        'Your wellbeing matters. Please consider reaching out to a therapist or counselor who can provide specialized support.',
      ],
      MODERATE: [
        'It sounds like you\'re going through a challenging time. Taking care of your mental health is important.',
        'These feelings are valid. Consider speaking with a mental health professional about what you\'re experiencing.',
        'You\'re dealing with something real and difficult. Support is available whenever you\'re ready.',
      ],
    };

    const messages = supportMessages[severity] || supportMessages.MODERATE;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get comprehensive crisis response package
   * @param {string} userText - Original user message
   * @param {string} detectedEmotion - Emotion detected by AI
   * @param {string} severity - Crisis severity
   * @returns {object} Complete crisis response package
   */
  static getCrisisResponsePackage(userText, detectedEmotion, severity) {
    const crisisAnalysis = CrisisDetectionService.detectCrisis(userText);
    const supportMessage = CrisisDetectionService.generateCrisisSupportMessage(
      severity,
      detectedEmotion
    );
    const resources = CrisisDetectionService.getResourcesForSeverity(severity);

    return {
      isCrisis: true,
      severity,
      supportMessage,
      resources,
      detectedKeywords: crisisAnalysis.keywords,
      detectedEmotion,
      guidedNextSteps: CrisisDetectionService.getGuidedNextSteps(severity),
    };
  }

  /**
   * Provide guided next steps for the user
   * @param {string} severity - Crisis severity
   * @returns {string[]} Array of recommended next steps
   */
  static getGuidedNextSteps(severity) {
    const steps = {
      CRITICAL: [
        'Contact a crisis helpline immediately (numbers provided above)',
        'Reach out to a trusted friend or family member',
        'Go to the nearest emergency room if you\'re in immediate danger',
        'Remove access to means of self-harm if possible',
        'Stay in a safe environment',
      ],
      SEVERE: [
        'Schedule an appointment with a mental health professional',
        'Contact your doctor or psychiatrist',
        'Reach out to someone you trust about how you\'re feeling',
        'Practice self-care activities (exercise, sleep, nutrition)',
        'Consider joining a support group',
      ],
      MODERATE: [
        'Journal about your feelings',
        'Practice stress-relief techniques (breathing, meditation)',
        'Maintain healthy routines (sleep, exercise, nutrition)',
        'Connect with supportive friends or family',
        'Consider talking to a counselor or therapist',
      ],
    };

    return steps[severity] || steps.MODERATE;
  }
}

module.exports = CrisisDetectionService;
