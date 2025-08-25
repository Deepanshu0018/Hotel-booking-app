class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message);  // Correctly sets this.message
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;  // ✅ Correct export
