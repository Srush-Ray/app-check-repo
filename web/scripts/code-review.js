/* global process */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI escape codes for styling
const styles = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`${styles.bold}${styles.cyan}🚀 Starting Portfolio Project Code Review...${styles.reset}\n`);

let hasErrors = false;
let hasWarnings = false;

// Helper to run commands safely
function runCommand(command, description) {
  console.log(`${styles.bold}⏳ Running: ${description}...${styles.reset}`);
  try {
    const stdout = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, stdout };
  } catch (error) {
    return { success: false, stdout: error.stdout, stderr: error.stderr };
  }
}

// 1. Check Git Status
console.log(`${styles.bold}${styles.blue}--- [1] Git Status & Changed Files ---${styles.reset}`);
const gitStatus = runCommand('git status --porcelain', 'Checking unstaged changes');
if (gitStatus.success) {
  const lines = gitStatus.stdout.trim().split('\n').filter(Boolean);
  if (lines.length === 0) {
    console.log(`${styles.green}✅ Clean working directory. No uncommitted changes.${styles.reset}\n`);
  } else {
    console.log(`${styles.yellow}⚠️ Found ${lines.length} uncommitted/untracked file(s):${styles.reset}`);
    lines.forEach(line => console.log(`  ${styles.dim}${line}${styles.reset}`));
    console.log('');
  }
} else {
  console.log(`${styles.red}❌ Git command failed (or not a git repository). Skipping git checks.${styles.reset}\n`);
}

// 2. Run ESLint
console.log(`${styles.bold}${styles.blue}--- [2] ESLint Code Quality ---${styles.reset}`);
const lintResult = runCommand('npx eslint . --format json', 'Running ESLint static analysis');

if (lintResult.success) {
  console.log(`${styles.green}✅ ESLint passed with 0 errors/warnings!${styles.reset}\n`);
} else {
  try {
    const results = JSON.parse(lintResult.stdout || '[]');
    let errorsCount = 0;
    let warningsCount = 0;

    results.forEach(file => {
      if (file.messages.length > 0) {
        console.log(`${styles.bold}${styles.yellow}📄 ${path.relative(process.cwd(), file.filePath)}${styles.reset}`);
        file.messages.forEach(msg => {
          const isError = msg.severity === 2;
          const color = isError ? styles.red : styles.yellow;
          const label = isError ? 'Error' : 'Warning';
          if (isError) {
            errorsCount++;
            hasErrors = true;
          } else {
            warningsCount++;
            hasWarnings = true;
          }
          console.log(`  ${color}[${label}] Line ${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})${styles.reset}`);
        });
      }
    });

    if (errorsCount > 0 || warningsCount > 0) {
      console.log(`\n${styles.bold}${styles.red}❌ ESLint found ${errorsCount} errors and ${warningsCount} warnings.${styles.reset}\n`);
    } else {
      console.log(`${styles.green}✅ ESLint passed.${styles.reset}\n`);
    }
  } catch (parseError) {
    console.log(`${styles.red}❌ Failed to parse ESLint output: ${parseError.message}. Raw output below:${styles.reset}`);
    console.log(lintResult.stdout || lintResult.stderr);
    console.log('\n');
    hasErrors = true;
  }
}

// 3. Scan codebase for key patterns (TODO, console.log, credentials, debugger)
console.log(`${styles.bold}${styles.blue}--- [3] Scanning Source Code for Common Issues ---${styles.reset}`);
const srcDir = path.join(process.cwd(), 'src');

const patternChecks = [
  { name: 'Debugger statement', regex: /\bdebugger\b/g, severity: 'error' },
  { name: 'Console log statement', regex: /\bconsole\.log\b/g, severity: 'warning' },
  { name: 'TODO / FIXME reminder', regex: /\b(TODO|FIXME)\b/gi, severity: 'warning' },
  { name: 'Potential hardcoded credential/secret', regex: /(api_?key|secret|password|passwd|token)\s*[:=]\s*['"`][a-zA-Z0-9_-]{10,}['"`]/gi, severity: 'warning' }
];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && !file.startsWith('.')) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile() && /\.(js|jsx|css)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(process.cwd(), fullPath);

      patternChecks.forEach(check => {
        let match;
        // Reset regex index for global matches
        check.regex.lastIndex = 0;
        
        while ((match = check.regex.exec(content)) !== null) {
          // Find line number
          const linesBefore = content.substring(0, match.index).split('\n');
          const lineNum = linesBefore.length;
          const colNum = linesBefore[linesBefore.length - 1].length + 1;
          const lineText = content.split('\n')[lineNum - 1].trim();

          const color = check.severity === 'error' ? styles.red : styles.yellow;
          const label = check.severity.toUpperCase();
          
          if (check.severity === 'error') hasErrors = true;
          if (check.severity === 'warning') hasWarnings = true;

          console.log(`  ${color}[${label}] ${relativePath}:${lineNum}:${colNum} - Found ${check.name}:${styles.reset}`);
          console.log(`    ${styles.dim}Code: "${lineText}"${styles.reset}`);
        }
      });
    }
  });
}

scanDirectory(srcDir);
console.log(`${styles.green}✅ Code scan complete.${styles.reset}\n`);

// 4. Try building the app to ensure no compilation/bundling errors
console.log(`${styles.bold}${styles.blue}--- [4] Build Validation ---${styles.reset}`);
const buildResult = runCommand('npm run build', 'Running production build test');
if (buildResult.success) {
  console.log(`${styles.green}✅ Build passed successfully! Ready for production deployment.${styles.reset}\n`);
} else {
  console.log(`${styles.red}❌ Build failed! Please fix compilation errors before deploying.${styles.reset}`);
  console.log(`${styles.dim}${buildResult.stderr || buildResult.stdout}${styles.reset}\n`);
  hasErrors = true;
}

// Summary
console.log(`${styles.bold}${styles.cyan}=================== Summary ===================${styles.reset}`);
if (hasErrors) {
  console.log(`${styles.bold}${styles.red}🔴 Code Review FAILED. Please resolve the errors highlighted above before pushing/deploying.${styles.reset}`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${styles.bold}${styles.yellow}🟡 Code Review PASSED with warnings. Consider cleaning up the warnings before pushing/deploying.${styles.reset}`);
  process.exit(0);
} else {
  console.log(`${styles.bold}${styles.green}🟢 Code Review PASSED! The code is clean and builds successfully.${styles.reset}`);
  process.exit(0);
}
