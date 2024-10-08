const axios = require('axios');
const API_URL = process.env.USER_SERVICE_URL ? `${process.env.USER_SERVICE_URL}/auth` : "http://localhost:8000/auth";

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  try {
    const response = await axios.get(`${API_URL}/verify-token`, {
      headers: {
        Authorization: authHeader
      }
    });
    req.user = response.data.data; // Attach the user information to the request
    next();
  } catch (err) {
    console.error("Error verifying token:", err.message);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

const verifyIsAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized to access this resource" });
  }
}

module.exports = {
  verifyAccessToken,
  verifyIsAdmin,
};