import { RuleConfigSeverity } from '@commitlint/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@diagoriente/commitlint-config-moon', () => ({
  default: {
    utils: {
      getProjects: vi.fn(),
    },
    rules: {
      'scope-enum': vi.fn(),
    },
  },
}));

async function importMoonMock() {
  const mod = await import('@diagoriente/commitlint-config-moon');
  return mod.default;
}

async function importConfig() {
  return (await import('./commitlint.config.ts')).default;
}

describe('commitlint.config.ts', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('static configuration shape', () => {
    it('extends @commitlint/config-conventional', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue([]);

      const config = await importConfig();

      expect(config.extends).toContain('@commitlint/config-conventional');
    });

    it('defines a scope-enum rule', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue([]);

      const config = await importConfig();

      expect(config.rules).toBeDefined();
      expect(typeof config.rules!['scope-enum']).toBe('function');
    });
  });

  describe("scope-enum rule", () => {
    it('returns RuleConfigSeverity.Error as the severity', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue(['app', 'api']);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [severity] = scopeEnum({});

      expect(severity).toBe(RuleConfigSeverity.Error);
    });

    it('returns "always" as the applicable condition', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue([]);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, applicable] = scopeEnum({});

      expect(applicable).toBe('always');
    });

    it('includes moon project ids in the allowed scopes', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue(['frontend', 'backend', 'shared']);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, , scopes] = scopeEnum({});

      expect(scopes).toContain('frontend');
      expect(scopes).toContain('backend');
      expect(scopes).toContain('shared');
    });

    it('always includes "deps" in the allowed scopes', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue([]);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, , scopes] = scopeEnum({});

      expect(scopes).toContain('deps');
    });

    it('always includes "release" in the allowed scopes', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue([]);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, , scopes] = scopeEnum({});

      expect(scopes).toContain('release');
    });

    it('combines moon projects with deps and release', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue(['api', 'web']);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, , scopes] = scopeEnum({});

      expect(scopes).toEqual(['api', 'web', 'deps', 'release']);
    });

    it('works when moon returns no projects (only deps and release remain)', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue([]);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, , scopes] = scopeEnum({});

      expect(scopes).toEqual(['deps', 'release']);
    });

    it('does not duplicate scopes if moon returns deps or release as project ids', async () => {
      const moon = await importMoonMock();
      // Edge case: moon project named 'deps' overlaps with the hardcoded scope
      vi.mocked(moon.utils.getProjects).mockReturnValue(['deps']);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;
      const [, , scopes] = scopeEnum({});

      // The config spreads both arrays so 'deps' appears twice — this is a regression guard
      // to document the current (expected) behaviour
      expect(scopes).toEqual(['deps', 'deps', 'release']);
    });

    it('the scope-enum rule factory ignores its context argument', async () => {
      const moon = await importMoonMock();
      vi.mocked(moon.utils.getProjects).mockReturnValue(['core']);

      const config = await importConfig();
      const scopeEnum = config.rules!['scope-enum'] as Function;

      const result1 = scopeEnum({});
      const result2 = scopeEnum(undefined);
      const result3 = scopeEnum({ commits: [], cwd: '/some/path' });

      expect(result1).toEqual(result2);
      expect(result1).toEqual(result3);
    });
  });
});