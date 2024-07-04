import { inclusiveTerms, genderOptions } from './inclusive-terms.mjs';
import nlp from 'compromise';
import View from 'compromise/types/view/one';
import { Rule } from 'eslint';

const replaceTerms = (text: string): string => {
  const regex = new RegExp(Object.keys(inclusiveTerms).join("|"), "gi");
  return text.replace(regex, (matched) => inclusiveTerms[matched.toLowerCase()]);
};

const rewriteComment = (comment: string): string => {
    const doc = nlp(comment);
    let view: View = doc
    Object.keys(inclusiveTerms).forEach(term => {
        view = view.replace(term as string, inclusiveTerms[term]);
    });
    return view.out('text')
  };

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce inclusive language",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    return {
      Identifier(node) {
        const newName = replaceTerms((node as any).name);
        if (newName !== (node as any).name) {
          context.report({
            node,
            message: `Use inclusive term '${newName}' instead of '${(node as any).name}'`,
            fix(fixer) {
              return fixer.replaceText(node, newName);
            },
          });
        }
      },
      Literal(node) {
        if (typeof (node as any).value === "string") {
          const newValue = replaceTerms((node as any).value);
          if (newValue !== (node as any).value) {
            context.report({
              node,
              message: `Use inclusive language in comments and strings`,
              fix(fixer) {
                return fixer.replaceText(node, `'${newValue}'`);
              },
            });
          }
        }
      },
      BlockComment(node) {
        const newComment = rewriteComment((node as any).value);
        if (newComment !== (node as any).value) {
          context.report({
            node,
            message: `Rewrite comment to be inclusive`,
            fix(fixer) {
              return fixer.replaceText(node, `/*${newComment}*/`);
            },
          });
        }
      },
      LineComment(node) {
        const newComment = rewriteComment((node as any).value);
        if (newComment !== (node as any).value) {
          context.report({
            node,
            message: `Rewrite comment to be inclusive`,
            fix(fixer) {
              return fixer.replaceText(node, `//${newComment}`);
            },
          });
        }
      },
      JSXAttribute(node) {
        if (/gender|sex/i.test((node as any).name.name)) {
          context.report({
            node,
            message: `Replace gender/sex options with inclusive alternatives`,
            fix(fixer) {
              return fixer.replaceText((node as any).value, `"${genderOptions.join(', ')}"`);
            },
          });
        }
      },
      AngularComponent(node) {
        if (/gender|sex/i.test((node as any).name.name)) {
          context.report({
            node,
            message: `Replace gender/sex options with inclusive alternatives`,
            fix(fixer) {
              return fixer.replaceText((node as any).value, `"${genderOptions.join(', ')}"`);
            },
          });
        }
      }
    };
  },
};

export default rule;
