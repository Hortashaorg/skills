# Sprint 6: Polish, SEO & Identity

> **Goal:** Establish visual identity with brand color, improve discoverability, and complete auth cleanup.

---

## Brand Color & Visual Identity

Establish "TechGarden" identity through intentional color usage.

- [ ] Define brand green (garden-themed accent color)
- [ ] Apply to navbar: "Tech**Garden**" with green emphasis
- [ ] Use for key emphasis text, CTAs, success states
- [ ] Dark mode: ensure brand green has good contrast
- [ ] Favicon: simple green-themed icon

---

## SEO & Discoverability

Make the site discoverable from search engines.

- [ ] Audit current SEO state (meta tags, titles, descriptions)
- [ ] Package pages: meaningful titles, descriptions from package metadata
- [ ] Consider: sitemap generation
- [ ] Consider: structured data (JSON-LD for packages)

---

## Homepage & Onboarding

Make the homepage more compelling - guide users to explore and contribute.

- [ ] Highlight curation/contribution system ("Help improve package data")
- [ ] Show gamification aspect (leaderboard preview? contribution stats?)
- [ ] Clearer value prop for creating an account
- [ ] Better entry points to explore (popular packages, recent activity)

---

## Polish & UX

- [ ] Empty state improvements (packages, projects, notifications)
- [ ] HoverDropdown keyboard navigation
- [ ] Dark mode contrast audit (WCAG AA for text)

---

## Auth Cleanup

Complete the OAuth migration.

- [ ] Remove email from accounts table (after all users have zitadelId populated)
- [ ] Zitadel user sync job: anonymize accounts when IdP account deleted
- [ ] Zitadel user sync job: assign roles to new accounts for self-service deletion

---

## GDPR & Data Privacy

- [ ] Data export: individual records, not aggregates (account, projects, suggestions, votes)
- [ ] Review cookie usage (auth cookies = strictly necessary, no consent banner needed)
- [ ] Edge case: users who delete IdP account before app account (handled by sync job)

---

## Backlog (Future)

See [BACKLOG.md](./BACKLOG.md) for full list.

