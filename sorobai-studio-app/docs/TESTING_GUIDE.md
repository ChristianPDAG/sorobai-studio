# Testing Guide - Product Decisions Implementation

## 🧪 Manual Testing Scenarios

### Scenario 1: Public Hub Access ✅

**Goal**: Verify anyone can browse Hub without wallet

**Steps**:
1. Open browser in incognito mode
2. Go to `http://localhost:3000`
3. Click "Hub" in navbar
4. Should see Community Hub with contracts
5. Click on any contract card "View" button
6. Should see contract details

**Expected Result**: ✅ No wallet prompt, full access to Hub

---

### Scenario 2: Onboarding Modal Flow ✅

**Goal**: Test 2-step onboarding from landing page

**Steps**:
1. Go to `http://localhost:3000`
2. Click "Start Building" button
3. Modal should appear with Step 1 (Wallet)
4. Click "Connect Freighter Wallet"
5. If Freighter installed: Connect wallet
6. Modal should show Step 2 (GitHub)
7. Click "Skip for now"
8. Should redirect to `/dashboard`

**Expected Result**: ✅ Smooth 2-step flow, can skip GitHub

---

### Scenario 3: Fork Without GitHub ✅

**Goal**: Test GitHub requirement for forking

**Steps**:
1. Go to `/hub` (public)
2. Find any contract card
3. Click "Fork" button
4. Modal should appear: "GitHub Required to Fork"
5. Click "Maybe Later"
6. Modal closes, stays on Hub

**Expected Result**: ✅ GitHub modal appears, can dismiss

---

### Scenario 4: Dashboard GitHub Banner ✅

**Goal**: Test GitHub prompt in Dashboard

**Steps**:
1. Connect wallet (without GitHub)
2. Go to `/dashboard`
3. Should see purple banner at top
4. Banner says "Link your GitHub account"
5. Click X button to dismiss
6. Banner disappears
7. Refresh page
8. Banner should stay dismissed

**Expected Result**: ✅ Banner appears, dismissible, persists

---

### Scenario 5: Protected Routes ✅

**Goal**: Verify route protection works

**Steps**:
1. Without wallet connected
2. Try to access `/dashboard`
3. Try to access `/studio`
4. Try to access `/bounties`
5. Try to access `/settings`

**Expected Result**: ✅ Routes load (component handles auth state)

**Note**: In production, proxy.ts will redirect to login

---

### Scenario 6: Navigation Flow ✅

**Goal**: Test all navigation links work

**Steps**:
1. Start at `/`
2. Click "Hub" → Should go to `/hub`
3. Click "Studio" → Should go to `/studio`
4. Click "Bounties" → Should go to `/bounties`
5. Click "Sorobai Studio" logo → Should go to `/`
6. In sidebar, test all links
7. In footer, test all links

**Expected Result**: ✅ All links work, no 404s

---

## 🔍 Component Testing

### OnboardingModal Component

**File**: `components/auth/onboarding-modal.tsx`

**Test Cases**:
```typescript
✅ Modal opens when open={true}
✅ Modal closes when onOpenChange(false)
✅ Step 1 shows wallet connection
✅ Step 2 shows after wallet connected
✅ Can skip GitHub in Step 2
✅ "Connect GitHub" button works
✅ Freighter link opens in new tab
```

---

### GitHubRequiredModal Component

**File**: `components/auth/github-required-modal.tsx`

**Test Cases**:
```typescript
✅ Modal shows correct message for action="fork"
✅ Modal shows correct message for action="publish"
✅ Modal shows correct message for action="bounty"
✅ "Connect GitHub" button triggers OAuth
✅ "Maybe Later" button closes modal
✅ Modal is accessible (keyboard navigation)
```

---

### ContractCard Component

**File**: `components/hub/contract-card.tsx`

**Test Cases**:
```typescript
✅ Fork button shows GitHub modal if not connected
✅ Fork button works if GitHub connected
✅ View button navigates to contract detail
✅ Like and fork counts display correctly
✅ Tags render properly
✅ Author info displays
```

---

### Dashboard Page

**File**: `app/(platform)/dashboard/page.tsx`

**Test Cases**:
```typescript
✅ GitHub banner shows if not connected
✅ GitHub banner hides if connected
✅ Banner can be dismissed
✅ Dismissed state persists
✅ "Connect GitHub" button works
✅ Stats cards render
✅ Projects list renders
```

---

## 🎯 Integration Testing

### Wallet + GitHub Flow

**Scenario**: Complete onboarding with both

**Steps**:
1. Click "Start Building"
2. Connect Freighter wallet
3. Connect GitHub (mock)
4. Go to Dashboard
5. No GitHub banner should show
6. Go to Hub
7. Click "Fork" on contract
8. Should fork directly (no modal)

