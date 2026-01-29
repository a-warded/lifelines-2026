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
            className={`markdown-content ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
                lineHeight: '1.6',
            }}
        />
    );
}

function parseMarkdown(text: string): string {
    if (!text) return "";

    let html = escapeHtml(text);

    // Headers (must be at start of line)
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem;">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem;">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 style="font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem;">$1</h1>');

    // Bold and italic combinations
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.05); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em;">$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #16a34a; text-decoration: underline;">$1</a>');

    // Blockquotes (must be at start of line)
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left: 3px solid #16a34a; padding-left: 1rem; margin: 0.5rem 0; font-style: italic; color: #666;">$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote[^>]*>/g, "<br/>");

    // Process lists - handle both ordered and unordered
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const unorderedMatch = line.match(/^[-•]\s+(.+)$/);
        const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
        
        if (unorderedMatch) {
            // Close ordered list if open
            if (inOrderedList) {
                processedLines.push('</ol>');
                inOrderedList = false;
            }
            // Open unordered list if not already
            if (!inUnorderedList) {
                processedLines.push('<ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">');
                inUnorderedList = true;
            }
            processedLines.push(`<li style="margin: 0.25rem 0;">${unorderedMatch[1]}</li>`);
        } else if (orderedMatch) {
            // Close unordered list if open
            if (inUnorderedList) {
                processedLines.push('</ul>');
                inUnorderedList = false;
            }
            // Open ordered list if not already
            if (!inOrderedList) {
                processedLines.push('<ol style="list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0;">');
                inOrderedList = true;
            }
            processedLines.push(`<li style="margin: 0.25rem 0;">${orderedMatch[1]}</li>`);
        } else {
            // Close any open lists
            if (inUnorderedList) {
                processedLines.push('</ul>');
                inUnorderedList = false;
            }
            if (inOrderedList) {
                processedLines.push('</ol>');
                inOrderedList = false;
            }
            processedLines.push(line);
        }
    }
    
    // Close any remaining open lists
    if (inUnorderedList) {
        processedLines.push('</ul>');
    }
    if (inOrderedList) {
        processedLines.push('</ol>');
    }
    
    html = processedLines.join('\n');

    // Paragraphs - convert double newlines to paragraph breaks
    html = html.replace(/\n\n+/g, '</p><p style="margin: 0.5rem 0;">');
    
    // Single newlines to line breaks (but not inside lists/blockquotes/headers)
    html = html.replace(/(?<!<\/li>|<\/ul>|<\/ol>|<\/blockquote>|<\/h[123]>)\n(?!<)/g, "<br/>");

    // Wrap in paragraph if not starting with block element
    if (!html.startsWith("<h") && !html.startsWith("<ul") && !html.startsWith("<ol") && !html.startsWith("<blockquote")) {
        html = `<p style="margin: 0.5rem 0;">${html}</p>`;
    }

    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*><\/p>/g, "");
    
    // Clean up br before/after block elements
    html = html.replace(/<br\/?>\s*(<\/?(?:ul|ol|li|h[123]|blockquote|p)[^>]*>)/g, "$1");
    html = html.replace(/(<\/?(?:ul|ol|li|h[123]|blockquote|p)[^>]*>)\s*<br\/?>/g, "$1");

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
