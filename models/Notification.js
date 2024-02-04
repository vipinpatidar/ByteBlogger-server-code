import mongoose, { Schema } from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reply", "editor", "admin"],
      required: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Blog",
    },
    notification_for: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    user: {
      // user who send the notification
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    replied_on_comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
