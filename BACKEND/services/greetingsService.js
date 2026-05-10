/**
 * Greetings Detection Service
 * Detects greetings in multiple languages and returns appropriate responses
 * Supports: English, Malayalam, Hindi
 */

class GreetingsService {
  /**
   * Dictionary of greetings and responses in multiple languages
   */
  static GREETINGS = {
    // ENGLISH GREETINGS
    hi: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Hello! 👋 How are you doing today?',
        'Hey there! 😊 How\'s your day going?',
        'Hi! 👋 What can I help you with?',
      ],
    },
    hello: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Hello! 👋 How are you doing?',
        'Hey! 😊 Great to see you here!',
        'Hello there! How can I assist you?',
      ],
    },
    hey: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Hey! 👋 What\'s up?',
        'Hey there! 😊 How\'s everything?',
        'Hey! How can I help you today?',
      ],
    },
    good_morning: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good morning! ☀️ Hope you have a great day ahead!',
        'Good morning! 😊 Ready to tackle the day?',
        'Good morning! ☀️ How are you feeling today?',
      ],
    },
    goodmorning: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good morning! ☀️ Hope you have a great day ahead!',
        'Good morning! 😊 Ready to tackle the day?',
        'Good morning! ☀️ How are you feeling today?',
      ],
    },
    good_afternoon: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good afternoon! 🌤️ How\'s your day treating you?',
        'Good afternoon! 😊 Taking a break?',
        'Good afternoon! 🌤️ How\'re you doing?',
      ],
    },
    goodafternoon: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good afternoon! 🌤️ How\'s your day treating you?',
        'Good afternoon! 😊 Taking a break?',
        'Good afternoon! 🌤️ How\'re you doing?',
      ],
    },
    good_evening: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good evening! 🌙 How was your day?',
        'Good evening! 😊 Time to relax?',
        'Good evening! 🌙 How are you feeling?',
      ],
    },
    goodevening: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good evening! 🌙 How was your day?',
        'Good evening! 😊 Time to relax?',
        'Good evening! 🌙 How are you feeling?',
      ],
    },
    good_night: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good night! 🌙 Sleep well and take care!',
        'Good night! 😊 Have a peaceful sleep!',
        'Good night! 🌙 Rest well!',
      ],
    },
    goodnight: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Good night! 🌙 Sleep well and take care!',
        'Good night! 😊 Have a peaceful sleep!',
        'Good night! 🌙 Rest well!',
      ],
    },
    thanks: {
      language: 'en',
      type: 'gratitude',
      responses: [
        'You\'re welcome! 😊 Happy to help!',
        'My pleasure! 😊 Anything else I can do?',
        'Glad I could help! 👍 Let me know if you need anything!',
      ],
    },
    thank_you: {
      language: 'en',
      type: 'gratitude',
      responses: [
        'You\'re welcome! 😊 Happy to help!',
        'My pleasure! 😊 Anything else I can do?',
        'Glad I could help! 👍 Let me know if you need anything!',
      ],
    },
    thankyou: {
      language: 'en',
      type: 'gratitude',
      responses: [
        'You\'re welcome! 😊 Happy to help!',
        'My pleasure! 😊 Anything else I can do?',
        'Glad I could help! 👍 Let me know if you need anything!',
      ],
    },
    goodbye: {
      language: 'en',
      type: 'farewell',
      responses: [
        'Goodbye! 👋 Take care and see you soon!',
        'Bye! 😊 Have a great day!',
        'Goodbye! 👋 Feel free to come back anytime!',
      ],
    },
    bye: {
      language: 'en',
      type: 'farewell',
      responses: [
        'Bye! 👋 Take care!',
        'See you! 😊 Have a great day!',
        'Goodbye! 👋 Come back soon!',
      ],
    },
    see_you: {
      language: 'en',
      type: 'farewell',
      responses: [
        'See you! 👋 Take care!',
        'See you soon! 😊 Have a great day!',
        'See you later! 👋 Catch you soon!',
      ],
    },
    seeyou: {
      language: 'en',
      type: 'farewell',
      responses: [
        'See you! 👋 Take care!',
        'See you soon! 😊 Have a great day!',
        'See you later! 👋 Catch you soon!',
      ],
    },
    howdy: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Howdy! 🤠 How\'s it going?',
        'Hey there! 😊 What brings you here?',
        'Howdy! 👋 How can I help?',
      ],
    },
    whats_up: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Not much! 😊 How about you?',
        'All good! 👍 What\'s on your mind?',
        'Everything\'s good! 😊 What\'s up with you?',
      ],
    },
    whatsup: {
      language: 'en',
      type: 'greeting',
      responses: [
        'Not much! 😊 How about you?',
        'All good! 👍 What\'s on your mind?',
        'Everything\'s good! 😊 What\'s up with you?',
      ],
    },

    // MALAYALAM GREETINGS
    'namaste_ml': {
      language: 'ml',
      malayalam: 'നമസ്കാരം',
      type: 'greeting',
      responses: [
        'നമസ്കാരം! 🙏 നിങ്ങൾ എങ്ങനെ ഉണ്ട്?',
        'നമസ്കാരം! 👋 ഈ ദിവസം നല്ലതാണോ?',
        'നമസ്കാരം! 😊 എങ്ങനെ സഹായിക്കാം?',
      ],
    },
    'swagatham_ml': {
      language: 'ml',
      malayalam: 'സ്വാഗതം',
      type: 'greeting',
      responses: [
        'സ്വാഗതം! 👋 നന്ദി വരുന്നതിന്!',
        'സ്വാഗതം! 😊 എന്ത് വിഷയത്തിൽ സംസാരിക്കാം?',
        'സ്വാഗതം! 👋 എങ്ങനെ സാഹായ്യം ചെയ്യാം?',
      ],
    },
    'hai_ml': {
      language: 'ml',
      malayalam: 'ഹായ്',
      type: 'greeting',
      responses: [
        'ഹായ്! 👋 എങ്ങനെ ഉണ്ട്?',
        'ഹായ്! 😊 നല്ലതാണ് നിങ്ങളെ കാണാൻ!',
        'ഹായ്! 👋 എന്ത് വേണ്ടത്?',
      ],
    },
    'vanakkam_ml': {
      language: 'ml',
      malayalam: 'വണ്ണാകം',
      type: 'greeting',
      responses: [
        'വണ്ണാകം! 🙏 നിങ്ങൾ നന്നാണോ?',
        'വണ്ണാകം! 👋 എന്ത് വിഷയത്തിൽ സംസാരിക്കാം?',
        'വണ്ണാകം! 😊 എങ്ങനെ സഹായിക്കാം?',
      ],
    },
    'dhanyavaad_ml': {
      language: 'ml',
      malayalam: 'ധന്യവാദ',
      type: 'gratitude',
      responses: [
        'സ്വാഗതം! 😊 നന്നായി സഹായിക്കാൻ പറ്റി!',
        'സ്വാഗതം! 👍 അതു ഖുഷി!',
        'സ്വാഗതം! 😊 വേറെ എന്തെങ്കിലും വേണോ?',
      ],
    },
    'nanni_ml': {
      language: 'ml',
      malayalam: 'നന്നി',
      type: 'gratitude',
      responses: [
        'സ്വാഗതം! 😊 നന്നായി സഹായിക്കാൻ പറ്റി!',
        'സ്വാഗതം! 👍 കൂടുതൽ എന്തെങ്കിലും വേണോ?',
        'സ്വാഗതം! 😊 സഹായിക്കാൻ സന്തോഷം!',
      ],
    },
    'namukkal_ml': {
      language: 'ml',
      malayalam: 'നമുക്കൾ',
      type: 'farewell',
      responses: [
        'നമുക്കൾ! 👋 നന്നായി പോകുക!',
        'നമുക്കൾ! 😊 വീണ്ടും കാണാം!',
        'നമുക്കൾ! 👋 സൂക്ഷ്മമായി!',
      ],
    },
    'bye_ml': {
      language: 'ml',
      malayalam: 'ബായി',
      type: 'farewell',
      responses: [
        'ബായി! 👋 സൂക്ഷ്മമായി!',
        'ബായി! 😊 നല്ലതായ ദിവസം!',
        'ബായി! 👋 വീണ്ടും കാണാം!',
      ],
    },

    // HINDI GREETINGS
    'namaste_hi': {
      language: 'hi',
      hindi: 'नमस्ते',
      type: 'greeting',
      responses: [
        'नमस्ते! 🙏 आप कैसे हैं?',
        'नमस्ते! 👋 आपका दिन कैसा है?',
        'नमस्ते! 😊 मैं कैसे मदद कर सकता हूँ?',
      ],
    },
    'swaagat_hi': {
      language: 'hi',
      hindi: 'स्वागत',
      type: 'greeting',
      responses: [
        'स्वागत है! 👋 आपका स्वागत है!',
        'स्वागत है! 😊 क्या विषय पर बात करें?',
        'स्वागत है! 👋 मैं कैसे मदद कर सकता हूँ?',
      ],
    },
    'hi_hindi': {
      language: 'hi',
      hindi: 'हाय',
      type: 'greeting',
      responses: [
        'हाय! 👋 आप कैसे हैं?',
        'हाय! 😊 आपसे मिलकर खुशी हुई!',
        'हाय! 👋 क्या चाहिए?',
      ],
    },
    'shukriya_hi': {
      language: 'hi',
      hindi: 'शुक्रिया',
      type: 'gratitude',
      responses: [
        'आपका स्वागत है! 😊 मदद कर सके खुश हूँ!',
        'आपका स्वागत है! 👍 कुछ और चाहिए?',
        'आपका स्वागत है! 😊 अन्य कोई मदद?',
      ],
    },
    'shukkran_hi': {
      language: 'hi',
      hindi: 'शुक्रान',
      type: 'gratitude',
      responses: [
        'आपका स्वागत है! 😊 मदद कर सके खुश हूँ!',
        'आपका स्वागत है! 👍 कुछ और चाहिए?',
        'आपका स्वागत है! 😊 अन्य कोई मदद?',
      ],
    },
    'dhanyavaad_hi': {
      language: 'hi',
      hindi: 'धन्यवाद',
      type: 'gratitude',
      responses: [
        'आपका स्वागत है! 😊 मदद कर सके खुश हूँ!',
        'आपका स्वागत है! 👍 कुछ और चाहिए?',
        'आपका स्वागत है! 😊 अन्य कोई मदद?',
      ],
    },
    'alvida_hi': {
      language: 'hi',
      hindi: 'अलविदा',
      type: 'farewell',
      responses: [
        'अलविदा! 👋 सावधान रहें!',
        'अलविदा! 😊 एक अच्छा दिन!',
        'अलविदा! 👋 फिर मिलेंगे!',
      ],
    },
    'bye_hi': {
      language: 'hi',
      hindi: 'बाय',
      type: 'farewell',
      responses: [
        'बाय! 👋 सावधान रहें!',
        'बाय! 😊 एक अच्छा दिन!',
        'बाय! 👋 फिर मिलेंगे!',
      ],
    },
  };

  /**
   * Check if the text is a greeting
   * @param {string} text - User message
   * @returns {Object|null} - {isGreeting: boolean, type: string, responses: array[]} or null
   */
  static detectGreeting(text) {
    if (!text) return null;

    // Normalize text: lowercase, remove punctuation, trim
    const normalized = text
      .toLowerCase()
      .replace(/[.,!?;:\s]+/g, '_')
      .trim();

    // Check direct matches
    if (this.GREETINGS[normalized]) {
      const greeting = this.GREETINGS[normalized];
      return {
        isGreeting: true,
        type: greeting.type,
        language: greeting.language,
        responses: greeting.responses,
      };
    }

    // Check partial matches (in case of extra text)
    const words = text.toLowerCase().split(/[\s.,!?;:]+/);
    for (const word of words) {
      if (this.GREETINGS[word]) {
        const greeting = this.GREETINGS[word];
        return {
          isGreeting: true,
          type: greeting.type,
          language: greeting.language,
          responses: greeting.responses,
        };
      }
    }

    return null;
  }

  /**
   * Get random greeting response
   * @param {Object} greeting - Greeting object from detectGreeting
   * @returns {string} - Random response from the responses array
   */
  static getRandomResponse(greeting) {
    if (!greeting || !greeting.responses || greeting.responses.length === 0) {
      return 'Hello! 👋 How can I help you?';
    }

    const randomIndex = Math.floor(Math.random() * greeting.responses.length);
    return greeting.responses[randomIndex];
  }

  /**
   * Get all greetings in a language
   * @param {string} language - 'en', 'ml', 'hi'
   * @returns {Array} - Array of greetings in that language
   */
  static getGreetingsByLanguage(language) {
    return Object.entries(this.GREETINGS)
      .filter(([_, greeting]) => greeting.language === language)
      .map(([key, greeting]) => ({
        key,
        type: greeting.type,
        responses: greeting.responses,
      }));
  }

  /**
   * Get total greeting count
   * @returns {number} - Total number of greetings
   */
  static getTotalGreetings() {
    return Object.keys(this.GREETINGS).length;
  }

  /**
   * Get greeting statistics
   * @returns {Object} - Statistics of greetings
   */
  static getStatistics() {
    const stats = {
      total: this.getTotalGreetings(),
      byLanguage: {
        en: 0,
        ml: 0,
        hi: 0,
      },
      byType: {
        greeting: 0,
        gratitude: 0,
        farewell: 0,
      },
    };

    Object.values(this.GREETINGS).forEach((greeting) => {
      if (greeting.language) stats.byLanguage[greeting.language]++;
      if (greeting.type) stats.byType[greeting.type]++;
    });

    return stats;
  }
}

module.exports = GreetingsService;