**Expected**: ✅ Seamless experience with both connected

---

### Wallet Only Flow

**Scenario**: Use app without GitHub

**Steps**:
1. Connect wallet only
2. Go to Dashboard → See banner
3. Go to Studio → Can use AI
4. Try to publish → GitHub modal
5. Go to Hub → Can browse
6. Try to fork → GitHub modal
7. Go to Bounties → Can browse
8. Try to apply → GitHub modal

**Expected**: ✅ Can use most features, prompted when needed

---

### No Auth Flow

**Scenario**: Browse without any auth

**Steps**:
1. Don't connect anything
2. Go to Hub → Can browse
3. Click contract → Can view
4. Try to fork → Wallet + GitHub modal
5. Go to Dashboard → Redirected or empty state
6. Go to Studio → Redirected or empty state

**Expected**: ✅ Public content accessible, protected content blocked

---

## 🐛 Edge Cases to Test

### 1. Freighter Not Installed
```
User clicks "Connect Wallet"
→ Should show error or link to install
```

### 2. Wallet Connection Fails
```
User clicks "Connect Wallet"
→ Freighter rejects
→ Should show error message
→ Can retry
```

### 3. GitHub OAuth Fails
```
User clicks "Connect GitHub"
→ OAuth fails
→ Should show error message
→ Can retry
```

### 4. Session Expires
```
User is logged in
→ Session expires
→ Should redirect to login
→ Or show reconnect prompt
```

### 5. Multiple Tabs
```
User connects wallet in Tab 1
→ Tab 2 should update automatically
→ State should sync
```

### 6. Mobile Responsiveness
```
Test all modals on mobile
→ Should be readable
→ Buttons should be tappable
→ No horizontal scroll
```

---

## 📱 Browser Testing

### Desktop Browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers:
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

### Freighter Extension:
- [ ] Chrome extension
- [ ] Firefox extension

---

## 🔧 Developer Testing

### Console Errors
```bash
# Open browser console
# Navigate through app
# Should see no errors
# Only expected warnings (if any)
```

### Network Requests
```bash
# Open Network tab
# Check all requests succeed
# No 404s or 500s
# Proxy.ts requests complete
```

### Performance
```bash
# Open Lighthouse
# Run audit
# Check scores:
- Performance > 90
- Accessibility > 95
- Best Practices > 90
- SEO > 90
```

---

## 🎨 Visual Testing

### Modal Appearance
- [ ] Modals centered on screen
- [ ] Backdrop darkens background
- [ ] Close button visible
- [ ] Text readable
- [ ] Buttons properly styled
- [ ] Icons aligned

### Banner Appearance
- [ ] GitHub banner stands out
- [ ] Colors match design system
- [ ] Close button works
- [ ] Responsive on mobile

### Hub Layout
- [ ] Contract cards in grid
- [ ] Cards have hover effect
- [ ] Tags display properly
- [ ] Author avatars load
- [ ] Buttons aligned

---

## 📊 State Management Testing

### Zustand Stores

**use-stellar-wallet**:
```typescript
✅ isConnected updates on connect
✅ publicKey stored correctly
✅ disconnect clears state
✅ State persists across pages
```

**use-github-auth**:
```typescript
✅ isConnected updates on connect
✅ username stored correctly
✅ avatarUrl stored correctly
✅ disconnect clears state
✅ State persists across sessions (localStorage)
```

---

## 🚀 Production Readiness

### Before Deploy:
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Supabase configured
- [ ] GitHub OAuth configured
- [ ] Analytics integrated
- [ ] Error tracking setup

### Post Deploy:
- [ ] Test on production URL
- [ ] Verify Freighter works
- [ ] Test GitHub OAuth
- [ ] Check analytics
- [ ] Monitor error logs

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]

**Tester**: [Name]
**Browser**: [Browser + Version]
**Device**: [Desktop/Mobile]

### Results:

| Scenario | Status | Notes |
|----------|--------|-------|
| Public Hub Access | ✅/❌ | |
| Onboarding Modal | ✅/❌ | |
| Fork Without GitHub | ✅/❌ | |
| Dashboard Banner | ✅/❌ | |
| Protected Routes | ✅/❌ | |
| Navigation Flow | ✅/❌ | |

### Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

## 🎯 Success Criteria

### Must Pass:
- ✅ Hub accessible without wallet
- ✅ Onboarding modal works
- ✅ GitHub prompts appear correctly
- ✅ No broken links
- ✅ No console errors
- ✅ Mobile responsive

### Nice to Have:
- ⭐ Fast load times (<2s)
- ⭐ Smooth animations
- ⭐ Keyboard navigation
- ⭐ Screen reader compatible

---

**Testing Status**: 🔄 Ready for manual testing  
**Last Updated**: December 22, 2024
