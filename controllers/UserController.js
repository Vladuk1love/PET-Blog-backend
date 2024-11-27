import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";
import { response } from "express";

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
      avatarUrl: "https://4.downloader.disk.yandex.ru/preview/682ce12236fd8b3f493e38debc3ad458e711f3a07176f9a58841f94cda9c7249/inf/pe1IeeDCmmgjQX6HwCj5zpw0dzaGHdMJzPFAYNghK-USdFikXTcfb9wqmROT0qZB22-QBx1F7NodjY4PbxDPtQ%3D%3D?uid=1479673786&filename=Group%2048097552.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=1479673786&tknv=v2&size=1899x912",
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
      return res.status(404).json({
        // В сообщении нельзя указывать, что именно неверно введено
        message: "Неверный логин или пароль"
      })
    }
    // Проверяем пароль
    const isValid = await bcrypt.compare(req.body.password, user._doc.passwordHash)
    if (!isValid) {
      return res.status(404).json({
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

    return res.json({
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
    const user = await UserModel.findById(req.userId)

    if(!user){
      return res.status(404).json({
        message: 'Пользователь не найден'
      })
    }
    const {passwordHash, ...userData} = user._doc
    res.json(userData)

  } catch (err) {
    console.log(err)
  }
}



export const update = async (req, res) => {
  try {
    const userId = req.userId;
    
    let response = await UserModel.findByIdAndUpdate(
      {
        _id: userId
      },
      {
        avatarUrl: req.body.avatarUrl
      },
      {new: true, lean: true}
    )
    res.json(response)
  
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось обновить профиль'
    })
  }
}


export const getOne = async (req, res) => {
  let userId = req.query.id
  try {
    const user = await UserModel.findById(userId)

    if(!user){
      return res.status(404).json({
        message: 'Пользователь не найден'
      })
    }
    const {passwordHash, ...userData} = user._doc
    res.json(userData)

  } catch (err) {
    console.log(err)
  }
}