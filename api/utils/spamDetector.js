/**
 * Advanced Spam Detection Algorithm
 * Analyzes form submissions for spam indicators
 */

class SpamDetector {
  constructor() {
    this.spamKeywords = [
      // Common spam words
      'viagra', 'cialis', 'pharmacy', 'casino', 'gambling', 'lottery', 'winner',
      'congratulations', 'million dollars', 'inheritance', 'prince', 'urgent',
      'click here', 'limited time', 'act now', 'free money', 'make money fast',
      'work from home', 'business opportunity', 'weight loss', 'lose weight',
      'debt', 'credit repair', 'loan', 'mortgage', 'refinance', 'investment',
      
      // Suspicious patterns
      'http://', 'https://', 'www.', '.com', '.net', '.org', '.info', '.biz',
      'bitcoin', 'cryptocurrency', 'forex', 'trading', 'profit', 'income',
      'supplement', 'pills', 'medication', 'prescription', 'doctor',
      
      // Marketing spam
      'seo', 'marketing', 'promotion', 'advertising', 'backlinks', 'traffic',
      'ranking', 'google', 'website traffic', 'increase sales', 'roi'
    ];

    this.suspiciousPatterns = [
      /\b\d{3,}\s*%\b/g, // High percentages
      /\$\d+/g, // Money amounts
      /\b[A-Z]{4,}\b/g, // Excessive caps
      /!!!+/g, // Multiple exclamation marks
      /\?\?\?+/g, // Multiple question marks
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses in message
      /https?:\/\/[^\s]+/g, // URLs
    ];

    this.threshold = parseInt(process.env.SPAM_SCORE_THRESHOLD) || 7;
    this.maxLinksAllowed = parseInt(process.env.MAX_LINKS_ALLOWED) || 2;
    this.maxCapsPercentage = parseInt(process.env.MAX_CAPS_PERCENTAGE) || 30;
  }

  /**
   * Main spam detection method
   * @param {Object} formData - The form submission data
   * @returns {Object} Analysis result with score and details
   */
  analyzeMessage(formData) {
    const { name, email, message } = formData;
    let spamScore = 0;
    const flags = [];

    // Combine all text for analysis
    const fullText = `${name} ${email} ${message}`.toLowerCase();

    // 1. Check for spam keywords
    const keywordScore = this.checkSpamKeywords(fullText);
    spamScore += keywordScore.score;
    if (keywordScore.score > 0) flags.push(...keywordScore.flags);

    // 2. Check suspicious patterns
    const patternScore = this.checkSuspiciousPatterns(message);
    spamScore += patternScore.score;
    if (patternScore.score > 0) flags.push(...patternScore.flags);

    // 3. Check message length and quality
    const qualityScore = this.checkMessageQuality(message);
    spamScore += qualityScore.score;
    if (qualityScore.score > 0) flags.push(...qualityScore.flags);

    // 4. Check for excessive links
    const linkScore = this.checkLinks(message);
    spamScore += linkScore.score;
    if (linkScore.score > 0) flags.push(...linkScore.flags);

    // 5. Check email format and domain
    const emailScore = this.checkEmail(email);
    spamScore += emailScore.score;
    if (emailScore.score > 0) flags.push(...emailScore.flags);

    // 6. Check name validity
    const nameScore = this.checkName(name);
    spamScore += nameScore.score;
    if (nameScore.score > 0) flags.push(...nameScore.flags);

    // 7. Check for repetitive content
    const repetitionScore = this.checkRepetition(message);
    spamScore += repetitionScore.score;
    if (repetitionScore.score > 0) flags.push(...repetitionScore.flags);

    const isSpam = spamScore >= this.threshold;

    return {
      isSpam,
      spamScore,
      threshold: this.threshold,
      confidence: Math.min(100, Math.round((spamScore / this.threshold) * 100)),
      flags,
      analysis: {
        keywords: keywordScore.score,
        patterns: patternScore.score,
        quality: qualityScore.score,
        links: linkScore.score,
        email: emailScore.score,
        name: nameScore.score,
        repetition: repetitionScore.score
      }
    };
  }

