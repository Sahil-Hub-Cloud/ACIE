import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  bold: (msg: string) => console.log(chalk.bold(msg)),
  
  header: (title: string) => {
    console.log('');
    console.log(chalk.bold.cyan(`⚡ ${title}`));
    console.log(chalk.dim('─'.repeat(50)));
  },

  table: (data: Record<string, string | number>[]) => {
    console.table(data);
  },
};

export function spinner(text: string): Ora {
  return ora({ text, color: 'cyan', spinner: 'dots' }).start();
}

export function formatRisk(level: string): string {
  switch (level) {
    case 'critical': return chalk.red.bold('🚨 CRITICAL');
    case 'high': return chalk.red('🔴 HIGH');
    case 'medium': return chalk.yellow('⚠️  MEDIUM');
    case 'low': return chalk.green('✅ LOW');
    default: return chalk.dim('UNKNOWN');
  }
}

export function formatScore(score: number): string {
  if (score >= 76) return chalk.red.bold(score.toString());
  if (score >= 51) return chalk.red(score.toString());
  if (score >= 26) return chalk.yellow(score.toString());
  return chalk.green(score.toString());
}
