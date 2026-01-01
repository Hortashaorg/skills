# Sprint 2: Projects & Data Foundation

> **Task tracking:** See [TASKS.md](./TASKS.md) for detailed milestone tasks

---

## Goals

1. ✅ **Schema Simplification** - Reduce sync payload by replacing versions with release channels
2. **Projects Feature** - Users can create projects and associate packages with them
3. **Route Restructure** - Public browsing pages, user profile, proper landing page
4. **GDPR Strategy** - Establish patterns for handling user-generated data
5. **Component Library** - Extract reusable components and clean up variant patterns

---

## Milestones

| # | Milestone | Status |
|---|-----------|--------|
| 7 | Schema Simplification | ✅ Complete |
| 8 | Projects Feature | 🔄 In Progress |
| 8b | Route Restructure | Pending |
| 9 | GDPR & Data Strategy | Pending |
| 10 | Component Library | Pending |

---

## Decisions

| Question | Decision |
|----------|----------|
| Project visibility | **Always public** - collaborative learning platform |
| Package in multiple projects? | **Yes** - many-to-many, but only once per project |
| User deletion cascade | **Anonymize** - keep platform contributions (tags, metadata), erase/anonymize user identity |
| Cookie consent banner? | **No** - only cookie is refresh token (functional, not tracking) |
| Profile URL pattern | **`/me`** - simple, no usernames needed yet |
| User projects URL | **`/me/projects`** - keeps user content under `/me` namespace |
| Browse packages URL | **`/packages`** - replaces current search as main entry point |

---

## Notes

### Schema Simplification (Milestone 7)
Completed. Reduced sync payload ~95% by storing release channels instead of all versions. Also simplified admin dashboard - removed complex paginated tables in favor of simple top-25 lists with stats endpoint for counts.

### Component Library (Milestone 10) - Scope Revision
Original plan was to extract Table and Pagination components from admin pages. After simplification:
- **Table component**: Still useful for simple tables (pending fetches, etc.)
- **Pagination**: Less urgent - admin uses simple slicing now, search results could benefit but not critical
- **Focus instead on**: CVA variant audit, ensuring consistent patterns across existing components
