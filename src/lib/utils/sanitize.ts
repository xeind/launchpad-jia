import validator from "validator";

/**
 * Decode HTML entities back to normal characters
 * @param text - The text with HTML entities
 * @returns Decoded text
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }
  // Use browser's DOMParser if available, otherwise use a simple regex approach
  if (typeof window !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }
  // Server-side fallback: decode common entities
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }
  // Simple sanitization: escape HTML entities
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize plain text input by escaping HTML entities
 * @param text - The text to sanitize
 * @returns Escaped text
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }
  return validator.escape(text);
}

/**
 * Validate and sanitize email address
 * @param email - The email to validate and sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }
  const normalized = validator.normalizeEmail(email);
  if (normalized && validator.isEmail(normalized)) {
    return normalized;
  }
  return null;
}

/**
 * Sanitize career form data
 * @param careerData - The career form data
 * @returns Sanitized career data
 */
export function sanitizeCareerData(careerData: any) {
  const sanitized = { ...careerData };

  // Sanitize text fields
  if (sanitized.jobTitle) sanitized.jobTitle = sanitizeText(sanitized.jobTitle);
  if (sanitized.description)
    sanitized.description = sanitizeHtml(sanitized.description);
  if (sanitized.workSetupRemarks)
    sanitized.workSetupRemarks = sanitizeText(sanitized.workSetupRemarks);
  if (sanitized.cvSecretPrompt)
    sanitized.cvSecretPrompt = sanitizeText(sanitized.cvSecretPrompt);
  if (sanitized.aiInterviewSecretPrompt)
    sanitized.aiInterviewSecretPrompt = sanitizeText(
      sanitized.aiInterviewSecretPrompt,
    );

  // Sanitize pre-screening questions
  // Note: We don't escape question text because it's displayed as plain text, not HTML
  // Escaping would convert apostrophes to HTML entities like &#x27;
  if (
    sanitized.preScreeningQuestions &&
    Array.isArray(sanitized.preScreeningQuestions)
  ) {
    sanitized.preScreeningQuestions = sanitized.preScreeningQuestions.map(
      (q: any) => ({
        ...q,
        // Keep question text as-is for display
        question: q.question || "",
        // Keep options as-is for display
        options: q.options || [],
      }),
    );
  }

  // Sanitize AI interview questions
  // Note: We don't escape question text because it's displayed as plain text, not HTML
  if (sanitized.aiInterviewQuestions) {
    for (const category in sanitized.aiInterviewQuestions) {
      if (sanitized.aiInterviewQuestions[category]?.questions) {
        sanitized.aiInterviewQuestions[category].questions =
          sanitized.aiInterviewQuestions[category].questions.map((q: any) => ({
            ...q,
            // Keep question text as-is for display
            text: q.text || "",
          }));
      }
    }
  }

  // Sanitize pipeline stages
  if (sanitized.pipelineStages && Array.isArray(sanitized.pipelineStages)) {
    sanitized.pipelineStages = sanitized.pipelineStages.map((stage: any) => ({
      ...stage,
      name: sanitizeText(stage.name),
      substages: stage.substages
        ? stage.substages.map((sub: any) => ({
            ...sub,
            name: sanitizeText(sub.name),
          }))
        : stage.substages,
    }));
  }

  // Sanitize team members
  if (sanitized.teamMembers && Array.isArray(sanitized.teamMembers)) {
    sanitized.teamMembers = sanitized.teamMembers.map((member: any) => ({
      ...member,
      name: sanitizeText(member.name),
      email: sanitizeEmail(member.email) || member.email,
    }));
  }

  return sanitized;
}
