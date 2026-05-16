# Screen 01 — Login

**Goal:** Get a Hub02 team member into the app in one click via Google SSO.

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                       ┌──────────────────┐                       │
│                       │     ▣ hub02      │                       │
│                       │                  │                       │
│                       │  Sign in to the  │                       │
│                       │   team CRM       │                       │
│                       │                  │                       │
│                       │  ┌────────────┐  │                       │
│                       │  │ G  Google  │  │   ← primary, lg       │
│                       │  └────────────┘  │                       │
│                       │                  │                       │
│                       │  Only @hub02     │                       │
│                       │  accounts can    │                       │
│                       │  sign in.        │                       │
│                       └──────────────────┘                       │
│                                                                  │
│                                                                  │
│              v0.1 · status.hub02.dev                             │
└──────────────────────────────────────────────────────────────────┘
```

## Component breakdown

- Centered card: 360px wide, `--color-surface`, `--radius-xl`, `--shadow-overlay`, 32px padding.
- Logo mark (24px square) + wordmark.
- `<h1>` "Sign in to the team CRM" — `--text-xl`, weight 600.
- `<Button variant="primary" size="lg">` with Google `G` leading icon — full width.
- Helper line `--text-sm` `--color-fg-muted`.
- Footer pinned bottom-center: app version + status page link, `--text-xs` `--color-fg-subtle`.

## Tokens

| Element | Token |
| --- | --- |
| Page bg | `--color-bg` |
| Card | `--color-surface`, `--radius-xl`, `--shadow-overlay` |
| Card padding | `--space-8` |
| Button | `primary` / `lg` |
| Helper | `--color-fg-muted`, `--text-sm`, `--leading-snug` |

## Interaction

- Focus auto-lands on the Google button on mount.
- Click → redirect to `/auth/google` (handled by API). No spinner under 500ms; if the round-trip is slower, button enters `loading` state.
- Errors render below the button in `--color-danger` with retry copy: *"Couldn't reach Google. Check your connection and try again."*
- Non-`@hub02` accounts: hard-fail with *"This workspace is for Hub02 staff. Ask IT if you think this is wrong."*

## A11y

- `<main>` landmark wraps the card.
- Card has `aria-labelledby` pointing at the `<h1>`.
- Button text is the action ("Continue with Google"). Icon is `aria-hidden`.
- Logical tab order: Google button → status footer link.
