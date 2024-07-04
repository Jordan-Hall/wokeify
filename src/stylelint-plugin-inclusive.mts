import stylelint from 'stylelint';
import { inclusiveTerms } from './inclusive-terms.mjs';
import nlp from 'compromise';
import View from 'compromise/types/view/one';

const replaceTerms = (text: string): string => {
  Object.keys(inclusiveTerms).forEach(term => {
    const regex = new RegExp(term, 'gi');
    text = text.replace(regex, inclusiveTerms[term]);
  });
  return text;
};

const rewriteComment = (comment: string): string => {
  let doc = nlp(comment);
  let view: View = doc;
  Object.keys(inclusiveTerms).forEach(term => {
    view = view.replace(term as string, inclusiveTerms[term]);
  });
  return view.out('text');
};


const ruleName = "inclusive-language";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (original: string, replacement: string) =>
    `Expected "${original}" to be "${replacement}"`,
});

const rule: stylelint.Rule = (primaryOption) => {
  return (root, result) => {
    root.walkComments((comment) => {
      const newText = rewriteComment(comment.text);
      if (newText !== comment.text) {
        stylelint.utils.report({
          message: messages.expected(comment.text, newText),
          node: comment,
          result,
          ruleName,
        });
        comment.text = newText;
      }
    });
  };
};

rule.ruleName = ruleName;
rule.messages = messages;

export default rule;
export { ruleName, messages };
