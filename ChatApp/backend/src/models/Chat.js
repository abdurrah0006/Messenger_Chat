import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true, maxlength: 50 },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: ObjectId, ref: "User" }],
    groupAdmin: { type: ObjectId, ref: "User" },
    latestMessage: { type: ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

chatSchema.index({ users: 1, updatedAt: -1 });

export default mongoose.model("Chat", chatSchema);
