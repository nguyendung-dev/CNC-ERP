/**
 * Generic field validator middleware
 * @param {string[]} requiredFields 
 */
function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const val = req.body[field];
      return val === undefined || val === null || val === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Thiếu các trường thông tin bắt buộc: ${missing.join(', ')}`,
        missingFields: missing,
      });
    }

    next();
  };
}

module.exports = {
  validateBody,
};
