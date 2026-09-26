import { NextResponse } from 'next/server.js';

/**
 * Standard successful JSON response
 */
export function successResponse(data = null, status = 200, message = null) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== null) payload.data = data;
  return NextResponse.json(payload, { status });
}

/**
 * Standard error JSON response
 */
export function errorResponse(message = 'An error occurred', status = 400, errors = null) {
  const payload = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;
  return NextResponse.json(payload, { status });
}

/**
 * Robust handler for database and unexpected errors
 */
export function handleApiError(error) {
  console.error('API Error:', error);

  // Mongoose Validation Error
  if (error.name === 'ValidationError') {
    const errorMessages = Object.values(error.errors).map((err) => err.message);
    return errorResponse('Validation failed', 400, errorMessages);
  }

  // Mongoose Duplicate Key Error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'record';
    return errorResponse(`A duplicate entry already exists for: ${field}`, 409);
  }

  // Mongoose Invalid ObjectId CastError
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return errorResponse(`Invalid ID format for ${error.path || 'resource'}`, 400);
  }

  // General fallback
  const message = error.message || 'Internal server error';
  return errorResponse(message, 500);
}
