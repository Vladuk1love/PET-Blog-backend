import jwt from "jsonwebtoken";


// Функция - посредник(middleware function).
// Если был отправлен токен, расшифровывает его и возвращает в req.
export default (req, res, next) => {
  const token = (req.headers.authorization ?
    req.headers.authorization : 'No token').replace(/Bearer\s?/, '');

  if (token !== 'No token'){
    try{
      const decodedToken = jwt.verify(token,'ConslyHandCream')
      req.userId = decodedToken._id;
      next()
    }catch (err){
        return res.status(403).json({
        message: 'Нет доступа'
      })}

  }else{
    return res.status(403).json({
      message: 'Нет доступа'
    })
  }
}