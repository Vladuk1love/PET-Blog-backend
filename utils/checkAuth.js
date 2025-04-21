import jwt from "jsonwebtoken";

const JWT_SECRET = 'ConslyHandCream';

// Функция - посредник(middleware function).
// Если был отправлен токен, расшифровывает его и возвращает в req.
export default (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const token = authHeader.replace(/Bearer\s?/, '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded._id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Access denied' });
  }
};