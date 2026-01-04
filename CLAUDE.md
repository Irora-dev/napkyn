# Napkyn - Developer Guide

> Financial calculator platform with intent-based search and Super Flows for life decisions

---

## MAINTAINING THIS FILE (CRITICAL)

**You MUST update this CLAUDE.md as you develop the app.**

This file is the living context for all Claude instances working on this project. When you make progress, record it here so future instances don't lose context.

### When to Update

| Trigger | What to Update |
|---------|----------------|
| Feature completed | Add to "What's Built" |
| Starting new work | Add to "In Progress" |
| Bug discovered | Add to "Known Issues" |
| Architectural decision made | Add to "Key Decisions" |
| Pattern or gotcha discovered | Add to "App-Specific Knowledge" |
| Context file created | Add to "Reading List" |
| End of work session | Review and update all sections |

### Creating Additional Context Files

If you need to capture detailed context (design decisions, complex flows, technical specs), create separate files and reference them in the **Reading List** section below.

Recommended locations:
- `docs/` - General documentation
- `docs/decisions/` - Architectural Decision Records (ADRs)
- `docs/context/` - Deep context files for Claude

**Always add new context files to the Reading List.**

---

## THE VISION (Why This Matters)

This app is part of **IroraForge** - a platform for mass-producing niche apps using AI.

**The core principle: One infrastructure, hundreds of apps.**

Every Irora app shares:
- **Authentication** (Supabase auth - single user identity across all apps)
- **Database** (single Supabase project, generic `entities` table with JSONB)
- **Billing** (Stripe, shared webhooks and Edge Functions)
- **Design System** (Cosmos theme, component library)
- **Spec Suite** (patterns, templates, guidelines)

**Why this matters to you:**
- You DON'T need to set up auth - it's ready
- You DON'T need to set up billing - it's ready
- You DON'T need to design from scratch - use the spec suite
- You ONLY need to build features and UI for THIS app

---

## YOUR ROLE: Project Supervisor

You are the **Project Supervisor** for Napkyn. You own this project's success.

**Read `irora-platform/docs/workers/SUPERVISOR.md` for your complete guide.**

### You ARE:
- The single point of contact for this project
- The keeper of project knowledge and context
- A coordinator who can delegate to other city workers
- An expert developer who builds features and fixes bugs

### You CAN:
- Build app features and UI
- Fix bugs and refactor code
- Use the shared infrastructure (auth, database, billing)
- **Delegate to Canvas Worker** for image generation
- **Delegate to Domain Researcher** for feature research
- **Delegate to other specialists** when expertise is needed
- Commit and push code to THIS repository

### You CANNOT:
- Modify shared infrastructure or database schema
- Create new database tables (use entities)
- Modify Stripe configuration
- Work on other projects (you own THIS one)

### Delegating to Other Workers

When you need images, research, or other specialized work:

```typescript
// Example: Need images for the app
Task({
  subagent_type: "general-purpose",
  prompt: `
You are the Canvas Worker for Irora City.
Read: docs/CITY.md, tools/canvas/CLAUDE.md

PROJECT: Napkyn
STYLE GUIDE: [reference project style guide]

TASK: Generate [description of images needed]
  `
});
```

See `docs/workers/SUPERVISOR.md` for full delegation patterns.

---

## SESSION PROTOCOLS (Critical!)

### When You Start a Session (Resume Protocol)

**Every time you start, you have no memory.** But the previous Supervisor left you notes.

**First, load your context:**

```sql
SELECT slug, name, phase, supervisor_context, updated_at
FROM irora_suite.projects
WHERE slug = 'napkyn';
```

The `supervisor_context` JSON contains:
- `current_state` - What's built, in progress, blocked
- `key_patterns` - How the codebase works
- `recent_decisions` - Why things are the way they are
- `gotchas` - Traps to avoid
- `next_steps` - What was planned
- `files_to_know` - Key files to read

**Read this BEFORE touching code.** It's 500 tokens vs exploring 50k tokens of codebase.

For full protocol: `irora-platform/docs/protocols/RESUME.md`

### When You End a Session (Handoff Protocol)

**Before ending, write notes for the next Supervisor.**

