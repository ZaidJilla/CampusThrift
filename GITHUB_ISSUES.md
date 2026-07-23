# GitHub Issues — paste each block below as a new Issue

For each one: GitHub repo → **Issues** tab → **New issue** → paste the title as
the issue title, the rest as the description. Add a label if you want
(P0/P1/P2) — Settings → Labels lets you create custom ones.

---

### [P0] Project setup: repo, Expo project, Supabase project
Set up the base project scaffolding.
- [ ] Initialize Expo React Native project
- [ ] Create Supabase project, run schema.sql
- [ ] Create `listing-photos` storage bucket
- [ ] Confirm app boots on a physical device via Expo Go

---

### [P0] Auth: sign up with school email verification
Only `@tufts.edu` and `@northeastern.edu` emails should be accepted at sign up.
- [ ] Reject non-campus emails with a clear message
- [ ] Create profile row on successful sign up
- [ ] Confirm email flow works (or is disabled for testing)

---

### [P0] Auth: login / logout / session persistence
- [ ] Login screen working end to end
- [ ] Session persists across app restarts
- [ ] Sign out from Profile tab

---

### [P0] Listings: create listing
- [ ] Title, description, price, category, size, condition fields
- [ ] Photo upload to Supabase storage
- [ ] Resale vs. Handmade-by-me toggle
- [ ] Listing saves and appears in Browse feed

---

### [P0] Listings: edit / delete / mark as sold
- [ ] Owner can edit their own listing
- [ ] Owner can delete their own listing
- [ ] Owner can mark a listing as sold, removing it from Browse

---

### [P0] Browse: home feed scoped to campus
- [ ] Feed only shows listings from the logged-in user's school
- [ ] Pull-to-refresh
- [ ] Empty state when no listings yet

---

### [P0] Browse: listing detail page
- [ ] Shows photos, description, price, seller name
- [ ] "Message Seller" button (hidden if you're the owner)
- [ ] "Mark as Sold" button (visible only to owner)

---

### [P0] Search
- [ ] Keyword search on listing title within Browse tab

---

### [P0] Messaging: in-app chat
- [ ] Starting a conversation from a listing creates/reuses a thread
- [ ] Messages send and appear in real time
- [ ] Inbox screen lists all conversations

---

### [P1] Filters on Browse tab
- [ ] Filter by category
- [ ] Filter by price range
- [ ] Filter by size
- [ ] Filter by condition

---

### [P1] Handmade-specific browsing
- [ ] Separate tab or filter to browse only "Handmade by me" listings

---

### [P1] Push notifications
- [ ] Set up Expo push notifications
- [ ] Notify on new message
- [ ] Notify when your listing sells

---

### [P1] Safety: block and report
- [ ] Block a user from a conversation
- [ ] Report a listing or user
- [ ] Reports land somewhere reviewable (admin table for now is fine)

---

### [P1] Profile: ratings after a completed sale
- [ ] Buyer/seller can leave a rating after marking sold
- [ ] Ratings show on public profile

---

### [P2] Admin dashboard
- [ ] View reported listings/users
- [ ] Suspend or ban a user

---

### [P2] Post-MVP: in-app payments
Don't build until the core loop is proven on Tufts + Northeastern.
- [ ] Research Stripe Connect or similar for peer-to-peer payments
- [ ] Legal/compliance check (money transmission)

---

### [P2] Post-MVP: expand beyond Tufts + Northeastern
- [ ] Add school switcher
- [ ] Add new schools to `schools` table + email domain list
