# Business

> Business planning and goals. See [VISION.md](./VISION.md) for product vision.

---

## Explaining It

**One-liner:**
"Yelp for developer tools - helps programmers find and compare the building blocks they use to make software."

**30-second version:**
"Developers build software using thousands of pre-made components - like Lego pieces. But there's no good way to know which pieces are reliable, which work well together, or what other developers actually use. TechGarden organizes all of this and lets the community rate and curate it."

**"Why would anyone use this?"**
"Same reason people use comparison sites instead of visiting ten different shops. The information exists, this just saves you the legwork."

**"How do you make money?"**
"It doesn't make money yet, and it doesn't cost anything to run either. Right now I'm focused on making it useful. If enough developers use it, there are obvious ways to monetize later - but that's not the priority."

---

## Product

### Technical

TechGarden is a platform for engineers to share technology decisions with grounded, linked data.

**Foundation layer** (community-curated):
- Packages from npm, jsr, nuget, dockerhub, homebrew, archlinux
- Ecosystems (React, AWS, Kubernetes) - product identities containing related packages
- Future: Standards (OpenAPI, GraphQL), Regulations (GDPR, SOC2, HIPAA)

**Value layer** (user-generated, links to foundation):
- Projects - your stack linked to packages/ecosystems
- Comparisons - concrete package references instead of abstract discussions
- Future: Decision records, discussions

### Summary

A curated database of software packages and technologies, with tools for developers to document what they use and why. Community helps organize the data. Users create content that links back to verified information.

Technology discussions are often abstract. Linking to real entities makes them concrete.

---

## Market

**Similar products:**
- Libraries.io - package discovery and dependencies
- StackShare - team stacks and comparisons
- Openbase - package reviews

**Difference:**
Broader foundation (ecosystems, standards, regulations - not just packages) with community curation. Value layer builds on this.

**Uncertainty:**
Still exploring which features provide the most value. Foundation is solid - question is which value-layer features matter most.

---

## Strategy

**Growth:**
- Organic through content, SEO, word-of-mouth
- Side project alongside full-time work
- Focus on artifacts worth sharing

**Monetization:**
- Free for developers
- B2B options as platform grows:
  - Data licensing for technology insights
  - Private instances for company-internal use
- Staying flexible until value becomes clear

**Milestones:**
- Foundation layer with curation tools ✓
- Find which value-layer features resonate (current)
- Grow to where B2B interest emerges

---

## Finance

### Technical

Self-hosted infrastructure:
- 3x mini PCs (64GB RAM, 4TB NVMe) running Kubernetes at home
- Costs: electricity, R2 backup (~$0), GitHub org, Claude, domains
- No cloud dependency

### Summary

Infrastructure paid for. Monthly costs minimal. No investors, no burn rate.

Bootstrapped and sustainable at current scale.

---

## Team

**Current:**
- Solo founder (developer), building alongside employment

**Available:**
- UX help (not involved yet)

**Looking for:**
- Feedback on the product
- Early users
- People to exchange ideas with

**Approach:**
- Passion project
- Open source mindset
- Building in public

---

## Risks

**What could go wrong:**
- Building features nobody uses - mitigated by staying flexible
- Not enough users for network effects - mitigated by solo-first design
- Well-funded competition - mitigated by no burn rate and niche focus

**If it doesn't work out:**
- Solid portfolio project
- Reusable code and patterns
- Experience gained

**If it works:**
- Platform with B2B revenue
- Useful resource for developers

---

## Current Focus

**Product:** Building value-layer features. The foundation (packages, ecosystems, curation) is functional. Now exploring what creates enough value to attract first users.

Candidates: comparisons, decision records, richer project features.

**Network:** Getting out there. Finding sparring partners or mutually beneficial relationships with others building things. Learning from people ahead, helping people behind.
