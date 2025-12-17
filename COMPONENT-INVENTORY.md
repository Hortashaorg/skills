# Component Inventory - Package Request Flow

**Purpose:** Plan all UI components needed before implementation to avoid vibe coding.

## Summary

**What we have:**
- ✅ All primitives (Flex, Stack, Text, Heading, Container)
- ✅ Core UI components (Button, TextField, Badge, Card, Label)

**What we need to build:**
- 🔨 Toast notification system (or add library)
- 🔨 SearchInput composite (wraps TextField with icon)
- 🔨 RegistryBadge (extends Badge)
- 🔨 PackageCard (feature component)
- 🔨 RequestPackageButton (feature component)
- 🔨 RequestStatusBadge (feature component)
- 🔨 PackageNotFoundCard (feature component)
- 🔨 EmptyState (feature component)

**Directory structure to create:**
```
components/
├── primitives/      ✅ exists
├── ui/             ✅ exists
├── composite/      🔨 create this
└── feature/        🔨 create this
```

---

## Component Architecture Review

From `CLAUDE.md`:
- **`primitives/`** - Layout & base elements (Flex, Grid, Stack, Text)
- **`ui/`** - Interactive components (Button, Input, Badge) - built with Kobalte + Tailwind
- **`composite/`** - Convenient wrappers (IconButton, SearchInput)
- **`feature/`** - Domain-specific (PackageCard, RequestStatus)

---

## Components Needed for MVP

### 1. Search Input

**What:** Input field for searching packages by name

**Component Type:** `composite/search-input/` (or use existing if we have one)

**Functionality:**
- Text input with search icon
- Debounce (300ms)
- Clear button when has value
- Loading indicator while searching

**Props:**
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  onClear?: () => void;
}
```

**Questions:**
- Do we already have a SearchInput component?
- Should it be a composite or feature component?

---

### 2. Package Card

**What:** Display package information in search results

**Component Type:** `feature/package-card/`

**Functionality:**
- Shows package name (large, bold)
- Shows description (truncated to 2 lines)
- Shows registry badge (npm/jsr/brew/apt)
- Clickable (links to package detail - future)
- Optional action slot (for request button)

**Props:**
```typescript
interface PackageCardProps {
  package: {
    id: string;
    name: string;
    description: string | null;
    registry: "npm" | "jsr" | "brew" | "apt";
  };
  action?: React.ReactNode; // Slot for RequestButton
  onClick?: () => void;
}
```

**Layout:**
```
┌──────────────────────────────┐
│ express              [npm]   │
│ Fast, unopinionated web...   │
│                       [Btn]  │
└──────────────────────────────┘
```

---

### 3. Registry Badge

**What:** Small colored badge showing package registry

**Component Type:** `ui/badge/` (extend existing Badge component)

**Functionality:**
- Color-coded by registry
  - npm: red
  - jsr: yellow
  - brew: orange
  - apt: blue
- Small size
- Uppercase text

**Props:**
```typescript
interface RegistryBadgeProps {
  registry: "npm" | "jsr" | "brew" | "apt";
}
```

**Questions:**
- Do we have a Badge component already?
- Should this be a variant or separate component?

---

### 4. Request Package Button

**What:** Button to request a package be added

**Component Type:** `feature/package-request/request-button.tsx`

**Functionality:**
- Shows "Request Package" text
- Loading state while mutating
- Disabled state after success
- Shows toast on success/error

**Props:**
```typescript
interface RequestPackageButtonProps {
  packageName: string;
  registry: "npm" | "jsr" | "brew" | "apt";
  onSuccess?: (requestId: string) => void;
  variant?: "default" | "outline";
}
```

**States:**
- Idle: "Request Package"
- Loading: "Requesting..." (spinner)
- Success: "Requested!" (checkmark, disabled)
- Error: "Try Again"

---

### 5. Request Status Badge

**What:** Badge showing current status of a package request

**Component Type:** `feature/package-request/status-badge.tsx`

**Functionality:**
- Queries request by ID
- Updates in real-time (Zero sync)
- Color-coded by status
- Animated pulse on "fetching"
- Tooltip with error message on failed

**Props:**
```typescript
interface RequestStatusBadgeProps {
  requestId: string;
  showLabel?: boolean; // Show text or just icon
}
```

**Status Colors:**
- pending: blue "Queued"
- fetching: yellow "Fetching..." (animated)
- completed: green "Ready!"
- failed: red "Failed"
- discarded: gray "Discarded"

---

### 6. Empty State (No Search Results)

**What:** Message shown when search returns no results

**Component Type:** `feature/package-search/empty-state.tsx`

**Functionality:**
- Shows icon (magnifying glass with X)
- Shows message: "No packages found"
- Shows subtext: "Try requesting it below"

**Props:**
```typescript
interface EmptyStateProps {
  searchQuery: string;
}
```

**Layout:**
```
     🔍❌
