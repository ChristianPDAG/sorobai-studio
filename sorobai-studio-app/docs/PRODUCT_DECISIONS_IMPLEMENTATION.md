# Product Decisions Implementation

## Overview
This document details the implementation of the 4 key product decisions for Sorobai Studio's authentication and access control architecture.

---

## ✅ Decision 1: Hub Público, Studio Privado

### Implementation:
- **Hub moved to public route**: `/app/hub/page.tsx` (outside of `(platform)` group)
- **Proxy updated**: `proxy.ts` with route protection rules (Next.js uses proxy.ts instead of middleware.ts when Supabase is present)
- **Public routes**: `/`, `/hub`, `/terms`, `/privacy`, `/auth`
- **Protected routes**: `/dashboard`, `/studio`, `/bounties`, `/settings`, `/profile`

### User Experience:
- Users can browse Community Hub without connecting wallet
- Clicking on contracts in Hub shows details publicly
- Attempting to fork requires wallet + GitHub
- Studio, Dashboard, and Bounties require wallet connection

### Files Modified:
- ✅ Updated `sorobai-studio-app/proxy.ts` (merged with route protection)
- ✅ Created `sorobai-studio-app/app/hub/page.tsx` (public)
- ✅ Removed old Hub from `(platform)` directory

---

## ✅ Decision 2: GitHub Opcional (Solo para Publicar/Bounties)

### Implementation:
- **GitHub hook created**: `use-github-auth.ts` with Zustand + persist
- **GitHub modal created**: `github-required-modal.tsx` for contextual prompts
- **Trigger points**:
  - Fork button in Hub contracts
  - Publish button in Studio
  - Apply to bounty button
  - Submit bounty solution

### User Experience:
- Users can use AI Studio without GitHub
- GitHub prompt appears only when trying to:
  - Publish contracts to Hub
  - Fork contracts
  - Participate in bounties
- Banner in Dashboard (dismissible) suggests linking GitHub
- Can always link later in Settings

### Files Created:
- ✅ `sorobai-studio-app/lib/hooks/use-github-auth.ts`
- ✅ `sorobai-studio-app/components/auth/github-required-modal.tsx`

### Files Modified:
- ✅ `sorobai-studio-app/components/hub/contract-card.tsx` (fork button logic)
- ✅ `sorobai-studio-app/app/(platform)/dashboard/page.tsx` (GitHub banner)

---

## ✅ Decision 3: Supabase como Backend (No Email/Password)

### Architecture:
```
User Flow:
1. User signs with Freighter (Stellar wallet)
2. Signature sent to Supabase API
3. Supabase creates session for wallet_address
4. Optional: Link GitHub OAuth to same session
5. Database stores: wallet_address + github_username + metadata
```

### Current State:
- Frontend ready with `use-stellar-wallet` hook
- Middleware prepared for Supabase session checks
- Database schema documented in `DATABASE_SCHEMA.sql`

### Next Steps (Backend):
- [ ] Implement Supabase Auth with custom provider
- [ ] Create API route for wallet signature verification
- [ ] Add GitHub OAuth provider to Supabase
- [ ] Link wallet_address with github_username in DB

---

## ✅ Decision 4: Modal de Onboarding (No Página Dedicada)

### Implementation:
- **Onboarding modal created**: `onboarding-modal.tsx` with 2-step flow
- **Triggered from**: Landing page "Start Building" button
- **Step 1**: Connect Freighter Wallet
- **Step 2**: Link GitHub (optional, can skip)

### User Experience:
1. User clicks "Start Building" on landing
2. Modal appears with Step 1 (Wallet)
3. After wallet connection, Step 2 appears (GitHub)
4. User can skip GitHub and go directly to Dashboard
5. Modal is lightweight and doesn't interrupt flow

### Files Created:
- ✅ `sorobai-studio-app/components/auth/onboarding-modal.tsx`

### Files Modified:
- ✅ `sorobai-studio-app/components/marketing/hero.tsx` (modal integration)

---

## 🎯 Access Control Matrix

