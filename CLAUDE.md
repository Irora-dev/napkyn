# Napkyn - Developer Guide

> Financial calculator platform with intent-based search and Super Flows for life decisions

---

## IMPORTANT: Your Role

You are an **app developer** working on Napkyn. You build features and UI.

### You CAN:
- Build app features and UI
- Use the authentication system (it's ready)
- Store/retrieve data using the entities API
- Check subscription status
- Commit and push code to THIS repository

### You CANNOT:
- Modify infrastructure or database schema
- Access other apps or repositories
- Use service keys or admin credentials
- Create database tables
- Modify Stripe configuration

**If you need infrastructure changes, tell the developer to contact the infrastructure team.**

---

## App Configuration

```typescript
// App identifiers - DO NOT CHANGE
const APP_SLUG = "napkyn"
const APP_ID = "f5abf241-836a-4de1-8103-e8cea223235d"

// Supabase (public key - safe)
const SUPABASE_URL = "https://prftfpyzugskjrdkzvcv.supabase.co"
// SUPABASE_ANON_KEY should be in .env.local
```

---

## First-Time Setup

### Step 1: Check Prerequisites

- [ ] Node.js 18+ (`node --version`)
- [ ] npm (`npm --version`)

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

Create a `.env.local` file:

```env
# Supabase Configuration (public keys)
NEXT_PUBLIC_SUPABASE_URL=https://prftfpyzugskjrdkzvcv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from infrastructure team>

# App Configuration
NEXT_PUBLIC_APP_SLUG=napkyn

# Claude API (for intent parsing)
ANTHROPIC_API_KEY=<get from infrastructure team>
```

### Step 4: Run the App

```bash
npm run dev
# Open http://localhost:3000
```

---

## How to Use the Backend

### Authentication

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

### Storing Data (Entities)

All app data goes in the shared `entities` table:

```typescript
const APP_ID = "f5abf241-836a-4de1-8103-e8cea223235d"

// Create an entity
const { data, error } = await supabase
  .from('entities')
  .insert({
    app_id: APP_ID,
    user_id: user.id,
    entity_type: 'profile',  // or 'calculation', 'flow_session', 'saved_scenario'
    data: {
      birthDate: '1990-01-01',
      country: 'US',
      income: { gross: 100000, currency: 'USD' }
    }
  })
  .select()
  .single()

// Read entities
const { data, error } = await supabase
  .from('entities')
  .select('*')
  .eq('entity_type', 'profile')

// Update an entity
const { data, error } = await supabase
  .from('entities')
  .update({ data: { ...updatedData } })
  .eq('id', entityId)

// Delete an entity
const { error } = await supabase
  .from('entities')
  .delete()
  .eq('id', entityId)
```

### Checking Pro Status

```typescript
// Check if user has pro subscription
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .eq('app_id', APP_ID)
  .eq('status', 'active')
  .single()

const isPro = !!subscription
```

---

## Entity Types for This App

Use these entity types (already registered):

| Type | Purpose |
|------|---------|
| `profile` | User's financial profile (income, assets, goals) |
| `calculation` | Saved calculation results from any calculator |
| `flow_session` | Active Super Flow session state |
| `saved_scenario` | Saved "what-if" scenarios for comparison |

When creating entities, always use these exact type strings.

---

## Project Structure

```
napkyn/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Homepage with hero + search
│   │   └── globals.css         # Global styles, animations
│   │
│   └── components/
│       ├── ui/
│       │   ├── video-background.tsx   # Looping video background
│       │   ├── lightbulb-toggle.tsx   # Light/dark mode toggle
│       │   └── text-reveal.tsx        # Letter-by-letter animation
│       ├── search/
│       │   └── search-bar.tsx         # Glass search input
│       └── flow/
│           └── flow-section.tsx       # Flow runner section
│
├── public/
│   ├── BG Video Home.mp4       # Hero video background
│   ├── herobg-dark.png         # Dark mode background
│   └── herobg.jpg              # Fallback image
│
├── CLAUDE.md                   # This file
└── package.json
```

---

## Current State

**What's Built:**
- Hero section with video background (ping-pong loop at 0.5x speed)
- Light/dark mode toggle (lightbulb icon)
- Animated text reveal on "Napkyn" title
- Glass-morphism search bar with glow effect on focus
- Flow section template (intent mode + life suite mode)
- Smooth scroll to flow section

**What's Next (from spec):**
- Intent parsing with Claude API
- Calculator implementations (FIRE, Coast FIRE, Career Switch, etc.)
- Super Flow engine for connected calculator sequences
- User profile system
- Saved calculations and scenarios

---

## Key Design Patterns

### Glass Morphism
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Animation Classes
- `animate-fade-in` - Fade in with slight upward movement
- `animate-glow-pulse` - Gentle pulsing glow effect
- `animate-spin-slow` - Slow rotation (4s)

### Video Ping-Pong
The video background plays forward at 0.5x speed, then reverses using `requestAnimationFrame` to step backwards frame-by-frame when it reaches the end.

---

## Spec File

The full app specification is at `../napkyn-spec.md`. Read it before building features.

Key features from spec:
- **Intent-based search** - Natural language queries parsed by Claude
- **Super Flows** - Chained calculators that share context
- **Global Profile** - Enter data once, used everywhere
- **Localization** - Country-specific tax/pension/accounts

---

## Development Guidelines

1. **Follow the spec** - Read `napkyn-spec.md` for feature requirements
2. **Use existing patterns** - Look at existing components before creating new ones
3. **Dark theme first** - The app has a dark cosmic aesthetic
4. **Glass effects** - Use glass morphism for cards and containers
5. **Commit frequently** - Small, focused commits with clear messages

---

## Git Workflow

```bash
# Before starting work
git pull

# After completing a feature
git add .
git commit -m "Add [feature name]"
git push
```

**Never force push. Never modify git history.**

---

## What to Do If...

### "I need a new entity type"
Add it to your code. Entity types are defined by your app, not infrastructure.

### "I need a database change"
You don't have database access. All data goes through the entities API.
If you truly need a schema change, contact the infrastructure team.

### "Auth isn't working"
Check that:
1. SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
2. The Supabase client is initialized
3. You're handling the auth state properly

### "I need Claude API access"
The ANTHROPIC_API_KEY should be in `.env.local`. Get it from the infrastructure team.

---

*This app is part of the IroraForge platform. Infrastructure is managed centrally.*

*Last updated: 2026-01-03*
