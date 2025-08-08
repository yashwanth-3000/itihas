"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Components } from 'react-markdown';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "", 
  isUserMessage = false 
}) => {
  // Check if this looks like a search result response
  const isSearchResponse = content.includes('## ') && (
    content.includes('search') || 
    content.includes('latest') || 
    content.includes('current') ||
    content.includes('Sources:') ||
    content.includes('### ')
  );

  const components: Components = {
    // Headings - all bold, no colors
    h1: ({ children }) => (
      <h1 className="text-lg font-extrabold mb-3 border-b pb-1">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-bold mb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-bold mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xs font-bold mb-1">
        {children}
      </h4>
    ),
    
    // Paragraphs
    p: ({ children }) => (
      <p className="text-xs leading-relaxed mb-2 last:mb-0">
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-xs space-y-1 mb-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-xs space-y-1 mb-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-xs leading-relaxed">
        {children}
      </li>
    ),
    
    // Emphasis - bold and italic, no colors
    strong: ({ children }) => (
      <strong className="font-extrabold">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic font-medium">
        {children}
      </em>
    ),
    
    // Code - simple styling, no colors
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code 
            className="font-mono text-xs font-semibold px-1 py-0.5 rounded border"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="rounded-lg p-3 mb-2 overflow-x-auto text-xs border font-mono">
        {children}
      </pre>
    ),
    
    // Blockquotes - simple border, no colors
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-solid pl-4 py-2 my-2 font-medium italic">
        <div className="text-xs">
          {children}
        </div>
      </blockquote>
    ),
    
    // Links - underlined, no colors
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline font-medium text-xs"
      >
        {children}
      </a>
    ),
    
    // Tables - simple borders, no colors
    table: ({ children }) => (
      <div className="overflow-x-auto mb-2">
        <table className="min-w-full text-xs border rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead>
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-bold border-b">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 border-b">
        {children}
      </td>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="my-3 border-solid" />
    ),
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;