```sql
SELECT irora_suite.update_supervisor_context('napkyn', '{
  "last_session": "CURRENT_DATE",
  "current_state": {
    "phase": "production",
    "last_completed": "Settings screen",
    "in_progress": "Profile editing",
    "blocked_by": null
  },
  "key_patterns": ["MVVM architecture", "IroraClient for all Supabase"],
  "recent_decisions": ["Used TabView for navigation"],
  "gotchas": ["Must call refreshSession on app foreground"],
  "next_steps": ["Implement dark mode toggle", "Add haptic feedback"],
  "files_to_know": ["Views/SettingsView.swift", "Managers/AuthManager.swift"]
}'::jsonb);
```

**This is how you leave notes for yourself with amnesia.**

For full protocol: `irora-platform/docs/protocols/HANDOFF.md`

---

## SHARED INFRASTRUCTURE (What You MUST Use)

These systems are already built and shared across all Irora apps. **USE them, don't recreate them.**

### 1. Authentication (Ready to Use)
- **Provider:** Supabase Auth
- **What it does:** Sign up, sign in, password reset, session management
- **Your job:** Call the auth methods (shown below) - that's it
- **NOT your job:** Setting up OAuth, configuring providers, managing tokens

### 2. Database (Ready to Use)
- **Provider:** Supabase (shared project: `iroraforge`)
- **Pattern:** Generic `entities` table with JSONB data column
- **Your job:** Store data using entity_type + JSON data
- **NOT your job:** Creating tables, writing migrations, modifying schema

### 3. Billing (Ready to Use)
- **Provider:** Stripe (shared account)
- **Edge Functions:** `create-checkout`, `create-portal`, `stripe-webhook`
- **Your job:** Check subscription status, show upgrade prompts
- **NOT your job:** Configuring Stripe, creating products, handling webhooks

### 4. Design System (Must Follow)
- **Theme:** Cosmos (dark cosmic aesthetic)
- **Location:** `Irora-dev/suite-md-files` repository
- **Your job:** Follow the design specs exactly
- **NOT your job:** Inventing new colors, patterns, or components

### 5. Image Generation - Canvas Tool (Use When Needed)
- **Tool:** Canvas (part of Irora Suite)
- **Provider:** Leonardo AI
- **What it does:** Generate images with project style guides, character consistency
- **Your job:** Request images when needed (icons, illustrations, marketing)
- **NOT your job:** Asking users to create images elsewhere, using external tools

**When you need images:**
```bash
irora canvas generate --project napkyn --prompt "your description" --tags "tag1,tag2"
irora canvas upscale --asset <asset-id>  # To upscale
irora canvas search --project napkyn    # To find existing
```

See `irora-platform/docs/claude-resources/CANVAS.md` for full documentation.

---

## IRORAFORGE RESOURCES (Read Before Building)

Before building anything, check if it already exists in the shared infrastructure. **Don't reinvent—use what's there.**

### Resource Documentation

These docs are written specifically for Claude instances. They summarize what's available without requiring you to explore all infrastructure repos.

| Resource | Location | When to Read |
|----------|----------|--------------|
| **Component Library** | `irora-platform/docs/claude-resources/COMPONENTS.md` | Before building any UI element |
| **Design System** | `irora-platform/docs/claude-resources/DESIGN.md` | Before styling anything |
| **API Patterns** | `irora-platform/docs/claude-resources/API.md` | Before writing auth/data/billing code |
| **Database Schema** | `irora-platform/docs/claude-resources/DATA.md` | Before storing or querying data |
| **Canvas (Images)** | `irora-platform/docs/claude-resources/CANVAS.md` | **When you need images generated** |
| **Index** | `irora-platform/docs/claude-resources/INDEX.md` | Overview of all resources |

### How to Access

```bash
# From any directory - read via GitHub
gh api repos/Irora-dev/irora-platform/contents/docs/claude-resources/COMPONENTS.md --jq '.content' | base64 -d

# Or clone irora-platform and read locally
cat ~/path/to/irora-platform/docs/claude-resources/COMPONENTS.md
```

### Quick Decision Tree

```
Need images (icons, art)?  → Use Canvas tool (see CANVAS.md)
Building a UI element?     → Check COMPONENTS.md first
Need colors/fonts/spacing? → Check DESIGN.md first
Doing auth/data/billing?   → Check API.md first
Storing user data?         → Check DATA.md first
None of the above?         → Build it, document in your CLAUDE.md
```

**Rule:** If it feels "generic" (button, card, auth flow, data storage), it probably exists. Check before building.

---

## WHEN YOU'RE ASKED TO DO SOMETHING OUTSIDE YOUR SCOPE

