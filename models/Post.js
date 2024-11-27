import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      unique: false
    },
    text: {
      type: String,
      required: true,
      unique: false
    },
    tags: {
      type: Array,
      default: []
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    imageUrl: String,

  },
  {
    timestamps: true,
  }
)

export default mongoose.model('post', PostSchema)