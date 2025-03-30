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
            <div className="font-sans text-base leading-relaxed prose prose-stone dark:prose-invert max-w-none">
                {blocks.map((block, index) => (
                    <ReactMarkdown
                        key={`${id}-block_${index}`}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 pb-1 border-b" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-2" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="text-sm font-semibold mt-3 mb-1" {...props} />,
                            a: ({ node, href, ...props }) => (
                                <a href={href} className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                            p: ({ node, ...props }) => <p className="my-2 text-sm" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                            li: ({ node, ...props }) => <li className="my-1 text-sm" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-3 py-1 my-3 italic text-sm" {...props} />,
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4 border rounded">
                                    <table className="w-full text-sm" {...props} />
                                </div>
                            ),
                            thead: ({ node, ...props }) => <thead className="border-b" {...props} />,
                            tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
                            th: ({ node, ...props }) => <th className="border-r last:border-r-0 px-3 py-2 text-left font-medium" {...props} />,
                            td: ({ node, ...props }) => <td className="border-r last:border-r-0 px-3 py-2" {...props} />,
                            hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
                            // Keep the existing code component with some adjustments
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
