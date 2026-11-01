import { readFileSync } from 'node:fs';
import path from 'node:path';
import { checkPairs } from './designSystem/checkPairs.ts';
import { CONTRAST_PAIRS } from './designSystem/contrastPairs.ts';
import { parseTokens } from './designSystem/parseTokens.ts';

function run(): void {
  const tokensPath = path.resolve(process.cwd(), 'src/styles/tokens.css');
  const cssContent = readFileSync(tokensPath, 'utf8');
  const themes = parseTokens(cssContent);
  const findings = checkPairs(themes, CONTRAST_PAIRS);

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(finding);
    }
    console.error(`\n${findings.length} contrast finding(s)`);
    process.exitCode = 1;
    return;
  }

  console.log('0 contrast findings');
}

run();
