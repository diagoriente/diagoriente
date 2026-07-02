import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';
import moon from '@diagoriente/commitlint-config-moon';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': (_ctx) => [
      RuleConfigSeverity.Error,
      'always',
      [...moon.utils.getProjects(), 'deps', 'release'],
    ],
  },
};

export default Configuration;
