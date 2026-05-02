const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token provided." });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lpu_super_secret_key');
        req.user = decoded; // Contains regNo and role
        next();
    } catch (error) {
        res.status(401).json({ error: "Not authorized, token failed or expired." });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
};

module.exports = { protect, adminOnly };
