import {body} from 'express-validator'

export const loginValidator = [
  body('email', 'Неверная почта').isEmail(),
  body('password', 'Пароль должен содержать не менее 5 символов').isLength({min: 5}),
]

export const registerValidator = [
  body('email', 'Неверная почта').isEmail(),
  body('password', 'Пароль должен содержать не менее 5 символов').isLength({min: 5}),
  body('fullName', 'Слишком короткое имя. Минимум 3 символа').isLength({min: 3}),
  body('avatarUrl', 'Неверная ссылка аватара').optional().isURL(),
]

export const postCreateValidator = [
  body('title', 'Введите заголовок статьи').isLength({min: 3}).isString(),
  body('text', 'Введите текст статьи').isLength({min: 7}).isString(),
  body('tags', 'Неверный формат тегов(укажите массив)').optional().isArray(),
  body('imageUrl', 'Неверная ссылка аватара').optional().isString(),
]