// Standardized API response helper

/**
 * Send a successful response
 */
const success = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    ...data
  });
};

/**
 * Send an error response
 */
const error = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    message
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 */
const validationError = (res, errors) => {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors
  });
};

/**
 * Send a not found response
 */
const notFound = (res, message = "Resource not found") => {
  res.status(404).json({
    success: false,
    message
  });
};

/**
 * Send a conflict response (duplicate)
 */
const conflict = (res, message = "Resource already exists") => {
  res.status(409).json({
    success: false,
    message
  });
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  conflict
};
