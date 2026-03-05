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
      // English Standard
      'suicide', 'suicidal', 'kill myself', 'end my life',
      'harm myself', 'self harm', 'self-harm',
      'overdose', 'jump off', 'slit my wrists', 'take pills', 'hang myself', 'shoot myself',
      'no point living', 'life is meaningless', 'better off dead', 'don\'t want to wake up',
      'want to die', 'dying', 'end it all', 'end the pain',
      // Emotion-specific (Extreme Anger / Deep Despair)
      'going to hurt someone', 'want to kill', 'make them pay', 'destroy everything', 'ruin their life',
      // Hindi (Native Script)
      'मर जाना चाहता', 'खत्म करना', 'जीने का कोई फायदा नहीं', 'खुदकुशी', 'आत्महत्या',
      'जान देना', 'फांसी लगाना', 'जहर खाना', 'जिंदगी से तंग', 'मरने का मन',
      'किसी को मार दूंगा', 'सब कुछ खत्म', 'अपनी जान ले लूंगा', 'मरने की इच्छा',
      // Malayalam (Native Script)
      'മരിക്കാൻ', 'ജീവിതം അവസാനിപ്പിക്കാൻ', 'മരണം', 'ആത്മഹത്യ', 'കൊല ചെയ്യാൻ',
      'ചാകണം', 'വിഷം കഴിക്കാൻ', 'തൂങ്ങി മരിക്കാൻ', 'ജീവിച്ചിരിക്കാൻ താല്പര്യമില്ല',
      'എല്ലാം അവസാനിപ്പിക്കുകയാണ്', 'സ്വയം ഇല്ലാതാക്കാൻ'
    ],
    SEVERE: [
      // English Standard
      'depressed', 'depression', 'hopeless', 'hopelessness',
      'worthless', 'worthless life', 'feeling empty', 'complete despair',
      'can\'t go on', 'can\'t take it anymore', 'losing my mind', 'going crazy',
      'suffering', 'unbearable', 'broken heart', 'grief and loss',
      'alone', 'isolation', 'lonely', 'abandoned',
      'panic', 'panic attack', 'severe anxiety',
      'trauma', 'traumatic', 'ptsd',
      // Emotion-specific (Fear / Extreme Sadness / Shock)
      'intense fear', 'terrified for my life', 'uncontrollable rage', 'deeply broken',
      // Hindi (Native Script)
      'बहुत अकेला', 'कुछ ठीक नहीं', 'दर्द', 'घबराहट', 'डर लग रहा', 'बेचैनी',
      'निराश', 'तनाव', 'घुटन', 'सह नहीं सकता', 'टूट गया हूँ', 'रोने का मन', 'दिमाग खराब', 'भयानक डर',
      // Malayalam (Native Script)
      'വിഷമിച്ചിരിക്കുന്നു', 'വേദന', 'പേടി', 'ഭയം', 'ശ്വാസം മുട്ടുന്നു', 'തകർന്നു',
      'നിരാശ', 'ഏകാന്തത', 'സഹിക്കാൻ പറ്റുന്നില്ല', 'കടുത്ത സങ്കടം', 'കരയാൻ തോന്നുന്നു', 'ഹൃദയം തകർന്നു'
    ],
    MODERATE: [
      // English Standard
      'anxious', 'anxiety', 'stressed', 'stress', 'worried', 'nervous',
      'sad', 'sadness', 'upset', 'feeling down', 'blue',
      'struggling', 'struggle', 'difficult', 'hard time',
      'overwhelmed', 'overwhelm', 'too much to handle',
      'angry', 'rage', 'irritated', 'annoyed', 'frustrated',
      // Emotion-specific (Surprise / Frustration)
      'feeling shocked', 'feeling lost', 'need a break', 'so mad', 'really scared', 'confused',
      // Hindi (Native Script)
      'उदास', 'परेशान', 'दुखी', 'गुस्सा', 'थक गया', 'चिंता', 'बुरा लग रहा', 'अकेलापन',
      // Malayalam (Native Script)
      'സങ്കടം', 'ദേഷ്യം', 'തളരുന്നു', 'വ്യാകുലത', 'ടെൻഷൻ', 'ക്ഷീണം', 'ബുദ്ധിമുട്ട്', 'ഒറ്റപ്പെടൽ'
    ]
  };

  /**
   * Supportive resources for crisis situations (Official Government of India Resources)
   */
  static CRISIS_RESOURCES = {
    CRITICAL: [
      {
        name: 'Tele-MANAS (Govt of India Official Helpline)',
        number: '14416',
        altNumber: '1800-891-4416',
        url: 'https://telemanas.mohfw.gov.in',
        availability: '24/7, Toll-Free, Multiple Languages',
      },
      {
        name: 'Kiran Mental Health Helpline (Govt of India)',
        number: '1800-599-0019',
        availability: '24/7, Toll-Free',
      },
      {
        name: 'NIMHANS Psychosocial Support Helpline',
        number: '080-46110007',
        availability: '24/7',
      },
    ],
    SEVERE: [
      {
        name: 'Sangath - Mental Health Support',
        number: '011-41198666',
        availability: '10 AM - 6 PM',
      },
      {
        name: 'TISS iCall Helpline',
        number: '9152987821',
        url: 'https://icallhelpline.org',
        availability: 'Mon-Sat, 8 AM - 10 PM',
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
