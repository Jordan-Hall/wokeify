import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ESLint } from 'eslint';
import stylelint from 'stylelint';
import markdownlint from 'markdownlint';
import { HTMLHint } from 'htmlhint';
import simpleGit from 'simple-git';
import { inclusiveLanguage as htmlhintInclusiveRule } from './htmlhint-plugin-inclusive.mjs'
import glob from 'glob';
import { __dirname } from './utils.mjs';
import path from 'path';

const git = simpleGit();

const lintJavaScript = async (files: string[]) => {
  const cli = new ESLint({
    useEslintrc: false,
    baseConfig: {
      plugins: ["inclusive-language"],
      rules: {
        "inclusive-language/inclusive-language": "warn",
      },
      parser: "@babel/eslint-parser",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  });
  const results = await cli.lintFiles(files);
  const formatter = await cli.loadFormatter("stylish");
  const resultText = formatter.format(results);
  console.log(resultText);
};

const lintCSS = async (files: string[]) => {
  const result = await stylelint.lint({
    files,
    config: {
      plugins: [path.join(__dirname, "./stylelint-plugin-inclusive.mjs")],
      rules: {
        "inclusive-language/inclusive-language": true,
      },
    },
  });
  console.log(result.output);
};

const lintMarkdown = (files: string[]) => {
  markdownlint({
    files,
    config: {
      "default": true,
      "customRules": [require.resolve("./markdownlint-plugin-inclusive.mjs")],
    },
  }, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result.toString());
    }
  });
};

const lintHTML = (files: string[]) => {
  HTMLHint.addRule(htmlhintInclusiveRule);
  files.forEach(file => {
    const content = require('fs').readFileSync(file, 'utf-8');
    const messages = HTMLHint.verify(content, { "inclusive-language": true });
    messages.forEach(msg => {
      console.log(`${file} [${msg.line},${msg.col}]: ${msg.message}`);
    });
  });
};

const argv = yargs(hideBin(process.argv))
  .command("lint-js", "Lint JavaScript files for inclusive language", {}, async () => {
    const files = glob.sync("**/*.js");
    await lintJavaScript(files);
  })
  .command("lint-css", "Lint CSS files for inclusive language", {}, async () => {
    const files = glob.sync("**/*.css");
    await lintCSS(files);
  })
  .command("lint-md", "Lint Markdown files for inclusive language", {}, () => {
    const files = glob.sync("**/*.md");
    lintMarkdown(files);
  })
  .command("lint-html", "Lint HTML files for inclusive language", {}, () => {
    const files = glob.sync("**/*.html");
    lintHTML(files);
  })
  .command("fix-git-branches", "Rename master and slave branches", () => {}, () => {
    git.branchLocal((err, branchSummary) => {
      if (err) {
        console.error(err);
        return;
      }
      const branches = branchSummary.all;
      const renameBranch = (oldName: string, newName: string) => {
        git.branch(["-m", oldName, newName], (err) => {
          if (err) console.error(`Failed to rename branch ${oldName} to ${newName}:`, err);
          else console.log(`Renamed branch ${oldName} to ${newName}`);
        });
      };

      if (branches.includes("master")) {
        renameBranch("master", branches.includes("develop") ? "main" : "develop");
      }
      if (branches.includes("slave")) {
        renameBranch("slave", "secondary");
      }
    });
  })
  .help()
  .alias("help", "h")
  .argv;

(async () => {
  await argv;
})();