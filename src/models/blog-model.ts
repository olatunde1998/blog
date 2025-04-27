import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    slug: String,
    authorName: String,
    banner: String,
    title: String,
    subTitle: String,
    content: String,
    readTime: String,
    active: {
      type: Boolean,
      default: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