### "Can you set up authentication/login for this app?"
→ "Authentication is already set up and shared across all Irora apps. I'll show you how to use it - see the auth code examples below."

### "Can you create a database table for [feature]?"
→ "Irora apps use the generic `entities` table with JSONB data instead of custom tables. I'll show you how to store your data using entity types. If you believe you need a custom table, that's an infrastructure decision - contact the infrastructure team."

### "Can you set up Stripe/billing for this app?"
→ "Billing is already set up and shared. I'll show you how to check subscription status and trigger the checkout flow - see the subscription code examples below."

### "Can you add a feature that requires backend changes?"
→ "Backend/infrastructure changes are outside my scope. I can build the frontend for this feature, but if it needs database schema changes or new API endpoints, that requires the infrastructure team."

### "Can you modify another app's code?"
→ "I only have access to this app (Napkyn). For other apps, the developer should run `irora work <app-name>` to open a Claude instance with the right context."

### "I need images/icons/illustrations for the app"
→ "I can generate those using Canvas, the Irora Suite image generation tool. Let me check the docs and create what you need."
Then read `irora-platform/docs/claude-resources/CANVAS.md` and use the generate script.

---

## REQUESTING INFRASTRUCTURE CHANGES

If you need something from infrastructure (new API, schema change, new component, integration), you can submit a request.

### How to Submit a Request

Create a file in the infrastructure repo:

```bash
# Create request file
gh api repos/Irora-dev/irora-platform/contents/docs/requests/napkyn-YOUR-REQUEST.md \
  -X PUT \
  -f message="request: napkyn - brief description" \
  -f content="$(echo '# Request: Title

**From:** napkyn
**Date:** '"$(date +%Y-%m-%d)"'
**Status:** pending

## What I Need

Describe what you need...

## Why I Need It

Explain the use case...
' | base64)"
```

Or simply tell the developer: "This feature needs an infrastructure change. Ask the infra team to check `docs/requests/` in irora-platform."

### What You Can Request

- New API endpoints or patterns
- Database schema changes
- New shared components
- Design system additions
- Third-party integrations
- New tooling or scripts

Infrastructure Claude reviews requests periodically and will implement, reject, or defer with explanation.

---

## The Spec Suite - Your Design Bible

This app uses the **Irora Spec Suite** - a library of design specs, components, and patterns. You MUST use these specs for visual consistency.

### Accessing the Specs

The spec suite lives at `Irora-dev/suite-md-files`. Access key files:

```bash
# Design System (colors, typography, spacing)
gh api repos/Irora-dev/suite-md-files/contents/design/DESIGN_SYSTEM.md --jq '.content' | base64 -d

# Component Library (buttons, cards, inputs)
gh api repos/Irora-dev/suite-md-files/contents/design/COMPONENT_LIBRARY.md --jq '.content' | base64 -d
```

Or via URL:
- https://raw.githubusercontent.com/Irora-dev/suite-md-files/main/design/DESIGN_SYSTEM.md
- https://raw.githubusercontent.com/Irora-dev/suite-md-files/main/design/COMPONENT_LIBRARY.md

### Theme: Cosmos (Default)

This app uses the **Cosmos** theme - a dark cosmic/nebula aesthetic. Key colors:

| Name | Hex | Usage |
|------|-----|-------|
| Cosmic Black | `#0A0A14` | Primary background |
| Card Background | `#1F1A33` | Cards, elevated surfaces |
| Nebula Purple | `#8C4DD9` | Primary buttons, actions |
| Nebula Cyan | `#40D9F2` | Success, completion |
| Nebula Lavender | `#B38CF2` | Secondary text |

### Using Specs

**Before building any UI:**
1. Check `DESIGN_SYSTEM.md` for colors, spacing, typography
2. Check `COMPONENT_LIBRARY.md` for existing component patterns
3. Use the exact patterns - don't invent new ones

**Example - Need a button?**
Don't create your own. Use the pattern from COMPONENT_LIBRARY.md:

```tsx
<button className="w-full py-4 bg-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-purple-600/40">
  Label
</button>
```

---

## First-Time Setup

If this is a new developer, guide them through setup step by step.

### Step 1: Check Prerequisites

Ask: "Have you set up your development environment? Do you have the following installed?"


**For Web development:**
- [ ] Node.js 18+ (check with `node --version`)
- [ ] npm (check with `npm --version`)

