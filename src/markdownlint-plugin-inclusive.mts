import { inclusiveTerms, genderOptions } from './inclusive-terms.mjs';

const rewriteText = (text: string): string => {
  const regex = new RegExp(Object.keys(inclusiveTerms).join("|"), "gi");
  return text.replace(regex, (matched) => inclusiveTerms[matched.toLowerCase()]);
};

const replaceGenderOptions = (text: string): string => {
  if (/gender|sex/i.test(text)) {
    return `Gender options: ${genderOptions.join(', ')}`;
  }
  return text;
};

export const inclusiveLanguage = {
  names: ["inclusive-language"],
  description: "Enforce inclusive language",
  tags: ["inclusive", "language"],
  function: (params: any, onError: any) => {
    params.tokens.forEach((token: any) => {
      if (token.type === 'inline') {
        token.children.forEach((child: any) => {
          if (child.type === 'text') {
            const originalText = child.content;
            let newText = rewriteText(originalText);
            newText = replaceGenderOptions(newText);
            if (originalText !== newText) {
              onError({
                lineNumber: child.lineNumber,
                detail: `Use inclusive term: "${newText}" instead of "${originalText}"`,
                fixInfo: {
                  editColumn: child.lineNumber,
                  deleteCount: originalText.length,
                  insertText: newText
                }
              });
            }
          }
        });
      }
    });
  }
};