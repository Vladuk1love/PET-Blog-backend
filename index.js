import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import { loginValidator, postCreateValidator, registerValidator } from './validations.js';
import checkAuth from './utils/checkAuth.js';
import handleValidationErrors from './utils/handleValidationErrors.js';
import * as PostController from './controllers/PostController.js';
import * as UserController from './controllers/UserController.js';
import { MONGOURL } from "./config.js";

// Создаем приложение Express
const app = express();
const PORT = 4444;

app.use(express.json());
// Объясняем, что если пришел запрос /upload, express должен проверить папку uploads,
// а не искать роут get /upload
app.use('/uploads', express.static('uploads'));
app.use(cors());

// Работа с картинками
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads'),
  filename: (_, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });
// Подключение к БД MongoDB
mongoose.connect(MONGOURL)
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database error:', err));

// Auth routes
app.post('/auth/register', registerValidator, handleValidationErrors, UserController.register);
app.post('/auth/login', loginValidator, handleValidationErrors, UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);

// User routes
app.get('/user', checkAuth, UserController.getOne);
app.patch('/user/update', checkAuth, UserController.update);

// Upload route
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.originalname}` });
});

// Post routes
app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getMostPopular);
app.get('/posts/certain', PostController.getOne);
app.get('/posts/count', checkAuth, PostController.getCount);
app.get('/posts/author/:authorId', checkAuth, PostController.getByAuthor);
app.post('/posts/certain', checkAuth, postCreateValidator, handleValidationErrors, PostController.create);
app.delete('/posts/certain/:id', checkAuth, PostController.removeOne);
app.patch('/posts/certain/:id', checkAuth, postCreateValidator, handleValidationErrors, PostController.update);

// Запускаем веб сервер на порте 4444, возвращаем ошибку|сообщение об успешном старте
app.listen(PORT, (error) => {
  if (error) {
    return console.log(error)
  } else {
    return console.log("Server is successfully started")
  }
})