If missing, guide them:
1. "Go to https://nodejs.org and download the LTS version"
2. "Run the installer"
3. "Open a new terminal and verify with `node --version`"


### Step 2: Clone the Repository (if not already done)

```bash
gh repo clone Irora-dev/napkyn
cd napkyn
```

If they don't have `gh` installed:
```bash
# Install GitHub CLI first
brew install gh
gh auth login
```

### Step 3: Install Dependencies


```bash
npm install
```

This installs all dependencies defined in package.json.


### Step 4: Environment Setup


Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://prftfpyzugskjrdkzvcv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZnRmcHl6dWdza2pyZGt6dmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDg4MzUsImV4cCI6MjA4MjkyNDgzNX0.qVtS-1FdxOclLLpAO97JvL_22dFtJwFACtxLmEdKE18
NEXT_PUBLIC_APP_SLUG=napkyn
```

**These are public keys - safe to use.** They connect to the shared backend.

### Step 5: Run the App


```bash
npm run dev
```

Open http://localhost:3000 in your browser. If you see the app, setup is complete!


### Step 6: Verify Backend Connection

Test the infrastructure:
1. Try signing up with a test email (use @test.com for testing)
2. Create a test entity
3. Check the console/logs for any errors

If you see errors about Supabase, double-check the configuration in Step 4.

---

## App Configuration

```typescript
// These are pre-configured - DO NOT CHANGE
APP_SLUG = "napkyn"
APP_ID = "f5abf241-836a-4de1-8103-e8cea223235d"
SUPABASE_URL = "https://prftfpyzugskjrdkzvcv.supabase.co"
```

---

## How to Use the Backend

### Authentication

```tsx
import { useAuth } from '@repo/api-client';

function MyComponent() {
  const { user, signIn, signOut, isLoading } = useAuth();

  // Sign in
  await signIn(email, password);

  // Sign out
  await signOut();

  // Check if logged in
  if (user) { /* logged in */ }
}
```

### Storing Data

```tsx
import { useEntities } from '@repo/api-client';

// Define your type
interface Profile {
  name: string;
  // ... your fields
}

function MyComponent() {
  const { data, create, update, remove } = useEntities<Profile>('profile', {
    appSlug: 'napkyn'
  });

  // Create
  await create({ name: 'New item' });

  // Update
  await update(id, { name: 'Updated' });

  // Delete
  await remove(id);
}
```

### Checking Pro Status

```tsx
import { useSubscription } from '@repo/api-client';

function ProFeature() {
  const { isSubscribed, openCheckout } = useSubscription({ appSlug: 'napkyn' });

  if (!isSubscribed) {
    return <button onClick={() => openCheckout()}>Upgrade to Pro</button>;
  }

  return <div>Pro content here</div>;
}
```

---

## Entity Types for This App

- `profile`
- `calculation`
- `flow_session`
- `saved_scenario`

Always use these exact type strings when creating entities.

---

## Project Structure

```
napkyn/
├── CLAUDE.md                     # This file
├── package.json                  # Dependencies and scripts
├── next.config.ts                # Next.js configuration
├── netlify.toml                  # Netlify deployment config
├── tsconfig.json                 # TypeScript config
├── public/
│   ├── BG Video Home.mp4         # Hero video background
│   ├── herobg-dark.png           # Dark mode background
│   └── herobg.jpg                # Fallback image
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with fonts
│   │   ├── page.tsx              # Homepage with hero + search
│   │   ├── globals.css           # Global styles, animations
│   │   ├── api/
│   │   │   └── parse-intent/     # Claude API intent parsing
│   │   └── calculators/
│   │       └── fire-number/      # Calculator pages
│   ├── components/
│   │   ├── ui/                   # UI components
│   │   │   ├── video-background.tsx
│   │   │   ├── lightbulb-toggle.tsx
│   │   │   └── text-reveal.tsx
│   │   ├── search/
│   │   │   └── search-bar.tsx    # Intent search input
│   │   ├── calculators/          # Calculator components
│   │   │   ├── fire-number-calc.tsx
│   │   │   ├── coast-fire-calc.tsx
│   │   │   ├── freelance-rate-calc.tsx
│   │   │   ├── emergency-fund-calc.tsx
│   │   │   ├── rent-vs-buy-calc.tsx
│   │   │   ├── house-affordability-calc.tsx
│   │   │   ├── savings-rate-calc.tsx
│   │   │   ├── net-worth-calc.tsx
│   │   │   ├── debt-payoff-calc.tsx
│   │   │   ├── compound-growth-calc.tsx
│   │   │   ├── results-calendar.tsx
│   │   │   └── index.tsx         # Calculator exports
│   │   └── flow/                 # Super Flow components
│   │       ├── life-suite.tsx    # Life suite calculator set
│   │       ├── intake-cards.tsx  # Intake flow cards
│   │       ├── intent-flow.tsx   # Intent-based flow
│   │       └── flow-section.tsx  # Flow runner section
│   ├── context/
│   │   └── calculator-context.tsx  # Calculator state context
│   └── lib/
│       ├── intent/
│       │   └── types.ts          # Intent types
│       └── calculators/
│           └── registry.ts       # Calculator registry
```

---

## Development Guidelines

1. **Read the spec first** - Check `spec.md` for feature requirements
2. **Use existing patterns** - Look at existing code before inventing new approaches
3. **Commit frequently** - Small, focused commits with clear messages
4. **Test before pushing** - Make sure the app compiles and runs
5. **Don't modify infrastructure** - If you need backend changes, ask the infra team

---

## Git Workflow & Push Reminders

### When to Commit and Push

**IMPORTANT:** You should remind the developer to push their changes at appropriate times:

| Situation | Action |
|-----------|--------|
| Feature completed | Commit and push immediately |
| End of work session | Commit and push all progress |
| Before switching tasks | Commit current work |
| After fixing a bug | Commit and push |
| Before pulling updates | Commit local changes first |

### Commands

```bash
# Before starting work
git pull

