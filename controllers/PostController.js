import mongoose from "mongoose";
import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const perPage = 10;
    const page = req.query.page;
    // populate - подключить связь схемы поста со схемой юзера
    // exec() - выполнение запроса || не обязателен
    const posts = await PostModel.find()
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate('user')
      .exec();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get posts' });
  }
};

export const getMostPopular = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ viewsCount: -1 })
      .limit(5)
      .populate('user')
      .exec();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get popular posts' });
  }
};

export const getCount = async (req, res) => {
  try {
    const { authorId } = req.query;
    const count = authorId 
      ? (await PostModel.find({ user: authorId })).length
      : await PostModel.estimatedDocumentCount();
    res.json(count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get posts count' });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.query.id;
    const updatedPost = await PostModel.findOneAndUpdate( // Можно использовать findOne/findById
      { _id: postId },  // Фильтр по которому вытаскиваем статью
      { $inc: { viewsCount: 1 } }, // Инкрементирование нужной переменной (viewCount++)
      { returnDocument: 'after' }    ).populate('user');  // Вернуть документ уже после инкрементирования
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get post' });
  }
};

export const getByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const perPage = 5;
    const page = req.query.page;
    const posts = await PostModel.find({ user: authorId })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate('user');

    if (!posts.length) {
      return res.status(404).json({ message: 'No posts found' });
    }
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get author posts' });
  }
};

export const create = async (req, res) => {
  try {
    const post = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl || 'https://ltdfoto.ru/images/2024/08/30/Group-48097554.png',
      user: req.userId,
    });
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const removeOne = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await PostModel.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    await PostModel.updateOne(
      { _id: id },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        imageUrl: req.body.title,
        user: req.userId,
      }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update post' });
  }
};