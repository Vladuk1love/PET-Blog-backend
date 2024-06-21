import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const password = req.body.password
    // Хэширование пароля.
    // Создаем Salt - алгоритм шифрования bscrypt
    const salt = await bcrypt.genSalt(10)
    // Хэшируем пароль и заносим в переменную.
    const hash = await bcrypt.hash(password, salt)

    // Работа с MongoDb
    // Создаем модель пользователя
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    })
    // Добавляем её в бд
    const user = await doc.save();
    // С помощью JWT шифруем токен, создаем время его жизни
    const token = jwt.sign({
        _id: user._id
      }, 'ConslyHandCream',
      {
        expiresIn: '30d'
      })

    // Деструктуризацией вытаскиваем хэш и не передаем его в ответе(при регистрации он нам не нужен)
    const {passwordHash, ...userData} = user._doc
    res.json({
      ...userData,
      token
    })
  }

    // Обработка ошибок регистрации
  catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Пользователь не зарегистрирован'
    })
  }
}

export const login = async (req, res) => {
  try {
    // Вытаскиваем юзера из бд по почте
    const user = await UserModel.findOne({email: req.body.email})

    if (!user) {
      return req.status(404).json({
        // В сообщении нельзя указывать, что именно неверно введено
        message: "Неверный логин или пароль"
      })
    }
    // Проверяем пароль
    const isValid = await bcrypt.compare(req.body.password, user._doc.passwordHash)
    if (!isValid) {
      return req.status(404).json({
        message: "Неверный логин или пароль"
      })
    }
    const token = jwt.sign({
        _id: user._id
      },
      'ConslyHandCream',
      {
        expiresIn: '30d'
      }
    )
    const {passwordHash, ...userData} = user._doc

    res.json({
      ...userData,
      token
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Не удалось авторизоваться'
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)

    if(!user){
      return res.status(404).json({
        message: 'Пользователь не найден'
      })
    }
    const {passwordHash, ...userData} = user._doc
    res.json(userData)

  }catch (err){
    console.log(err)
  }
}