import { auth } from "@/lib/auth";
import { getAssistantResponse } from "@/lib/logic/assistant";
import { AssistantMessage } from "@/lib/models";
import { connectMongo } from "@/lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// POST - Send message and get response
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        await connectMongo();

        // Get recent conversation history
        const recentMessages = await AssistantMessage.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const conversationHistory = recentMessages
            .reverse()
            .map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            }));

        // Get assistant response
        const response = await getAssistantResponse({
            message: message.trim(),
            conversationHistory,
        });

        // Save both messages
        await AssistantMessage.create([
            {
                userId: session.user.id,
                role: "user",
                content: message.trim(),
            },
            {
                userId: session.user.id,
                role: "assistant",
                content: response.content,
            },
        ]);

        return NextResponse.json({
            success: true,
            response: response.content,
            intent: response.intent,
        });
    } catch (error) {
        console.error("Assistant error:", error);
        return NextResponse.json(
            { error: "Failed to get response" },
            { status: 500 }
        );
    }
}

// GET - Fetch message history
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");

        await connectMongo();

        const messages = await AssistantMessage.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            messages: messages.reverse().map((m) => ({
                id: m._id.toString(),
                role: m.role,
                content: m.content,
                createdAt: m.createdAt,
            })),
        });
    } catch (error) {
        console.error("Messages fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}
