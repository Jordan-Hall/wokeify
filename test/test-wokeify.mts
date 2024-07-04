import assert from 'assert';
import { it, before, after, describe } from 'node:test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { __dirname } from '../src/utils.mjs';

const testDir = path.join(__dirname, 'temp');

// Helper function to run CLI commands
const runCLI = (command: string) => {
  return execSync(`node ${path.join(__dirname, '../src/cli.mjs')} ${command}`, { encoding: 'utf8' });
};
// Setup test environment
before(() => {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
});

after(() => {
  fs.rmdirSync(testDir, { recursive: true });
});

// Test JavaScript linting
describe('JavaScript Linting', () => {
  const jsFile = path.join(testDir, 'test.js');

  before(() => {
    fs.writeFileSync(jsFile, `// he is a good man\nlet he = 'he';\n`);
  });

  after(() => {
    fs.unlinkSync(jsFile);
  });

  it('should lint JavaScript file and suggest inclusive language', () => {
    const output = runCLI(`lint-js -f ${jsFile}`);
    assert(output.includes("Use inclusive term 'they' instead of 'he'"));
  });
});

// Test CSS linting
describe('CSS Linting', () => {
  const cssFile = path.join(testDir, 'test.css');

  before(() => {
    fs.writeFileSync(cssFile, `/* This is for men only */\n`);
  });

  after(() => {
    fs.unlinkSync(cssFile);
  });

  it('should lint CSS file and suggest inclusive language', () => {
    const output = runCLI(`lint-css -f ${cssFile}`);
    assert(output.includes("Expected \"a person that identifies as an individual and maybe a man\" instead of \"men\""));
  });
});

// Test Markdown linting
describe('Markdown Linting', () => {
  const mdFile = path.join(testDir, 'test.md');

  before(() => {
    fs.writeFileSync(mdFile, `This section is for men.\n`);
  });

  after(() => {
    fs.unlinkSync(mdFile);
  });

  it('should lint Markdown file and suggest inclusive language', () => {
    const output = runCLI(`lint-md -f ${mdFile}`);
    assert(output.includes("Use inclusive term: \"a person that identifies as an individual and maybe a man\" instead of \"men\""));
  });
});

// Test HTML linting
describe('HTML Linting', () => {
  const htmlFile = path.join(testDir, 'test.html');

  before(() => {
    fs.writeFileSync(htmlFile, `<div>men only</div>\n`);
  });

  after(() => {
    fs.unlinkSync(htmlFile);
  });

  it('should lint HTML file and suggest inclusive language', () => {
    const output = runCLI(`lint-html -f ${htmlFile}`);
    assert(output.includes("Use inclusive term: \"a person that identifies as an individual and maybe a man\" instead of \"men\""));
  });
});

// Test Git branch renaming
describe('Git Branch Renaming', () => {
  const gitDir = path.join(testDir, 'git-repo');

  before(() => {
    execSync(`git init ${gitDir}`);
    process.chdir(gitDir);
    execSync(`git checkout -b master`);
  });

  after(() => {
    process.chdir(__dirname);
    fs.rmdirSync(gitDir, { recursive: true });
  });

  it('should rename master branch to develop or main', () => {
    runCLI('fix-git-branches');
    const branches = execSync('git branch', { encoding: 'utf8' }).split('\n').map(branch => branch.trim());
    assert(branches.includes('develop') || branches.includes('main'));
  });
});