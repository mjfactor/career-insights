import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

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
                        components={{
                            p: ({ children }) => <p className="my-4">{children}</p>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold my-6">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold my-5">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold my-4">{children}</h3>,
                            ul: ({ children }) => <ul className="my-4 ml-6 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-4 ml-6 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-2">{children}</li>,
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