| Route | Public | Requires Wallet | Requires GitHub |
|-------|--------|----------------|-----------------|
| `/` (Landing) | ✅ | ❌ | ❌ |
| `/hub` (Browse) | ✅ | ❌ | ❌ |
| `/hub/:id` (View) | ✅ | ❌ | ❌ |
| `/dashboard` | ❌ | ✅ | ❌ |
| `/studio` | ❌ | ✅ | ❌ |
| `/studio` (Publish) | ❌ | ✅ | ✅ |
| `/bounties` (Browse) | ❌ | ✅ | ❌ |
| `/bounties` (Apply) | ❌ | ✅ | ✅ |
| `/hub` (Fork) | ❌ | ✅ | ✅ |
| `/settings` | ❌ | ✅ | ❌ |
| `/profile/:username` | ✅ | ❌ | ❌ |

---

## 🔄 User Journey Examples

### Journey 1: Casual Explorer
```
1. Lands on homepage
2. Clicks "Explore Hub" in navbar
3. Browses contracts publicly
4. Clicks "View" on a contract
5. Sees full code and details
6. Clicks "Fork" → GitHub modal appears
7. Decides to skip, continues browsing
```

### Journey 2: Serious Developer
```
1. Lands on homepage
2. Clicks "Start Building"
3. Onboarding modal appears
4. Connects Freighter wallet
5. Links GitHub account
6. Redirected to Dashboard
7. Creates new project in Studio
8. Publishes to Hub (no additional prompts)
9. Applies to bounty (no additional prompts)
```

### Journey 3: AI Tester
```
1. Lands on homepage
2. Clicks "Start Building"
3. Connects wallet only (skips GitHub)
4. Goes to Studio
5. Uses AI to generate contracts
6. Tests and deploys to Testnet
7. Tries to publish → GitHub modal appears
8. Connects GitHub
9. Publishes successfully
```

---

## 🚀 Benefits of This Architecture

### 1. Low Barrier to Entry
- Anyone can explore Hub without signup
- Wallet connection is quick (1 click)
- GitHub only when needed

### 2. High Quality Control
- GitHub verification for publishing
- Prevents spam in Community Hub
- Builds trust in ecosystem

### 3. Web3 Native
- Wallet is primary identity
- No email/password friction
- Aligns with Stellar ecosystem

### 4. Flexible Onboarding
- Users choose their path
- Can upgrade permissions later
- No forced steps

---

## 📝 Implementation Checklist

### Frontend (Completed ✅)
- [x] Update proxy with route protection
- [x] Move Hub to public route
- [x] Create onboarding modal
- [x] Create GitHub required modal
- [x] Add GitHub hook (use-github-auth)
- [x] Update Hero with modal trigger
- [x] Update ContractCard with fork logic
- [x] Add GitHub banner to Dashboard
- [x] Update all navigation links
- [x] Remove duplicate Hub from (platform)

### Backend (Pending 🔄)
- [ ] Setup Supabase Auth
- [ ] Create wallet signature verification API
- [ ] Implement GitHub OAuth
- [ ] Create database tables
- [ ] Add session management
- [ ] Create protected API routes

### Testing (Pending 🔄)
- [ ] Test public Hub access
- [ ] Test wallet-only flow
- [ ] Test wallet + GitHub flow
- [ ] Test GitHub prompts
- [ ] Test middleware protection
- [ ] Test onboarding modal

---

## 🎓 Key Takeaways

1. **Wallet = Identity**: Stellar wallet is the primary authentication method
2. **GitHub = Verification**: GitHub is for quality control, not authentication
3. **Progressive Enhancement**: Users can upgrade permissions as needed
4. **Public Discovery**: Hub is public for marketing and growth
5. **Web3 First**: Architecture aligns with modern dApp standards

---

## 📚 Related Documentation

- [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) - Overall auth strategy
- [WALLET_INTEGRATION.md](./WALLET_INTEGRATION.md) - Freighter integration
- [DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql) - Database structure
- [ROUTES.md](./ROUTES.md) - Complete routing map

---

**Status**: ✅ Frontend Implementation Complete  
**Next**: Backend API implementation with Supabase  
**Updated**: December 22, 2024
