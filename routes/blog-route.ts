import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog-controller";

const router = require("express").Router();

// Create a new blog
router.post("/", createBlog);

//fetch all blogs
router.get("/", getBlogs);

//fetch a single blog
router.get("/:slug", getBlog);

//Update a blog
router.put("/:id", updateBlog);

//Delete a blog
router.delete("/:id", deleteBlog);

export default router;
