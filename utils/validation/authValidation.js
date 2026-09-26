const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates registration payload
 */
export function validateRegistration(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const { name, email, password } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  } else if (name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    } : null,
  };
}

/**
 * Validates login payload
 */
export function validateLogin(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const { email, password } = data;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: email.trim().toLowerCase(),
      password,
    } : null,
  };
}
