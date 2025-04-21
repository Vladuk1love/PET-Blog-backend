import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

const DEFAULT_AVATAR = "https://4.downloader.disk.yandex.ru/preview/682ce12236fd8b3f493e38debc3ad458e711f3a07176f9a58841f94cda9c7249/inf/pe1IeeDCmmgjQX6HwCj5zpw0dzaGHdMJzPFAYNghK-USdFikXTcfb9wqmROT0qZB22-QBx1F7NodjY4PbxDPtQ%3D%3D?uid=1479673786&filename=Group%2048097552.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=1479673786&tknv=v2&size=1899x912";
const JWT_SECRET = 'ConslyHandCream';
const JWT_EXPIRES = '30d';

export const register = async (req, res) => {
  try {
    const { password, email, fullName } = req.body;
     // Хэширование пароля.
     // Создаем Salt - алгоритм шифрования bscrypt
    const salt = await bcrypt.genSalt(10)
    // Хэшируем пароль и заносим в переменную.
    const hash = await bcrypt.hash(password, salt)

    // Работа с MongoDb
    // Создаем модель пользователя
    const doc = new UserModel({
      email,
      fullName,
      passwordHash: hash,
      avatarUrl: "https://4.downloader.disk.yandex.ru/preview/682ce12236fd8b3f493e38debc3ad458e711f3a07176f9a58841f94cda9c7249/inf/pe1IeeDCmmgjQX6HwCj5zpw0dzaGHdMJzPFAYNghK-USdFikXTcfb9wqmROT0qZB22-QBx1F7NodjY4PbxDPtQ%3D%3D?uid=1479673786&filename=Group%2048097552.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=1479673786&tknv=v2&size=1899x912",
    })
    // Добавляем её в бд
    const user = await doc.save();
    // С помощью JWT шифруем токен, создаем время его жизни
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      // Деструктуризацией вытаскиваем хэш и не передаем его в ответе(при регистрации он нам не нужен)
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    // Вытаскиваем юзера из бд по почте
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      // В сообщении нельзя указывать, что именно неверно введено
      return res.status(404).json({ message: "Invalid credentials" });
    }
    // Проверяем пароль
    const isValid = await bcrypt.compare(password, user._doc.passwordHash);
    if (!isValid) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const update = async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      { avatarUrl: req.body.avatarUrl },
      { new: true, lean: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const getOne = async (req, res) => {
  try {
    const user = await UserModel.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user' });
  }
};