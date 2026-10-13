# Errors

## [ERR-20261013-001] npm-run-build

**Logged**: 2026-10-13T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The initial build validation could not find the local Astro executable because dependencies were not installed.

### Error
```
sh: astro: command not found
```

### Context
- Command: `npm run build`
- The repository contains `pnpm-lock.yaml` and no populated `node_modules` directory.

### Suggested Fix
Install dependencies with the lockfile's package manager, then rerun the build.

### Metadata
- Reproducible: yes
- Related Files: package.json, pnpm-lock.yaml

### Resolution
- **Resolved**: 2026-10-13T00:00:00+08:00
- **Notes**: Installed dependencies with pnpm 8.15.9, matching lockfile version 6, and completed the build.

---

## [ERR-20261013-004] remove-editimg

**Logged**: 2026-10-13T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: config

### Summary
The manager was asked to remove EditImg after the user had already removed it completely.

### Error
```
Error: Unknown site: editimg
```

### Context
- Command: `manage-backlinks.mjs remove --id editimg`
- The configuration no longer contained either the site or its footer reference.

### Suggested Fix
List current backlinks before issuing a cleanup command after external edits.

### Metadata
- Reproducible: no
- Related Files: src/config/external-links.json

### Resolution
- **Resolved**: 2026-10-13T00:00:00+08:00
- **Notes**: No cleanup was necessary; the desired state was already present.

---

## [ERR-20261013-003] product-links-render

**Logged**: 2026-10-13T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
ProductLinks crashed when a footer product ID referenced a site that was absent from the site registry.

### Error
```
TypeError: Cannot read properties of undefined (reading 'url')
```

### Context
- `products` contained `editimg` while `sites.editimg` was missing.
- The management script rejects this state, but the renderer previously assumed all references were valid.

### Suggested Fix
Keep references consistent through the manager and make rendering resilient to malformed manual configuration.

### Metadata
- Reproducible: yes
- Related Files: src/config/external-links.json, src/components/ProductLinks.astro

### Resolution
- **Resolved**: 2026-10-13T00:00:00+08:00
- **Notes**: Restored EditImg, skipped missing references defensively, and changed manager writes to atomic replacement.

---

## [ERR-20261013-002] pnpm-frozen-install

**Logged**: 2026-10-13T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The globally installed pnpm 10 could not consume the repository's version 6 lockfile in frozen mode.

### Error
```
ERR_PNPM_LOCKFILE_BREAKING_CHANGE
```

### Context
- Command: `pnpm install --frozen-lockfile`
- Installed pnpm: 10.29.3
- Lockfile version: 6.0

### Suggested Fix
Use pnpm 8 through Corepack rather than forcing a lockfile rewrite.

### Metadata
- Reproducible: yes
- Related Files: pnpm-lock.yaml

### Resolution
- **Resolved**: 2026-10-13T00:00:00+08:00
- **Notes**: `corepack pnpm@8.15.9 install --frozen-lockfile` completed without changing the lockfile.

---
