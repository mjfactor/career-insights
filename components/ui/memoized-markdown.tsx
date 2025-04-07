import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw);
}

export const ReadableMemoizedMarkdown = memo(
    ({ content, id }: { content: string; id: string }) => {
        const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

        return (
            <div className="font-sans text-base leading-relaxed prose prose-stone dark:prose-invert prose-headings:mb-4 prose-headings:mt-6 prose-p:my-4 prose-li:my-2 max-w-none">
                {blocks.map((block, index) => (
                    <ReactMarkdown
                        key={`${id}-block_${index}`}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="my-4">{children}</p>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold my-6">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold my-5">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold my-4">{children}</h3>,
                            ul: ({ children }) => <ul className="my-4 ml-6 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-4 ml-6 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-2">{children}</li>,
                            // Add link styling with blue color
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
                                    target={href?.startsWith('http') ? '_blank' : undefined}
                                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                >
                                    {children}
                                </a>
                            ),
                            // Modern table styling
                            table: ({ children }) => (
                                <div className="my-6 w-full overflow-x-auto rounded-lg border border-muted shadow-sm">
                                    <table className="w-full min-w-full border-collapse bg-background text-sm table-auto">{children}</table>
                                </div>
                            ),
                            thead: ({ children }) => <thead className="bg-muted/80 text-muted-foreground">{children}</thead>,
                            tbody: ({ children }) => <tbody className="divide-y divide-muted">{children}</tbody>,
                            tr: ({ children, className, ...props }) => (
                                <tr
                                    className={`hover:bg-muted/50 transition-colors ${className || ''}`}
                                    {...props}
                                >{children}</tr>
                            ),
                            th: ({ children, style }) => (
                                <th
                                    className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                                    style={style}
                                >{children}</th>
                            ),
                            td: ({ children, style }) => (
                                <td
                                    className="px-4 py-3 align-middle break-words"
                                    style={style}
                                >{children}</td>
                            ),
                            // Existing code component
                            code: ({ className, children, ...props }: {
                                className?: string;
                                inline?: boolean;
                                children?: React.ReactNode;
                                [key: string]: any;
                            }) => {
                                const inline = props.inline || false;
                                return (
                                    <code
                                        className={`${className} ${inline ? 'px-1 py-0.5 bg-muted rounded text-sm' : ''}`}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            pre: ({ children }) => (
                                <pre className="p-4 rounded-md bg-muted overflow-x-auto my-4">{children}</pre>
                            ),
                        }}
                    >
                        {block}
                    </ReactMarkdown>
                ))}
            </div>
        );
    }
);

ReadableMemoizedMarkdown.displayName = 'ReadableMemoizedMarkdown';