No packages found for "lodash"
Try requesting it below
```

---

### 7. Package Not Found Card

**What:** Special card shown when package doesn't exist in our DB

**Component Type:** `feature/package-search/not-found-card.tsx`

**Functionality:**
- Shows package name that was searched
- Shows RequestPackageButton
- Explains what will happen
- Optional: shows RequestStatusBadge if already requested

**Props:**
```typescript
interface PackageNotFoundCardProps {
  packageName: string;
  registry: "npm" | "jsr" | "brew" | "apt";
  existingRequestId?: string; // If already requested
}
```

**Layout:**
```
┌──────────────────────────────────────┐
│ "lodash" not found in our database   │
│                                      │
│ Request it and we'll fetch it from   │
│ npm registry.                        │
│                                      │
│          [Request Package]           │
└──────────────────────────────────────┘
```

---

### 8. Toast Notification

**What:** Temporary notification for success/error feedback

**Component Type:** `ui/toast/` (check if exists, or use library)

**Functionality:**
- Appears at bottom-right
- Auto-dismisses after 3 seconds
- Variants: success, error, info
- Swipe to dismiss

**Usage:**
```typescript
toast.success("Package requested!");
toast.error("Failed to request package");
```

**Questions:**
- Do we have a toast system already?
- Should we use a library (sonner, react-hot-toast)?

---

## Existing Components (Audit Complete ✅)

**Primitives:** ✅ All Available
- [x] Flex - layout primitive
- [x] Stack - vertical/horizontal stack
- [x] Text - typography primitive
- [x] Heading - heading typography
- [x] Container - page container

**UI Components:** ✅ Core Components Available
- [x] Button - interactive button with variants
- [x] TextField - text input field (Kobalte-based)
- [x] Badge - colored badge/chip
- [x] Label - form label
- [x] Card - content card
- [ ] Toast - **MISSING** (need to add or use library)
- [ ] Spinner - **UNKNOWN** (need to check)

**Composite:** ❌ Directory doesn't exist yet
- [ ] SearchInput - need to build
- [ ] IconButton - need to check if exists

**Feature:** ❌ Directory doesn't exist yet
- [ ] None (this will be our first feature!)

---

## Component Building Order

**Recommendation:** Build in dependency order (bottom-up)

1. **Check/Build Primitives** (if missing)
   - Text, Flex, Stack

2. **Check/Build UI Components** (if missing)
   - Badge (for registry + status)
   - Button (base for RequestButton)
   - Input (base for SearchInput)
   - Toast (notification system)

3. **Build Composite** (if needed)
   - SearchInput (wraps Input with search icon)

4. **Build Feature Components**
   - RegistryBadge (extends Badge)
   - RequestStatusBadge (feature badge)
   - PackageCard (displays package info)
   - RequestPackageButton (feature button)
   - PackageNotFoundCard (combines multiple)
   - EmptyState (simple message)

5. **Build Page**
   - Search page (composes all feature components)

---

## Next Step: Component Audit

Before implementing Task 3, we should:

1. **Audit existing components** - Check what's already in `components/`
2. **Identify gaps** - What needs to be built vs. what exists
3. **Plan reusability** - Can we extend existing vs. create new?
4. **Choose libraries** - Toast system, icons, etc.

**Action:** Explore `services/frontend/src/components/` and document what exists.
