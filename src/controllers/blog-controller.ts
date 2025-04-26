import Blog from "../models/blog-model";
const asyncHandler = require("express-async-handler");

// Create a Blog
export const createBlog = asyncHandler(async (req: any, res: any) => {
  try {
    const { authorName, title, subTitle, content, readTime, slug, banner } =
      req.body;
    const newBlog = new Blog({
      slug,
      authorName,
      banner,
      title,
      subTitle,
      content,
      readTime,
    });

    await newBlog.save();
    res.status(200).json({
      success: true,
      message: "Blog Created Successfully",
      data: newBlog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// get all Blogs
export const getBlogs = asyncHandler(async (req: any, res: any) => {
  try {
    const pageNumber = parseInt(req.query.pageNumber, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (pageNumber - 1) * limit;

    const { search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { companyName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const totalBlogs = await Blog.countDocuments();
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalItems = await Blog.countDocuments();
    const endCursor = skip + blogs.length;
    const hasNextPage = endCursor < totalItems;

    const meta = {
      totalBlogs,
      totalItems,
      limit,
      pageNumber,
      totalPages: Math.ceil(totalBlogs / limit),
      hasNextPage,
      endCursor,
    };

    res.status(200).json({
      success: true,
      message: "Blogs Fetched Successfully",
      meta,
      data: blogs,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// get a single Blog
export const getBlog = asyncHandler(async (req: any, res: any) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({
      success: true,
      message: "Blog Fetched Successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//  Update a Blog
export const updateBlog = asyncHandler(async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Find blog by Id
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404);
      throw new Error(`Cannot find blog with Id ${id}`);
    }

    const data = req.body;
    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, data, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog Updated Successfully",
      data: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//  delete a Blog
export const deleteBlog = asyncHandler(async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Find the blog by ID
    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404);
      throw new Error(`cannot find any blog with ID ${id}`);
    }

    // Delete the blog from the database
    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog Deleted Successfully",
      data: [],
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
