import User from "../models/User.js";
import Notification from "../models/Notification.js";

/*======================= CHECK IF NOTIFICATION ======================== */

export const getIsNotification = async (req, res, next) => {
  try {
    const userWhoGetId = req.userId;

    const result = await Notification.exists({
      notification_for: userWhoGetId,
      seen: false,
      user: { $ne: userWhoGetId },
    }); // $ne so for own comments user not get notifications

    if (result) {
      return res.status(200).json({ new_notification_available: true });
    } else {
      return res.status(200).json({ new_notification_available: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*==================== FILTER AND GET NOTIFICATION ===================== */

export const getNotifications = async (req, res, next) => {
  try {
    const { page, filter, deletedDocCount } = req.query;
    const loggedInUserId = req.userId;

    const pageIndex = page ? parseInt(page, 10) : 0;
    let maxLimit = 10;

    let query = {
      notification_for: loggedInUserId,
      user: { $ne: loggedInUserId },
    };

    if (filter !== "all") {
      query = {
        notification_for: loggedInUserId,
        user: { $ne: loggedInUserId },
        type: filter,
      };
    }

    let totalNotificationCount = await Notification.find(query).count();

    if (deletedDocCount) {
      totalNotificationCount -= deletedDocCount;
    }

    const notifications = await Notification.find(query)
      .populate("blog", "title _id author")
      .populate(
        "user",
        "personal_info.fullName personal_info.profile_img personal_info.email personal_info.username isAdmin isEditor"
      )
      .populate("comment", "comment")
      .populate("replied_on_comment", "comment")
      .populate("reply", "comment")
      .skip(page)
      .limit(maxLimit)
      .sort({ createdAt: -1 });

    await Notification.updateMany(query, { seen: true })
      .skip(page)
      .limit(maxLimit);

    const nextPage =
      totalNotificationCount > pageIndex + notifications.length
        ? pageIndex + notifications.length
        : null;

    res.status(200).json({ notifications, nextPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*==================== DELETE NOTIFICATION ===================== */

export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.query;

    if (!notificationId) {
      return res.status(404).json("This notification is not available.");
    }

    await Notification.findOneAndDelete({ _id: notificationId });

    res.status(200).json("Notification deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*==================== ADD NOTIFICATION AS MESSAGE ===================== */

export const postAddNotification = async (req, res, next) => {
  try {
    const { message, username } = req.body;
    const isEditor = req.isEditor;
    const isAdmin = req.isAdmin;
    const userId = req.userId;

    const admin = await User.findOne({ isAdmin: true });

    if (username === undefined && !isAdmin) {
      let toAdmin = new Notification({
        type: "editor",
        blog: userId,
        notification_for: admin._id,
        user: userId,
        message: message,
      });

      await toAdmin.save();
    } else {
      const user = await User.findOne({ "personal_info.username": username });

      let toEditor = new Notification({
        type: "admin",
        blog: userId,
        notification_for: user._id,
        user: admin._id,
        message: message,
      });

      await toEditor.save();
    }

    res.status(200).json("Notification send successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
