export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