  checkSpamKeywords(text) {
    let score = 0;
    const flags = [];
    const foundKeywords = [];

    this.spamKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        score += 1;
      }
    });

    if (foundKeywords.length > 0) {
      flags.push(`Spam keywords detected: ${foundKeywords.join(', ')}`);
    }

    return { score, flags };
  }

  checkSuspiciousPatterns(message) {
    let score = 0;
    const flags = [];

    this.suspiciousPatterns.forEach((pattern, index) => {
      const matches = message.match(pattern);
      if (matches) {
        switch (index) {
          case 0: // High percentages
            flags.push(`High percentage claims: ${matches.join(', ')}`);
            score += matches.length;
            break;
          case 1: // Money amounts
            flags.push(`Money amounts mentioned: ${matches.length} times`);
            score += matches.length * 0.5;
            break;
          case 2: // Excessive caps
            if (matches.length > 3) {
              flags.push(`Excessive capitalization: ${matches.length} instances`);
              score += 2;
            }
            break;
          case 3: // Multiple exclamation marks
            flags.push(`Excessive exclamation marks`);
            score += matches.length;
            break;
          case 4: // Multiple question marks
            flags.push(`Excessive question marks`);
            score += matches.length;
            break;
          case 5: // Email addresses
            flags.push(`Email addresses in message: ${matches.length}`);
            score += matches.length * 2;
            break;
          case 6: // URLs
            flags.push(`URLs in message: ${matches.length}`);
            score += matches.length;
            break;
        }
      }
    });

    return { score, flags };
  }

  checkMessageQuality(message) {
    let score = 0;
    const flags = [];

    // Check message length
    if (message.length < 10) {
      flags.push('Message too short');
      score += 3;
    } else if (message.length > 5000) {
      flags.push('Message unusually long');
      score += 2;
    }

    // Check for gibberish (high consonant ratio)
    const consonants = message.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
    const vowels = message.match(/[aeiou]/gi) || [];
    if (consonants.length > 0 && vowels.length > 0) {
      const consonantRatio = consonants.length / (consonants.length + vowels.length);
      if (consonantRatio > 0.7) {
        flags.push('Potential gibberish content');
        score += 2;
      }
    }

    // Check capitalization percentage
    const totalLetters = message.match(/[a-zA-Z]/g) || [];
    const capitalLetters = message.match(/[A-Z]/g) || [];
    if (totalLetters.length > 0) {
      const capsPercentage = (capitalLetters.length / totalLetters.length) * 100;
      if (capsPercentage > this.maxCapsPercentage) {
        flags.push(`Excessive capitalization: ${Math.round(capsPercentage)}%`);
        score += 2;
      }
    }

    return { score, flags };
  }

  checkLinks(message) {
    let score = 0;
    const flags = [];
    
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = message.match(urlPattern) || [];
    
    if (urls.length > this.maxLinksAllowed) {
      flags.push(`Too many links: ${urls.length} (max allowed: ${this.maxLinksAllowed})`);
      score += (urls.length - this.maxLinksAllowed) * 2;
    }

    return { score, flags };
  }

  checkEmail(email) {
    let score = 0;
    const flags = [];

    // Check for suspicious domains
    const suspiciousDomains = [
      'tempmail.', 'guerrillamail.', '10minutemail.', 'mailinator.',
      'throwaway.', 'temp-mail.', 'guerrilla.mail.'
    ];

    const domain = email.split('@')[1];
    if (domain) {
      suspiciousDomains.forEach(suspDomain => {
        if (domain.includes(suspDomain)) {
          flags.push(`Temporary email domain: ${domain}`);
          score += 3;
        }
      });
    }

    // Check for random-looking email addresses
    const localPart = email.split('@')[0];
    if (localPart && localPart.length > 15 && /^[a-z0-9]+$/.test(localPart)) {
      flags.push('Randomly generated email address');
      score += 1;
    }

    return { score, flags };
  }

  checkName(name) {
    let score = 0;
    const flags = [];

    // Check for obviously fake names
    const fakeName = /^(test|admin|user|name|john|jane)\s*(test|admin|user|doe)?$/i;
    if (fakeName.test(name.trim())) {
      flags.push('Potentially fake name');
      score += 2;
    }

    // Check for numbers in name
    if (/\d/.test(name)) {
      flags.push('Numbers in name');
      score += 1;
    }

    // Check for excessive length or too short
    if (name.length < 2) {
      flags.push('Name too short');
      score += 2;
    } else if (name.length > 50) {
      flags.push('Name unusually long');
      score += 1;
    }

    return { score, flags };
  }

  checkRepetition(message) {
    let score = 0;
    const flags = [];

    // Check for repeated words
    const words = message.toLowerCase().split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Only check words longer than 3 characters
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    let repetitiveWords = 0;
    Object.entries(wordCount).forEach(([word, count]) => {
      if (count > 3) {
        repetitiveWords++;
      }
    });

    if (repetitiveWords > 2) {
      flags.push(`Repetitive content: ${repetitiveWords} words repeated excessively`);
      score += repetitiveWords;
    }

    return { score, flags };
  }
}

module.exports = SpamDetector;
