import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Improved table detection function
function hasValidTable(content: string): boolean {
    // A valid table should have pipe characters and at least one header-body separator row
    // The separator row must contain at least one "---" or ":-:" pattern between pipes
    const lines = content.split('\n');
    if (lines.length < 3) return false;

    // Find potential header and separator rows
    const potentialHeaderRow = lines.findIndex(line => line.includes('|'));
    if (potentialHeaderRow === -1) return false;

    // Check if the next row contains a valid separator (---|--- or :--|:--: etc)
    if (potentialHeaderRow + 1 >= lines.length) return false;

    const potentialSeparatorRow = lines[potentialHeaderRow + 1];
    if (!potentialSeparatorRow.includes('|')) return false;

    // Check if separator row contains dashes between pipes
    const cells = potentialSeparatorRow.split('|').filter(Boolean);
    return cells.every(cell => {
        const trimmed = cell.trim();
        return /^[-:]+$/.test(trimmed) && trimmed.includes('-');
    });
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown);
    return tokens.map(token => token.raw);
}

export const ReadableMemoizedMarkdown = memo(
    ({ content, id }: { content: string; id: string }) => {
        // Use the improved table detection function
        const hasTable = useMemo(() => hasValidTable(content), [content]);

        // Only split into blocks if there's no table
        const blocks = useMemo(() =>
            hasTable ? [content] : parseMarkdownIntoBlocks(content),
            [content, hasTable]
        );

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
                            // Enhanced table components with stronger styling and better validation
                            table: ({ children }) => {
                                // Only render the table if we detected a valid table structure
                                return hasTable ? (
                                    <div className="overflow-x-auto my-6 rounded-lg border border-border">
                                        <table className="min-w-full w-full table-auto border-collapse">
                                            {children}
                                        </table>
                                    </div>
                                ) : (
                                    <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Table rendering error: Invalid markdown table format.
                                        </p>
                                    </div>
                                );
                            },
                            thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                            tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
                            tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                            th: ({ children }) => (
                                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold border-r border-border last:border-r-0">
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => <td className="px-4 py-3 text-sm border-r border-border last:border-r-0">{children}</td>,
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
