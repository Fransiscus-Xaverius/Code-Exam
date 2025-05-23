// server/middleware/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  };