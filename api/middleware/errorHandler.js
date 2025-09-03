/**
 * Error handling middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error caught by middleware:', err);

  // Default error
  let error = {
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.error = 'Validation Error';
    error.message = 'The data you provided is invalid.';
    error.details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid Token';
    error.message = 'The provided token is invalid.';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token Expired';
    error.message = 'Your session has expired. Please log in again.';
    return res.status(401).json(error);
  }

  // Rate limit errors
  if (err.status === 429) {
    error.error = 'Too Many Requests';
    error.message = 'You have made too many requests. Please try again later.';
    error.retryAfter = err.retryAfter;
    return res.status(429).json(error);
  }

  // Mongoose/MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    error.error = 'Database Error';
    error.message = 'There was an issue with the database. Please try again later.';
    return res.status(500).json(error);
  }

  // Email errors
  if (err.message && err.message.includes('SMTP')) {
    error.error = 'Email Service Error';
    error.message = 'There was an issue sending the email. Please try again later.';
    return res.status(500).json(error);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.error = 'File Too Large';
    error.message = 'The uploaded file is too large.';
    return res.status(413).json(error);
  }

  // Syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.error = 'Invalid JSON';
    error.message = 'The request body contains invalid JSON.';
    return res.status(400).json(error);
  }

  // Custom application errors
  if (err.isOperational) {
    error.error = err.name || 'Application Error';
    error.message = err.message;
    return res.status(err.statusCode || 500).json(error);
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.originalError = err.message;
  }

  // Send generic error in production
  res.status(500).json(error);
};

module.exports = errorHandler;
