const jwt = require("jsonwebtoken");

function auth(requiredRole) {
  return function (req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Login zaroori hai (token missing)" });
    }
    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: `Sirf ${requiredRole} isko access kar sakta hai` });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Token invalid ya expire ho gaya, dobara login karo" });
    }
  };
}

module.exports = auth;
