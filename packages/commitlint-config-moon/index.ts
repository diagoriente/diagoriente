import { type RuleConfigContext, RuleConfigSeverity } from '@commitlint/types';
import { execSync } from 'node:child_process';

function getProjects() {
  try {
    const output = execSync('moon projects --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const projects = JSON.parse(output);
    return projects.map((p: any) => p.id);
  } catch {
    console.warn('⚠️ [commitlint-config-moon] Failed to fetch moon projects.');
    return [];
  }
}

export default {
  utils: { getProjects },
  rules: {
    'scope-enum': (_ctx: RuleConfigContext) => [
      RuleConfigSeverity.Error,
      'always',
      [...getProjects()],
    ],
  },
};
