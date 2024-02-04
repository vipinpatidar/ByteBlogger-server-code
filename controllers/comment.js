import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";

/*=================== GET COMMENT ====================== */

const populateReplies = async (commentId) => {
  const populateChildren = async (comment) => {
    await comment.populate({
      path: "children",
      populate: {
        path: "commented_by",
        select:
          "personal_info.username personal_info.fullName personal_info.profile_img",
      },
    });

    for (const child of comment.children) {
      await populateChildren(child);
    }
  };

  const comment = await Comment.findById(commentId)
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullName personal_info.profile_img"
    )
    .exec();

  if (comment) {
    await populateChildren(comment);
  }

  return comment;
};

export const getBlogComments = async (req, res, next) => {
  try {
    let { blogId, skip: page } = req.query;
    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxLimit = 4;

    // console.log(page);

    let totalCommentDoc = await Comment.find({
      blog_id: blogId,
      isReply: false,
    }).count();

    let comments = await Comment.find({ blog_id: blogId, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullName personal_info.profile_img"
      )
      .populate({
        path: "children",
        populate: {
          path: "commented_by",
          select:
            "personal_info.username personal_info.fullName personal_info.profile_img",
        },
      })
      .skip(page)
      .limit(maxLimit)
      .sort({
        commentedAt: -1,
      });

    // Determine the next cursor
    const nextPage =
      totalCommentDoc > pageIndex + comments.length
        ? pageIndex + comments.length
        : null;

    // console.log(totalCommentDoc);

    const commentsWithReplies = await Promise.all(
      comments.map((comment) => populateReplies(comment._id))
    );

    res.status(200).json({ comments: commentsWithReplies, nextPage: nextPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*=================== POST ADD COMMENT ====================== */

export const postAddComment = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { comment, blogId, blog_author, replying_to, notificationId } =
      req.body;

    if (!comment.length) {
      return res.status(422).json({ error: "Please write a comment." });
    }

    let commentObj = {
      blog_id: blogId,
      blog_author,
      comment,
      commented_by: userId,
      isReply: replying_to ? true : false,
    };

    // here replying to is _id of comment under which we are replying

    if (replying_to) {
      commentObj.parent = replying_to;
    }

    const commentDoc = await Comment.create(commentObj);

    let { comment: dbComment, commentedAt, children } = commentDoc;

    // Updating the blog according to comment or reply

    let blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      {
        $push: { comments: commentDoc._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    );

    // updating the notification according to comment or reply

    // console.log(replying_to);

    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: blogId,
      notification_for: blog_author,
      user: userId,
      comment: commentDoc._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;

      // pushing reply comment id to comment where user is replying

      const parentCommentOfReply = await Comment.findOneAndUpdate(
        { _id: replying_to },
        {
          $push: { children: commentDoc._id },
        }
      );

      if (notificationId) {
        await Notification.findOneAndUpdate(
          { _id: notificationId },
          { reply: commentDoc._id }
        );
      }

      notificationObj.notification_for = parentCommentOfReply.commented_by;
    }

    // console.log(notificationObj);

    let notification = new Notification(notificationObj);

    await notification.save();

    res.status(200).json({
      dbComment,
      commentedAt,
      userId: userId,
      commentId: commentDoc._id,
      children,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*=================== DELETE COMMENT ====================== */

const deleteCommentAndThereReplies = async (commentId) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: commentId });

    if (comment.parent) {
      await Comment.findOneAndUpdate(
        { _id: comment.parent },
        {
          $pull: { children: commentId },
        }
      );
    }

    // console.log(commentId);

    await Notification.findOneAndDelete({ comment: commentId });
    await Notification.findOneAndUpdate(
      { reply: commentId },
      { $unset: { reply: 1 } }
    );

    const blog = await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: commentId },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        },
      }
    );

    if (comment.children.length) {
      comment.children.map((reply) => deleteCommentAndThereReplies(reply));
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteBlogComment = async (req, res, next) => {
  try {
    let userId = req.userId;

    const { commentId } = req.query;

    const comment = await Comment.findOne({ _id: commentId });

    // console.log(comment);
    // console.log(userId);

    if (
      userId === comment.commented_by.toString() ||
      userId === comment.blog_author.toString()
    ) {
      await deleteCommentAndThereReplies(commentId);

      res.status(200).json({ status: "deleted" });
    } else {
      res.status(403).json({ error: "You cannot delete this comment." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
