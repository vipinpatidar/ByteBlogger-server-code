import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import { validationResult } from "express-validator";
import { __dirname } from "../server.js";

/*======================= GET BLOGS WITH CATEGORY ======================== */

export const getBlogs = async (req, res, next) => {
  try {
    let { category, page, authorId, tags, removeBlogId } = req.query;
    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxBlogLimit = 4;

    // console.log(authorId);

    let query = {
      draft: false,
      $or: [{ tags: category }, { title: new RegExp(category, "i") }],
    };

    if (category === "home") {
      query = { draft: false };
    } else if (authorId !== undefined) {
      query = { draft: false, author: authorId };
    } else if (tags !== undefined && removeBlogId !== undefined) {
      query = {
        draft: false,
        tags: { $in: tags.split(",") },
        _id: { $ne: removeBlogId },
      };
    }

    // console.log(query);

    let totalBlogCount = await Blog.find(query).count();

    const blogs = await Blog.find(query)
      .populate(
        "author",
        "personal_info.fullName personal_info.profile_img personal_info.email personal_info.username personal_info.email"
      )
      .sort({ publishedAt: -1 })
      .select("_id title des activity banner tags publishedAt")
      .skip(page)
      .limit(maxBlogLimit);

    // console.log(totalBlogCount)
    const nextPage =
      totalBlogCount > pageIndex + blogs.length
        ? pageIndex + blogs.length
        : null;

    res.status(200).json({ blogs, nextPage: nextPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*=================== GET ALL DASHBOARD BLOG  ==================== */

export const getAllDashboardBlogs = async (req, res, next) => {
  try {
    const { page, draft, query, isAdmin } = req.query;
    const loggedInUserId = req.userId;

    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxBlogLimit = 4;
    let findQuery;

    if (isAdmin === "true") {
      findQuery = {
        $or: [{ tags: query }, { title: new RegExp(query, "i") }],
        draft,
        author: { $ne: loggedInUserId },
      };
    } else {
      findQuery = {
        author: loggedInUserId,
        $or: [{ tags: query }, { title: new RegExp(query, "i") }],
        draft,
      };
    }

    let totalBlogCount = await Blog.find(findQuery).count();

    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.fullName personal_info.profile_img personal_info.email personal_info.username personal_info.email"
      )
      .sort({ publishedAt: -1 })
      .select("_id title des activity banner tags draft publishedAt")
      .skip(page)
      .limit(maxBlogLimit);

    // console.log(totalBlogCount)
    const nextPage =
      totalBlogCount > pageIndex + blogs.length
        ? pageIndex + blogs.length
        : null;

    res.status(200).json({ blogs, nextPage: nextPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= GET TRENDING BLOGS ======================== */

export const getTrendingBlogs = async (req, res, next) => {
  console.log(req.headers.origin)
  try {
    let maxBlog = 10;

    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.fullName personal_info.username  personal_info.profile_img"
      )
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("_id title banner publishedAt")
      .limit(maxBlog);

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= GET SINGLE BLOG ======================== */

export const getSingleBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    const { mode, draft } = req.query;

    // console.log(draft, mode);

    const id = blogId.split("-4v8i0p")[1];

    const incrementReadValue = mode === "edit" ? 0 : 1;

    // console.log(id);

    const blog = await Blog.findOneAndUpdate(
      { _id: id },
      {
        $inc: { "activity.total_reads": incrementReadValue },
      },
      {
        new: true,
      }
    )
      .populate(
        "author",
        "personal_info.fullName personal_info.username personal_info.profile_img account_info"
      )
      .select("title banner des tags content author publishedAt activity");

    const author = await User.findOneAndUpdate(
      { _id: blog.author._id },
      {
        $inc: { "account_info.total_reads": incrementReadValue },
      },
      {
        new: true,
      }
    );

    if (blog.draft && !draft) {
      res.status(500).json({ error: "You cannot access draft blogs" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= POST AN UPDATE BLOG ======================== */

export const postCreateBlog = async (req, res, next) => {
  try {
    let authorId = req.userId;
    let isEditor = req.isEditor;
    let isAdmin = req.isAdmin;
    let { title, banner, tags, des, content, draft, blogId } = req.body;

    if (!isEditor) {
      return res.status(401).json({
        error: "Only editors are allowed to created and updated blog",
      });
    }

    if (!draft) {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        return res.status(422).json({ error: error.array()[0].msg });
      }
    }

    if (draft) {
      if (!title.length) {
        return res.status(422).json({
          error: "You must provide a title before saving this blog as draft",
        });
      }

      if (!banner?.length) {
        return res.status(422).json({
          error:
            "You must provide a banner image before saving this blog as draft",
        });
      }
    }

    const admin = await User.findOne({ isAdmin: true });

    if (blogId) {
      //! UPDATE if there is an blog id
      const id = blogId?.split("-4v8i0p")[1];

      const oldBlog = await Blog.findById({ _id: id });

      if (oldBlog.author.toString() === authorId || isAdmin === true) {
        const updatedBlog = await Blog.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              title,
              banner,
              tags,
              des,
              content,
              author: oldBlog.author,
              draft: Boolean(draft),
            },
          }
        );

        if (isAdmin) {
          let toEditor = new Notification({
            type: "admin",
            blog: id,
            notification_for: updatedBlog.author,
            user: admin._id,
            message: !draft
              ? `Your blog "${updatedBlog.title}" is edited by admin`
              : `Your draft "${updatedBlog.title}" is edited by admin`,
          });

          await toEditor.save();
        }

        if (!isAdmin && isEditor) {
          let toAdmin = new Notification({
            type: "editor",
            blog: id,
            notification_for: admin._id,
            user: updatedBlog.author,
            message: !draft
              ? `Blog "${updatedBlog.title}" is edited by its author`
              : `Draft "${updatedBlog.title}" is edited by its author`,
          });

          await toAdmin.save();
        }

        res.status(200).json(updatedBlog);
      } else {
        return res.status(401).json({
          error: "Only admin and author can edit this blog.",
        });
      }
    } else {
      //! Create a new blog if there is no blog id

      const blog = await Blog.create({
        title,
        banner,
        tags,
        des,
        content,
        author: authorId,
        draft: Boolean(draft),
      });

      let incrementPostValue = draft ? 0 : 1;

      const author = await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: {
            "account_info.total_posts": incrementPostValue,
          },
          $push: {
            blogs: blog._id,
          },
        }
      );

      if (!isAdmin && isEditor) {
        let toAdmin = new Notification({
          type: "editor",
          blog: blog._id,
          notification_for: admin._id,
          user: blog.author,
          message: !draft
            ? `A Blog "${blog.title}" is created`
            : `A draft "${blog.title}" is created`,
        });

        await toAdmin.save();
      }

      res.status(200).json({ blogId: blog._id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= LIKE AND DISLIKE ======================== */

export const putLikeAndDislike = async (req, res) => {
  try {
    let userId = req.userId;

    let { blogId, isLikedByUser } = req.body;

    let incrementLikeValue = !isLikedByUser ? 1 : -1;

    let blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      {
        $inc: {
          "activity.total_likes": incrementLikeValue,
        },
      },
      {
        new: true,
      }
    );

    let user = await User.findById({ _id: userId });

    if (!isLikedByUser) {
      let like = new Notification({
        type: "like",
        blog: blogId,
        notification_for: blog.author,
        user: userId,
      });

      await like.save();

      await User.updateOne(
        { _id: userId },
        { $addToSet: { likedBlogs: blogId } } // $addToSet prevents duplicates
      );
      return res.status(200).json("liked blog");
    } else if (isLikedByUser) {
      await Notification.findOneAndDelete({
        user: userId,
        blog: blogId,
        type: "like",
      });

      await User.updateOne({ _id: userId }, { $pull: { likedBlogs: blogId } });

      return res.status(200).json("disliked blog");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*=================== DELETE BLOG  ==================== */

export const deleteBlog = async (req, res, next) => {
  try {
    const { blogId } = req.query;
    // const loggedInUserId = req.userId;
    let isEditor = req.isEditor;
    let isAdmin = req.isAdmin;

    const draftBlog = await Blog.findById({ _id: blogId });
    const admin = await User.findOne({ isAdmin: true });

    if (!isAdmin && draftBlog.draft !== true) {
      return res.status(401).json({
        error: "Only admin can delete a blog.",
      });
    }

    if (!isEditor) {
      return res.status(401).json({
        error: "Only admin or editor can delete a draft blog.",
      });
    }

    //  const id = blogId?.split("-4v8i0p")[1];

    const blog = await Blog.findOneAndDelete({ _id: blogId });
    // console.log(blog);
    // Cast to [ObjectId] failed for value "[ { '$pull': [ '670166cf471527dc708b36d2' ] } ]" (type string) at path "likedBlogs.0" because of "CastError"

    await Notification.deleteMany({ blog: blogId });
    await Comment.deleteMany({ blog_id: blogId });
    await User.updateMany(
      { likedBlogs: blogId }, // Find all users who liked this blog
      { $pull: { likedBlogs: blogId } } // Remove the blogId from their likedBlogs array
    );

    if (isAdmin) {
      let toEditor = new Notification({
        type: "admin",
        blog: blogId,
        notification_for: blog.author,
        user: admin._id,
        message: `Your blog "${blog.title}" is deleted by admin`,
      });

      await toEditor.save();
    }

    if (!isAdmin && isEditor) {
      let toAdmin = new Notification({
        type: "editor",
        blog: blogId,
        notification_for: admin._id,
        user: blog.author,
        message: `Blog draft "${blog.title}" is deleted by its author`,
      });

      await toAdmin.save();
    }

    let incrementPostValue = blog.draft ? 0 : -1;

    await User.findOneAndUpdate(
      { _id: blog.author },
      {
        $pull: { blog: blogId },
        $inc: { "account_info.total_posts": incrementPostValue },
      }
    );

    res.status(200).json("Blog deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
