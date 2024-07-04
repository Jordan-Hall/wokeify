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
  id: "inclusive-language",
  description: "Enforce inclusive language",
  init(parser: any, reporter: any) {
    parser.addListener("text", (event: any) => {
      const originalText = event.raw;
      let newText = rewriteText(originalText);
      newText = replaceGenderOptions(newText);
      if (originalText !== newText) {
        reporter.warn(`Use inclusive term: "${newText}" instead of "${originalText}"`, event.line, event.col, this, event.raw);
      }
    });
  }
};