import mongoose from "mongoose";
import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  let perPage = 10;
  let page = req.query.page
  try {
    // populate - подключить связь схемы поста со схемой юзера
    // exec() - выполнение запроса || не обязателен
    const posts = await PostModel.find().skip(perPage * (page - 1)).limit(perPage).populate('user').exec();
    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось получить массив статей'
    })
  }
}

export const getMostPopular = async (req, res) => {
  try {

    const posts = await PostModel.find().sort({ viewsCount: -1 }).limit(5).populate('user').exec();

    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось получить массив статей'
    })
  }
}

export const getCount = async (req, res) => {
  let authorId = req.query.authorId
  try {
    if(authorId){
      const posts = await PostModel.find({user: authorId}).populate('user').exec()
      res.json(posts.length)
    }else{
      const postsCount = await PostModel.estimatedDocumentCount().exec()
      res.json(postsCount)
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось получить количество статей'
    })
  }
}

export const getOne = async (req, res) => {
  try {
    const postId = req.query.id;

    await PostModel.findOneAndUpdate({ // Можно использовать findOne/findById
        _id: postId // Фильтр по которому вытаскиваем статью
      }, {
        $inc: {viewsCount: 1} // Инкрементирование нужной переменной (viewCount++)
      },
      {
        returnDocument: 'after' // Вернуть документ уже после инкрементирования
      }).populate('user').then((doc) => { // Promise
      if (!doc) {
        return res.status(404).json({
          message: 'Статья не найдена'
        })
      }
      res.json(doc)
    }).catch((err) => {
      console.log(err)
      return res.status(500).json({
        message: 'Не удалось вернуть статью'
      })
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось вернуть статью'
    })
  }
}

export const getByAuthor = async (req, res) => {
  try {
    const authorId = req.params.authorId;
    let perPage = 5;
    let page = req.query.page

    await PostModel.find({user: authorId}).skip(perPage * (page - 1)).limit(perPage).populate('user').then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: 'Статья не найдена'
        })
      }
      res.json(doc)
    }).catch((err) => {
      console.log(err)
      return res.status(500).json({
        message: 'Не удалось вернуть статью'
      })
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось вернуть статью'
    })
  }
}

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl ? req.body.imageUrl : 'https://ltdfoto.ru/images/2024/08/30/Group-48097554.png',
      user: req.userId,
    })

    const post = await doc.save()
    res.json(post)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось создать статью'
    })
  }
}

export const removeOne = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.findByIdAndDelete({
      _id: postId
    }).then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: 'Статья не найдена'
        })
      }
      res.json({
        success: true
      })
    }).catch((err) => {
      console.log(err)
      return res.status(500).json({
        message: 'Не удалось удалить статью'
      })
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось вернуть статью'
    })
  }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId
      },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        imageUrl: req.body.title,
        user: req.userId,
      }
    )

    res.json({
      success: true
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось обновить статью'
    })
  }
}