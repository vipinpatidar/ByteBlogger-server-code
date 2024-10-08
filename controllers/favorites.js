import { populate } from "dotenv";
import User from "../models/User.js";

/*======================= GET BLOGS WITH CATEGORY ======================== */
export const getReadLaterBlogs = async (req, res, next) => {
  try {
    let userId = req.userId;

    let { page, search } = req.query;
    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxBlogLimit = 4;

    // Create the search query for the blog title
    let blogTitleQuery = {};
    if (search) {
      blogTitleQuery = { title: { $regex: search, $options: "i" } }; // Case-insensitive search
    }

    // Fetch the user and paginate the readLaterBlogs
    const user = await User.findOne({ _id: userId })
      .populate({
        path: "readLaterBlogs",
        match: blogTitleQuery,
        populate: {
          path: "author",
          select:
            "personal_info.fullName personal_info.username personal_info.profile_img account_info",
        },
        options: {
          sort: { publishedAt: -1 }, // Sort by published date
          skip: page, // Skip based on page index
          limit: maxBlogLimit, // Limit to the max blog limit per page
        },
      })
      .select("readLaterBlogs");

    // Get the total count of blogs matching the search query in readLaterBlogs
    const totalBlogCount = await User.aggregate([
      { $match: { _id: user._id } }, // Match the current user
      { $unwind: "$readLaterBlogs" }, // Flatten the readLaterBlogs array
      {
        $lookup: {
          from: "blogs", // Join with the Blog collection
          localField: "readLaterBlogs",
          foreignField: "_id",
          as: "blogDetails",
        },
      },
      { $unwind: "$blogDetails" }, // Flatten the joined blogDetails array
      { $match: { "blogDetails.title": blogTitleQuery.title || /.*/ } }, // Match based on search
      { $count: "totalCount" }, // Count the filtered results
    ]);

    const totalBlogs =
      totalBlogCount.length > 0 ? totalBlogCount[0].totalCount : 0;

    const nextPage =
      totalBlogs > pageIndex + user.readLaterBlogs?.length
        ? pageIndex + user.readLaterBlogs?.length
        : null;

    res.status(200).json({
      readLaterBlogs: user.readLaterBlogs,
      nextPage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= PUT UPDATE READ LATER ======================== */

export const putReadLaterBlogs = async (req, res, next) => {
  try {
    let userId = req.userId;

    let { blogId, isReadLaterByUser } = req.body;

    if (!isReadLaterByUser) {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { readLaterBlogs: blogId } } // $addToSet prevents duplicates
      );
      return res.status(200).json("added to read later blog");
    } else if (isReadLaterByUser) {
      await User.updateOne(
        { _id: userId },
        { $pull: { readLaterBlogs: blogId } }
      );

      return res.status(200).json("removed from read later blog");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*======================= GET LIKED BLOG ======================== */

export const getLikedBlogs = async (req, res, next) => {
  try {
    let userId = req.userId;

    let { page, search } = req.query;
    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxBlogLimit = 4;

    // Create the search query for the blog title
    let blogTitleQuery = {};
    if (search) {
      blogTitleQuery = { title: { $regex: search, $options: "i" } }; // Case-insensitive search
    }

    // Fetch the user and paginate the likedBlogs
    const user = await User.findOne({ _id: userId })
      .populate({
        path: "likedBlogs",
        match: blogTitleQuery,
        populate: {
          path: "author",
          select:
            "personal_info.fullName personal_info.username personal_info.profile_img account_info",
        },
        options: {
          sort: { publishedAt: -1 }, // Sort by published date
          skip: page, // Skip based on page index
          limit: maxBlogLimit, // Limit to the max blog limit per page
        },
      })
      .select("likedBlogs");

    // Get the total count of blogs matching the search query in likedBlogs
    const totalBlogCount = await User.aggregate([
      { $match: { _id: user._id } }, // Match the current user
      { $unwind: "$likedBlogs" }, // Flatten the likedBlogs array
      {
        $lookup: {
          from: "blogs", // Join with the Blog collection
          localField: "likedBlogs",
          foreignField: "_id",
          as: "blogDetails",
        },
      },
      { $unwind: "$blogDetails" }, // Flatten the joined blogDetails array
      { $match: { "blogDetails.title": blogTitleQuery.title || /.*/ } }, // Match based on search
      { $count: "totalCount" }, // Count the filtered results
    ]);

    const totalBlogs =
      totalBlogCount.length > 0 ? totalBlogCount[0].totalCount : 0;

    const nextPage =
      totalBlogs > pageIndex + user.likedBlogs?.length
        ? pageIndex + user.likedBlogs?.length
        : null;

    res.status(200).json({
      likedBlogs: user.likedBlogs,
      nextPage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
