# BuildFetch remote cache

BuildFetch provides the remote build cache used by Moon. It can reuse build
artifacts from previous runs and reduce the time needed to run CI locally and
in GitHub Actions.

## Configuration

The remote cache is configured in `.moon/workspace.yml`:

```yaml
remote:
  host: grpcs://cache.eu-central-a.buildfetch.com
  auth:
    token: "BUILDFETCH_TOKEN"
  cache:
    instanceName: reapi/bazel/IxgUTK
    localReadOnly: true
```

Moon reads the token from the `BUILDFETCH_TOKEN` environment variable. In local
development, `localReadOnly` prevents local builds from uploading new blobs to
BuildFetch while still allowing them to consume cached artifacts.

## Local development

To use the remote cache locally, set `BUILDFETCH_TOKEN` in the shell before
running Moon:

```sh
export BUILDFETCH_TOKEN="<your-token>"
moon ci
```

Do not commit the token or place it in tracked configuration files. Prefer a
shell profile, an approved local secrets manager, or another untracked
environment-file mechanism for local development.

## GitHub Actions

The Moon CI steps in `.github/workflows/ci.yml` pass a context-specific secret
to Moon while keeping the environment variable name unchanged:

```yaml
- name: Run Moon CI (for pull requests)
  if: github.event_name == 'pull_request'
  run: moon ci
  env:
    BUILDFETCH_TOKEN: ${{ secrets.BUILDFETCH_TOKEN_READONLY }}

- name: Run Moon CI (for master branch)
  if: github.event_name == 'push' && github.ref == 'refs/heads/master'
  run: moon ci
  env:
    BUILDFETCH_TOKEN: ${{ secrets.BUILDFETCH_TOKEN }}
```

Configure the following GitHub Actions secrets:

- `BUILDFETCH_TOKEN_READONLY`: a restricted, read-only BuildFetch token for pull
  request validation.
- `BUILDFETCH_TOKEN`: the normal BuildFetch token for pushes to `master`.

Pull requests originating from forks do not receive repository secrets, so
those runs should be expected to work without authenticated access to
BuildFetch.

## Troubleshooting

- If Moon cannot authenticate, verify that `BUILDFETCH_TOKEN` is set and that
  the token is valid for `grpcs://cache.eu-central-a.buildfetch.com`.
- If a build succeeds but is slower than expected, check whether the token is
  available and whether the remote cache is reachable.
- Never print the token in logs or include it in command output submitted to
  CI artifacts.
