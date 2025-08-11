
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  sanitized?: string;
}

export interface ApiValidationResult {
  isValid: boolean;
  error?: {
    status: number;
    error: string;
    message: string;
  };
}

const DANGEROUS_PATTERNS = [
  /<script[^>]*>/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /<iframe[^>]*>/gi,
  /<object[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi
];

const XSS_PATTERNS = [
  /(\b)(o\S+)(\s*)=|javascript:|(<\s*)(\/*)script/gi,
  /expression\s*\(|url\s*\(.*javascript:/gi,
  /<\s*img[^>]*src[^>]*=([^>]*>)/gi
];


export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input;
  
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

export function validateNoteContent(content: string): ValidationResult {
  const errors: string[] = [];
  
  if (typeof content !== 'string') {
    return { isValid: false, errors: ['Note content must be a string'] };
  }
  
  const sanitized = sanitizeInput(content);

  if (sanitized.length > 5000) {
    errors.push('Note content cannot exceed 5000 characters');
  }
  
  if (sanitized.length === 0 && content.length > 0) {
    errors.push('Note content contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized
  };
}

// API Validation Functions

/**
 * Validates HTTP method for API requests
 */
export function validateHttpMethod(method: string | undefined, allowedMethods: string[]): ApiValidationResult {
  if (!method || !allowedMethods.includes(method)) {
    return {
      isValid: false,
      error: {
        status: 405,
        error: 'Method not allowed',
        message: `Only ${allowedMethods.join(', ')} requests are accepted`
      }
    };
  }
  return { isValid: true };
}

/**
 * Validates Content-Type header
 */
export function validateContentType(contentType: string | undefined, expectedType: string = 'application/json'): ApiValidationResult {
  if (!contentType || !contentType.includes(expectedType)) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: 'Invalid content type',
        message: `Content-Type must be ${expectedType}`
      }
    };
  }
  return { isValid: true };
}

/**
 * Validates request body exists and size
 */
export function validateRequestBody(body: unknown, maxSizeBytes: number = 10000): ApiValidationResult {
  if (!body) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: 'Invalid request',
        message: 'Request body is required'
      }
    };
  }

  const bodyStr = JSON.stringify(body);
  if (bodyStr.length > maxSizeBytes) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: 'Request too large',
        message: 'Request body exceeds size limit'
      }
    };
  }
  
  return { isValid: true };
}

/**
 * Validates UUID format (for board IDs, etc.)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUuid(id: string | undefined, fieldName: string = 'ID'): ApiValidationResult {
  if (!id) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: `Missing ${fieldName.toLowerCase()}`,
        message: `${fieldName} is required`
      }
    };
  }

  if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: `Invalid ${fieldName.toLowerCase()}`,
        message: `${fieldName} must be a valid UUID format`
      }
    };
  }

  if (id.length !== 36) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: `Invalid ${fieldName.toLowerCase()}`,
        message: `${fieldName} has invalid length`
      }
    };
  }

  return { isValid: true };
}

/**
 * Helper function to run multiple validations and return the first error
 */
export function runValidations(...validations: ApiValidationResult[]): ApiValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
}

// Turnstile API response interface
interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Validates Turnstile token with Cloudflare API
 */
export async function validateTurnstile(token: string | undefined): Promise<ApiValidationResult> {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
  
  // If turnstile is not configured, skip validation
  if (!turnstileSiteKey || !turnstileSecretKey) {
    return { isValid: true };
  }

  // Check if token is provided when turnstile is configured
  if (!token) {
    return {
      isValid: false,
      error: {
        status: 400,
        error: 'Missing Turnstile token',
        message: 'Turnstile verification is required'
      }
    };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: turnstileSecretKey,
        response: token,
      }),
    });

    const result: TurnstileResponse = await response.json();
    
    if (!result.success) {
      return {
        isValid: false,
        error: {
          status: 403,
          error: 'Invalid Turnstile token',
          message: 'Turnstile verification failed'
        }
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return {
      isValid: false,
      error: {
        status: 500,
        error: 'Turnstile validation error',
        message: 'Failed to verify Turnstile token'
      }
    };
  }
}