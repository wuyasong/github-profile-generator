# Learnings

## [LRN-20261013-001] correction

**Logged**: 2026-10-13T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: config

### Summary
Project automation must use a stable configuration contract instead of locating edit points through an existing external URL.

### Details
The initial backlink-skill proposal used `https://mixinflow.com` as a discovery anchor. That would fail after the site was removed and incorrectly coupled placement logic to mutable content.

### Suggested Action
Keep backlink placement fixed in components and make automation operate only on `src/config/external-links.json`.

### Metadata
- Source: user_feedback
- Related Files: src/config/external-links.json, src/components/PromotionBanner.astro, src/components/ProductLinks.astro
- Tags: automation, backlinks, stable-contract

### Resolution
- **Resolved**: 2026-10-13T00:00:00+08:00
- **Notes**: Added fixed renderers and a configuration-only management script.

---

## [LRN-20261013-002] correction

**Logged**: 2026-10-13T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: config

### Summary
Do not restore a missing external site merely because a stale footer reference still names it.

### Details
The user had intentionally deleted EditImg. Restoring it while repairing a render error overrode that intent; the stale reference should instead have been removed or clarified.

### Suggested Action
Treat explicit site deletion as authoritative and use the backlink manager to clean every reference to that site.

### Metadata
- Source: user_feedback
- Related Files: src/config/external-links.json, src/components/ProductLinks.astro
- Tags: backlinks, deletion, user-intent
- See Also: LRN-20261013-001

### Resolution
- **Resolved**: 2026-10-13T00:00:00+08:00
- **Notes**: EditImg is absent from both the site registry and footer products.

---