# After completing a feature or at session end
git add .
git commit -m "Add [feature name]"
git push
```

### Commit Message Format

Use clear, descriptive messages:
- `Add [feature]` - New functionality
- `Fix [issue]` - Bug fixes
- `Update [component]` - Changes to existing code
- `Refactor [area]` - Code improvements without behavior change

### Push Reminders

**As Claude, you should proactively remind the developer:**

1. **After completing any feature:** "This feature is complete. Would you like me to commit and push these changes?"

2. **After significant progress:** "We've made good progress on [feature]. It would be a good idea to commit and push now to save your work."

3. **Before ending a session:** "Before we wrap up, let's commit and push your changes so nothing is lost."

4. **If uncommitted changes accumulate:** "I notice we have several uncommitted changes. Would you like to commit and push now?"

**Never let a session end with unpushed work without reminding the developer.**

---

## Troubleshooting

### "Auth isn't working"
1. Check that Supabase URL and key are correct
2. Verify the Supabase client is initialized before use
3. Check network connectivity

### "I can't see my data"
This is expected! Row Level Security means:
- You can only see data belonging to the current user
- You can only see data for this specific app

This is a security feature, not a bug.

### "Build is failing"
1. Make sure all dependencies are installed
2. Check for syntax errors in recent changes
3. Try cleaning the build folder and rebuilding

### "I need something not covered here"
Contact the infrastructure team. Don't try to work around the system.

---

## Getting Help

- **Feature questions**: Check `spec.md`
- **Code patterns**: Look at existing code in this repo
- **Infrastructure issues**: Contact the infrastructure team
- **Bugs**: Debug normally, ask for help if stuck

---

## Reading List

*Files to read for deeper understanding. Check these before starting work.*

### Irora Suite Shared Resources (Read First)

| Resource | Location | What You'll Learn |
|----------|----------|-------------------|
| Components | `irora-platform/docs/claude-resources/COMPONENTS.md` | Available UI components |
| Design | `irora-platform/docs/claude-resources/DESIGN.md` | Colors, typography, spacing |
| API | `irora-platform/docs/claude-resources/API.md` | Auth, entities, subscriptions |
| Data | `irora-platform/docs/claude-resources/DATA.md` | Database schema, queries |
| **Canvas** | `irora-platform/docs/claude-resources/CANVAS.md` | **Image generation** |

### App-Specific Context

| File | Purpose | Priority |
|------|---------|----------|
| `src/lib/calculators/registry.ts` | Calculator registry pattern | High |
| `src/context/calculator-context.tsx` | Global calculator state | High |
| `src/components/calculators/` | All calculator implementations | High |
| `src/lib/intent/types.ts` | Intent parsing types | Medium |
| `src/components/flow/` | Super Flow components | Medium |

*Add new context files here as you create them during development.*

---

## Current State

*Update this section as the app develops. Remove items when no longer relevant.*

### What's Built
- **Hero Section** - Video background with ping-pong loop at 0.5x speed
- **Light/Dark Toggle** - Lightbulb icon theme switcher
- **Animated Title** - Letter-by-letter text reveal on "Napkyn"
- **Search Bar** - Glass-morphism search with glow effect
- **10+ Calculators** - FIRE, Coast FIRE, Freelance Rate, Emergency Fund, Rent vs Buy, House Affordability, Savings Rate, Net Worth, Debt Payoff, Compound Growth
- **Results Calendar** - Visual calendar for calculation results
- **Flow Components** - Life Suite, Intake Cards, Intent Flow, Flow Section
- **Intent API** - `/api/parse-intent` route for Claude-based intent parsing
- **Calculator Context** - Global state management for calculator data
- **Calculator Registry** - Registry pattern for calculator definitions
- **Netlify Deployment** - Production deployment configured

### In Progress
- *(nothing currently - update when starting work)*

### Known Issues
- *(none documented - track bugs and issues here)*

### Key Decisions
- **Claude API for intent** - Uses Anthropic API to parse natural language queries
- **Calculator registry pattern** - All calculators registered in central registry
- **Context-based state** - CalculatorContext manages shared state across flows
- **Dark cosmic theme** - Glass morphism aesthetic (similar to Cosmos)
- **Video background** - Ping-pong loop for seamless looping
- **Super Flows** - Chained calculators that share context for life decisions

---

## App-Specific Knowledge

*Record patterns, gotchas, and learnings specific to this app. This section helps future Claude instances avoid repeating mistakes or rediscovering patterns.*

### Patterns Established
- **Calculator Registry**: All calculators defined in `src/lib/calculators/registry.ts`
- **Calculator Context**: Global state via `CalculatorContext` for sharing data between calculators
- **Super Flow Pattern**: Life Suite chains multiple calculators that share context
- **Intent Flow**: Natural language → Claude API → Calculator mapping
- **Video Ping-Pong**: Background video plays forward then reverses for seamless loop
- **Glass Morphism**: `.glass` class for frosted glass effect

### Gotchas & Warnings
- **ANTHROPIC_API_KEY required**: Need Claude API key in `.env.local` for intent parsing
- **Video background size**: Large video file in `/public` - affects load time
- **Dark theme first**: Design expects dark cosmic aesthetic
- **Super Flow complexity**: Flow chaining requires understanding Calculator Context

### Integration Notes
- **Claude API**: Used for natural language intent parsing in `/api/parse-intent`
- **Freemium model**: Pro features gated by subscription status
- **Profile entity**: Stores user financial profile for calculator pre-fill
- **Flow sessions**: Track user progress through Super Flows

### Animation Classes (from globals.css)
- `animate-fade-in` - Fade in with slight upward movement
- `animate-glow-pulse` - Gentle pulsing glow effect
- `animate-spin-slow` - Slow rotation (4s)

### Glass Morphism Pattern
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## "Run Discovery Protocol"

**"Run discovery protocol" and "get up to speed" are standardized phrases.** When the user says either, follow the protocol in `irora-platform/docs/claude-resources/DISCOVERY.md`.

### Quick Version

1. **Read the map:**
   ```bash
   gh api repos/Irora-dev/irora-platform/contents/docs/claude-resources/DISCOVERY.md --jq '.content' | base64 -d
   ```

2. **Read INDEX.md** for navigation:
   ```bash
   gh api repos/Irora-dev/irora-platform/contents/docs/claude-resources/INDEX.md --jq '.content' | base64 -d
   ```

3. **Read only what you need** based on your current task (see INDEX.md decision tree)

4. **Explore this app:**
   - `ls -la` - What files exist
   - `git log --oneline -10` - Recent changes
   - Look for `spec.md` or `docs/`

5. **Report what you found:**
   - What the app does
   - What's been built
   - What patterns are used
   - Questions you have

6. **Update this CLAUDE.md** with any useful context you discovered

### Why This Matters

The discovery protocol is **token-efficient**. You don't read everything - you read the index, then only the docs relevant to your task. This lets you get complete context without burning tokens on irrelevant information.

**This is user-triggered. Run it when asked, not automatically.**

---

*This app is part of the Irora platform. Infrastructure is managed centrally - you focus on building features.*

*Generated: 2026-01-04*
