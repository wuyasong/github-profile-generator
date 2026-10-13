---
name: add-site-backlink
description: Manage promotional and footer backlinks in the github-profile-generator project. Use when adding, removing, listing, or changing the featured external site; this skill only edits the project's fixed external-links configuration and never locates insertion points through an existing domain.
---

# Add Site Backlink

Manage external sites through the fixed project contract:

- Data: `src/config/external-links.json`
- Banner renderer: `src/components/PromotionBanner.astro`
- Footer renderer: `src/components/ProductLinks.astro`
- Manager: `.agents/skills/add-site-backlink/scripts/manage-backlinks.mjs`

Do not search for an existing domain to decide where links belong. Do not insert links directly into `Layout.astro`. If the fixed configuration or either renderer is missing, stop and report that the project contract is broken instead of guessing another location.

## Workflow

Run commands from the repository root. Preserve the user's requested placement; when placement is unspecified for a new site, use `both`, which replaces the current banner promotion and appends the site to the footer.

```bash
node .agents/skills/add-site-backlink/scripts/manage-backlinks.mjs add \
  --url https://example.com \
  --name "Example" \
  --text "Example — Free AI Image Tool" \
  --placement both
```

Supported placements are `both`, `banner`, and `footer`. Banner placement requires intentional promotional text. The manager normalizes URLs, prevents duplicate site URLs, validates references, and writes only the fixed JSON file.

Other operations:

```bash
node .agents/skills/add-site-backlink/scripts/manage-backlinks.mjs list
node .agents/skills/add-site-backlink/scripts/manage-backlinks.mjs remove --id example
node .agents/skills/add-site-backlink/scripts/manage-backlinks.mjs set-promotion --id example --text "Example — Free AI Image Tool"
node .agents/skills/add-site-backlink/scripts/manage-backlinks.mjs clear-promotion
```

After a mutation, run `npm run build` and report the resulting promotion and footer entries. Do not commit or deploy unless the user separately requests it.
