const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.status(401).send('No token');

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

module.exports=auth;