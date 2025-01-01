const jwt = require('jsonwebtoken');
const JWT_SECRET = "feroz123";
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log("unauthorized")
      return res.status(401).json({ message: "Unauthorized" });
      
    }
  
    const token = authHeader;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Add user info to the request
      console.log("Decoded ," + JSON.stringify(decoded))
      next();
    } catch (err) {
        console.log("forbidden" + err)
      return res.status(403).json({ message: "Forbidden" });
    }
  };

  module.exports = authenticate;