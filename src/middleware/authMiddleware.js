const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid Bearer token" });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded; // Inject decoded payload (e.g. { clientId: "..." })
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Token expired or invalid" });
  }
};

module.exports = authMiddleware;
