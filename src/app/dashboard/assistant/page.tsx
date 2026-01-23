"use client";

import { Button, Card, CardContent, OfflineBadge } from "@/components/ui";
import { PRESET_PROMPTS } from "@/lib/logic/assistant";
import { cacheAssistantChat, getCachedAssistantChat } from "@/lib/offline-storage";
import {
    ArrowLeft,
    Loader2,
    MessageCircle,
    Mic,
    MicOff,
    Send,
    Volume2,
    VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export default function AssistantPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Voice features
    const [isListening, setIsListening] = useState(false);
    const [speakEnabled, setSpeakEnabled] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Check for speech support
    useEffect(() => {
        const hasSpeechRecognition =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
        const hasSpeechSynthesis =
      typeof window !== "undefined" && "speechSynthesis" in window;
        setSpeechSupported(hasSpeechRecognition || hasSpeechSynthesis);
    }, []);

    // Load message history
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await fetch("/api/assistant?limit=50");
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages);
                    cacheAssistantChat(data.messages);
                }
            } catch {
                // Load from cache
                const cached = getCachedAssistantChat<Message>();
                if (cached) {
                    setMessages(cached);
                }
            } finally {
                setInitialLoading(false);
            }
        };

        loadMessages();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = "en-US";

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    setIsListening(false);
                };

                recognition.onerror = () => {
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speakText = (text: string) => {
        if (!speakEnabled || typeof window === "undefined") return;

        // Clean markdown from text
        const cleanText = text
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/#{1,6}\s/g, "")
            .replace(/💡|⚠️/g, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || loading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: messageText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageText }),
            });

            if (res.ok) {
                const data = await res.json();
                const assistantMessage: Message = {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: data.response,
                };

                setMessages((prev) => {
                    const updated = [...prev, assistantMessage];
                    cacheAssistantChat(updated);
                    return updated;
                });

                if (speakEnabled) {
                    speakText(data.response);
                }
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: t("assistant.error"),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Render markdown-like content (simple)
    const renderContent = (content: string) => {
    // Split by double newlines for paragraphs
        const parts = content.split("\n\n");

        return parts.map((part, index) => {
            // Check if it's a header
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <p key={index} className="font-semibold">
                        {part.replace(/\*\*/g, "")}
                    </p>
                );
            }

            // Check if it's a list
            if (part.includes("\n")) {
                const lines = part.split("\n");
                const isList = lines.every(
                    (line) =>
                        line.trim().match(/^[0-9]+\./) || line.trim().startsWith("-")
                );

                if (isList) {
                    return (
                        <ul key={index} className="space-y-1 pl-4">
                            {lines.map((line, lineIndex) => (
                                <li
                                    key={lineIndex}
                                    className="list-disc"
                                    dangerouslySetInnerHTML={{
                                        __html: line
                                            .replace(/^[0-9]+\.\s*/, "")
                                            .replace(/^-\s*/, "")
                                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                                    }}
                                />
                            ))}
                        </ul>
                    );
                }
            }

            // Regular paragraph
            return (
                <p
                    key={index}
                    dangerouslySetInnerHTML={{
                        __html: part.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                    }}
                />
            );
        });
    };

    return (
        <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("assistant.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("assistant.subtitle")}
                    </p>
                </div>
                {speechSupported && (
                    <Button
                        variant={speakEnabled ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSpeakEnabled(!speakEnabled)}
                        title={speakEnabled ? t("assistant.disableVoice") : t("assistant.enableVoice")}
                    >
                        {speakEnabled ? (
                            <Volume2 className="h-4 w-4" />
                        ) : (
                            <VolumeX className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* Preset Prompts */}
            <div className="mb-4 flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((prompt) => (
                    <Button
                        key={prompt.intent}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(prompt.text)}
                        disabled={loading}
                        className="text-xs"
                    >
                        {prompt.text}
                    </Button>
                ))}
            </div>

            {/* Messages */}
            <Card className="flex-1 overflow-hidden">
                <CardContent className="flex h-full flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4">
                        {initialLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <MessageCircle className="h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    {t("assistant.empty.title")}
                                </h3>
                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                    {t("assistant.empty.description")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                                message.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            }`}
                                        >
                                            <div className="space-y-2 text-sm">
                                                {message.role === "assistant"
                                                    ? renderContent(message.content)
                                                    : message.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl bg-muted px-4 py-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t p-4">
                        <div className="flex items-end gap-2">
                            {/* Microphone Button */}
                            {recognitionRef.current && (
                                <Button
                                    variant={isListening ? "primary" : "outline"}
                                    size="sm"
                                    onClick={toggleListening}
                                    className="shrink-0"
                                    title={isListening ? "Stop listening" : "Start voice input"}
                                >
                                    {isListening ? (
                                        <Mic className="h-5 w-5 animate-pulse" />
                                    ) : (
                                        <MicOff className="h-5 w-5" />
                                    )}
                                </Button>
                            )}

                            {/* Text Input */}
                            <div className="relative flex-1">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={t("assistant.placeholder")}
                                    className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    rows={1}
                                    style={{
                                        minHeight: "48px",
                                        maxHeight: "120px",
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <Button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="shrink-0"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>

                        {isListening && (
                            <p className="mt-2 text-center text-sm text-muted-foreground animate-pulse">
                                {t("assistant.listening")}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <OfflineBadge />
        </div>
    );
}

// Add TypeScript declarations for Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
