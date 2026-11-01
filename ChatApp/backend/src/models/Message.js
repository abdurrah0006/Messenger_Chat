import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
  {
    chat: { type: ObjectId, ref: "Chat", required: true },
    sender: { type: ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, maxlength: 4000, default: "" },
    // Users (other than the sender) who have read this message
    seenBy: [{ type: ObjectId, ref: "User" }],
    // Deleted for everyone; the content is wiped but the row stays
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, _id: -1 });

export default mongoose.model("Message", messageSchema);
