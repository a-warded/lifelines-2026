"use client";

import { useRef, useCallback } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    rows?: number;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    maxLength = 5000,
    rows = 8,
}: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertFormatting = useCallback((before: string, after: string = before, placeholder = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const textToInsert = selectedText || placeholder;
        
        const newValue = 
            value.substring(0, start) + 
            before + textToInsert + after + 
            value.substring(end);
        
        onChange(newValue);

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + textToInsert.length;
            textarea.setSelectionRange(
                selectedText ? newCursorPos + after.length : start + before.length,
                selectedText ? newCursorPos + after.length : start + before.length + textToInsert.length
            );
        }, 0);
    }, [value, onChange]);

    const insertAtLineStart = useCallback((prefix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        
        const newValue = 
            value.substring(0, lineStart) + 
            prefix + 
            value.substring(lineStart);
        
        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        }, 0);
    }, [value, onChange]);

    const toolbarButtons = [
        { icon: Bold, action: () => insertFormatting("**", "**", "bold text"), title: "Bold (Ctrl+B)" },
        { icon: Italic, action: () => insertFormatting("*", "*", "italic text"), title: "Italic (Ctrl+I)" },
        { icon: Heading1, action: () => insertAtLineStart("# "), title: "Heading 1" },
        { icon: Heading2, action: () => insertAtLineStart("## "), title: "Heading 2" },
        { icon: List, action: () => insertAtLineStart("- "), title: "Bullet List" },
        { icon: ListOrdered, action: () => insertAtLineStart("1. "), title: "Numbered List" },
        { icon: Quote, action: () => insertAtLineStart("> "), title: "Quote" },
        { icon: Code, action: () => insertFormatting("`", "`", "code"), title: "Inline Code" },
        { icon: LinkIcon, action: () => insertFormatting("[", "](url)", "link text"), title: "Link" },
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === "b") {
                e.preventDefault();
                insertFormatting("**", "**", "bold text");
            } else if (e.key === "i") {
                e.preventDefault();
                insertFormatting("*", "*", "italic text");
            }
        }
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
                {toolbarButtons.map((btn, index) => (
                    <Button
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={btn.action}
                        title={btn.title}
                        className="h-9 w-9 p-0 hover:bg-muted"
                    >
                        <btn.icon className="w-5 h-5" />
                    </Button>
                ))}
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                className="w-full px-3 py-2 bg-background text-sm resize-none focus:outline-none"
            />

            {/* Character count */}
            <div className="px-3 py-1.5 border-t border-border bg-muted/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Supports Markdown: **bold**, *italic*, # heading
                </span>
                <span className="text-xs text-muted-foreground">
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}
