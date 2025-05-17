const jwt = require('jsonwebtoken');

exports.authenticateAdmin = (req, res, next) => {
  try {
    // 1. Dapatkan token dari header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header is required' 
      });
    }

    // 2. Pisahkan Bearer dari token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization format: Bearer [token]' 
      });
    }

    const token = tokenParts[1];
    
    // 3. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 4. Pastikan user adalah admin
    if (decoded.is_admin !== 1) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    // 5. Tambahkan user ke request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    let message = 'Authentication failed';
    if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      message = 'Token expired';
    }
    
    return res.status(401).json({ 
      success: false,
      message 
    });
  }
};