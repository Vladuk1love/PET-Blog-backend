import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    // populate - подключить связь схемы поста со схемой юзера
    // exec() - выполнение запроса || не обязателен
    const posts = await PostModel.find().populate('user').exec();

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
    // populate - подключить связь схемы поста со схемой юзера
    // exec() - выполнение запроса || не обязателен
    const posts = await PostModel.find().sort({ viewsCount: -1 }).limit(5).populate('user').exec();

    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось получить массив статей'
    })
  }
}

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.findOneAndUpdate({ // Можно использовать findOne/findById
        _id: postId // Фильтр по которому вытаскиваем статью
      }, {
        $inc: {viewsCount: 1} // Инкрементирование нужной переменной (viewCount++)
      },
      {
        returnDocument: 'after' // Вернуть документ уже после инкрементирования
      }).then((doc) => { // Promise
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
      imageUrl: req.body.imageUrl,
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