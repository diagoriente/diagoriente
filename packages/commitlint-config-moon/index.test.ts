import { RuleConfigSeverity } from '@commitlint/types';
import { execSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:child_process');

const mockedExecSync = vi.mocked(execSync);

// Re-import the module fresh for each test group via dynamic import
async function importModule() {
  return (await import('./index.ts')).default;
}

describe('commitlint-config-moon', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('module shape', () => {
    it('exports utils.getProjects as a function', async () => {
      mockedExecSync.mockReturnValue('[]');
      const mod = await importModule();
      expect(typeof mod.utils.getProjects).toBe('function');
    });

    it('exports rules with scope-enum as a function', async () => {
      mockedExecSync.mockReturnValue('[]');
      const mod = await importModule();
      expect(typeof mod.rules['scope-enum']).toBe('function');
    });
  });

  describe('getProjects()', () => {
    it('returns an array of project ids on success', async () => {
      const projects = [
        { id: 'api', source: 'apps/api' },
        { id: 'web', source: 'apps/web' },
        { id: 'shared', source: 'packages/shared' },
      ];
      mockedExecSync.mockReturnValue(JSON.stringify(projects));

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual(['api', 'web', 'shared']);
    });

    it('returns only the id field, discarding other project properties', async () => {
      const projects = [
        { id: 'backend', source: 'apps/backend', stack: 'node', layer: 'app' },
      ];
      mockedExecSync.mockReturnValue(JSON.stringify(projects));

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual(['backend']);
    });

    it('returns an empty array when moon returns an empty project list', async () => {
      mockedExecSync.mockReturnValue('[]');

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual([]);
    });

    it('calls execSync with the correct moon command', async () => {
      mockedExecSync.mockReturnValue('[]');

      const mod = await importModule();
      mod.utils.getProjects();

      expect(mockedExecSync).toHaveBeenCalledWith('moon projects --json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
    });

    it('returns an empty array and warns when execSync throws', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('moon: command not found');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ [commitlint-config-moon] Failed to fetch moon projects.',
      );
    });

    it('returns an empty array and warns when moon output is invalid JSON', async () => {
      mockedExecSync.mockReturnValue('not-valid-json');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ [commitlint-config-moon] Failed to fetch moon projects.',
      );
    });

    it('returns an empty array and warns when moon returns null JSON', async () => {
      mockedExecSync.mockReturnValue('null');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mod = await importModule();
      const result = mod.utils.getProjects();

      // null.map throws a TypeError, so the catch block kicks in
      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ [commitlint-config-moon] Failed to fetch moon projects.',
      );
    });

    it('returns an empty array and warns when execSync exits with non-zero code', async () => {
      const err = Object.assign(new Error('Command failed'), { status: 1 });
      mockedExecSync.mockImplementation(() => {
        throw err;
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ [commitlint-config-moon] Failed to fetch moon projects.',
      );
    });

    it('handles a single project correctly', async () => {
      mockedExecSync.mockReturnValue(JSON.stringify([{ id: 'solo' }]));

      const mod = await importModule();
      const result = mod.utils.getProjects();

      expect(result).toEqual(['solo']);
    });
  });

  describe("rules['scope-enum']", () => {
    it('returns a tuple with RuleConfigSeverity.Error as the first element', async () => {
      mockedExecSync.mockReturnValue(JSON.stringify([{ id: 'app' }]));

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];
      const [severity] = rule({} as any);

      expect(severity).toBe(RuleConfigSeverity.Error);
    });

    it('returns "always" as the applicable condition', async () => {
      mockedExecSync.mockReturnValue('[]');

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];
      const [, applicable] = rule({} as any);

      expect(applicable).toBe('always');
    });

    it('returns an array of project ids as the allowed scopes', async () => {
      const projects = [{ id: 'frontend' }, { id: 'backend' }];
      mockedExecSync.mockReturnValue(JSON.stringify(projects));

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];
      const [, , scopes] = rule({} as any);

      expect(scopes).toEqual(['frontend', 'backend']);
    });

    it('returns an empty scope list when no projects are found', async () => {
      mockedExecSync.mockReturnValue('[]');

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];
      const [, , scopes] = rule({} as any);

      expect(scopes).toEqual([]);
    });

    it('returns an empty scope list and falls back gracefully when moon is unavailable', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('spawn ENOENT');
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];
      const [severity, applicable, scopes] = rule({} as any);

      expect(severity).toBe(RuleConfigSeverity.Error);
      expect(applicable).toBe('always');
      expect(scopes).toEqual([]);
    });

    it('ignores the context parameter (returns same result for any ctx value)', async () => {
      const projects = [{ id: 'lib' }];
      mockedExecSync.mockReturnValue(JSON.stringify(projects));

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];

      const result1 = rule({} as any);
      const result2 = rule(undefined as any);
      const result3 = rule({ commits: [], cwd: '/foo', env: {} } as any);

      expect(result1).toEqual(result2);
      expect(result1).toEqual(result3);
    });

    it('returns a new array (spread) so mutations do not affect internal state', async () => {
      const projects = [{ id: 'core' }];
      mockedExecSync.mockReturnValue(JSON.stringify(projects));

      const mod = await importModule();
      const rule = mod.rules['scope-enum'];
      const [, , scopes] = rule({} as any);

      // mutate the returned scopes
      (scopes as string[]).push('injected');

      // call again — should not be affected by the previous mutation
      mockedExecSync.mockReturnValue(JSON.stringify(projects));
      const [, , scopes2] = rule({} as any);
      expect(scopes2).not.toContain('injected');
    });
  });
});