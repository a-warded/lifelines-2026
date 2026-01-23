import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAssistantMessage extends Document {
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const AssistantMessageSchema = new Schema<IAssistantMessage>(
    {
        userId: { type: String, required: true, index: true },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

// Index for fetching recent messages
AssistantMessageSchema.index({ userId: 1, createdAt: -1 });

export const AssistantMessage: Model<IAssistantMessage> =
  mongoose.models.AssistantMessage ||
  mongoose.model<IAssistantMessage>("AssistantMessage", AssistantMessageSchema);
