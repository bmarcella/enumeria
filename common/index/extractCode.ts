/**
 * Extracts explanations, code blocks, and their languages from a given text.
 * @param text The text to search for explanations, code blocks, and languages.
 * @returns An array of objects, each containing an explanation, code block, and language.
 */
export type CodeText =  { explanation?: string, message: string, language?: string, hasCode: boolean };

export const extractCode = (text: string) : CodeText[] => {
    const codeSegments: CodeText[] = [];
    const codeBlockRegex = /(.*?)(```(\w+)?\s*([\s\S]*?)```)/gs;

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        const explanation = match[1].trim();
        const language = match[3] ? match[3].trim() : '';
        const code = match[4].trim();
        codeSegments.push({ explanation, message: code, language, hasCode: true });
    }

    return codeSegments;
};

/**
 * Converts a given text to HTML format and removes symbols.
 * @param text The text to convert to HTML.
 * @returns The HTML string.
 */
export const convertToHTML = (text: string): string => {
    const lines = text.split('\n');
    let html = '';

    lines.forEach(line => {
        if (line.startsWith('### ')) {
            html += `<h3>${line.substring(4)}</h3>`;
        } else if (line.startsWith('#### ')) {
            html += `<h4>${line.substring(5)}</h4>`;
        } else if (line.startsWith('1. ')) {
            html += `<ol><li>${line.substring(3)}</li></ol>`;
        } else if (line.startsWith('- ')) {
            html += `<ul><li>${line.substring(2)}</li></ul>`;
        } else if (line.startsWith('**')) {
            const boldText = line.match(/\*\*(.*?)\*\*/);
            if (boldText) {
                html += `<strong>${boldText[1]}</strong>`;
            }
        } else if (line.startsWith('```')) {
            const codeLang = line.match(/```(\w+)?/);
            if (codeLang) {
                html += `<pre><code class="${codeLang[1]}">`;
            } else {
                html += `<pre><code>`;
            }
        } else if (line.endsWith('```')) {
            html += `${line.substring(0, line.length - 3)}</code></pre>`;
        } else {
            html += `<p>${line}</p>`;
        }
    });

    // Remove symbols
    html = html.replace(/[*#`-]/g, '');
    return html;
};
