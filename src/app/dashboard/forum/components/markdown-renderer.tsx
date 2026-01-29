"use client";

import { useMemo } from "react";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    const html = useMemo(() => parseMarkdown(content), [content]);

    return (
        <div 
            className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function parseMarkdown(text: string): string {
    if (!text) return "";

    let html = escapeHtml(text);

    // Headers (must be at start of line)
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Bold and italic combinations
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Blockquotes (must be at start of line)
    html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, "<br/>");

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    // This is simplified - would need more logic for proper ordered lists

    // Paragraphs - convert double newlines to paragraph breaks
    html = html.replace(/\n\n+/g, "</p><p>");
    
    // Single newlines to line breaks (but not inside lists/blockquotes)
    html = html.replace(/(?<!<\/li>|<\/blockquote>|<\/h[123]>)\n(?!<)/g, "<br/>");

    // Wrap in paragraph if not starting with block element
    if (!html.startsWith("<h") && !html.startsWith("<ul") && !html.startsWith("<ol") && !html.startsWith("<blockquote")) {
        html = `<p>${html}</p>`;
    }

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, "");

    return html;
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
    };
    return text.replace(/[&<>]/g, (char) => map[char] || char);
}
