# Sprint 2: Projects & Data Foundation

> **Task tracking:** See [TASKS.md](./TASKS.md) for detailed milestone tasks

---

## Goals

1. **Projects Feature** - Users can create projects and associate packages with them
2. **GDPR Strategy** - Establish patterns for handling user-generated data
3. **Component Library** - Extract reusable components and clean up variant patterns

---

## Milestones

| # | Milestone | Goal |
|---|-----------|------|
| 7 | Projects Feature | Users can create projects and associate packages |
| 8 | GDPR & Data Strategy | Patterns for user data handling |
| 9 | Component Library | Extract Table, Pagination; audit variants |

---

## Decisions

| Question | Decision |
|----------|----------|
| Project visibility | **Always public** - collaborative learning platform |
| Package in multiple projects? | **Yes** - many-to-many, but only once per project |
| User deletion cascade | **Anonymize** - keep platform contributions (tags, metadata), erase/anonymize user identity |
| Cookie consent banner? | **No** - only cookie is refresh token (functional, not tracking) |

---

## Notes

_Implementation notes and decisions go here as we work._
