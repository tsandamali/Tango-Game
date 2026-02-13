# Testing Guide - Multi-Round Tango Puzzle Game

## ✅ What's Been Implemented

### Round 1: Ordering Puzzle (Warmup)
- Drag-and-drop number ordering puzzle
- Players arrange pieces in correct sequence
- Time tracking and ranking

### Round 2: Tango Logic Puzzle (Main Game)
- 6x6 grid with Suns (☀️) and Moons (🌙)
- Logic puzzle with rules:
  - Each row/column must have exactly 3 suns and 3 moons
  - No more than 2 identical symbols in a row (horizontally or vertically)
- Click cells to cycle: Empty → Sun → Moon → Empty
- Error highlighting for rule violations

## 🎮 Complete Testing Flow

### Step 1: Start the Server
```bash
npm start
```

Server will run on `http://localhost:3000`

### Step 2: Open Admin Panel
1. Open browser: `http://localhost:3000/admin.html`
2. Select difficulty: Easy, Medium, or Hard
3. Click **"Create Game"**
4. Copy the join link that appears

### Step 3: Join as Players
1. Open 2-3 new browser tabs/windows (incognito mode works great)
2. Paste the join link in each tab
3. Enter different names for each player
4. Click **"Join Game"**
5. You should see "Waiting for admin to start the game..."

### Step 4: Start Round 1
1. Go back to Admin panel
2. You should see player count update
3. Click **"Start Game (Round 1)"** button
4. All players will see 10-second countdown
5. Round 1 puzzle (ordering) appears

### Step 5: Complete Round 1
1. Each player solves the ordering puzzle
2. Drag and drop numbers to arrange them: 1, 2, 3, 4, 5, 6, 7
3. Click **"Submit Solution"**
4. After completion, players see:
   - ✓ ROUND 1 COMPLETED badge
   - Their time and rank for Round 1
   - "⏳ Waiting for Round 2" message

### Step 6: Start Round 2
1. When ALL players complete Round 1, Admin sees:
   - Alert: "🎉 All players completed Round 1!"
   - **"Start Round 2"** button appears (orange color)
2. Admin clicks **"Start Round 2"**
3. 10-second countdown begins
4. Round 2 (Tango puzzle) appears

### Step 7: Play Round 2 (Tango Puzzle)
1. Players see a 6x6 grid (medium difficulty)
2. Some cells are pre-filled (gray background)
3. Click empty cells to place Suns or Moons
4. Follow the rules:
   - Fill all empty cells
   - Each row needs 3 suns and 3 moons
   - No 3 identical symbols in a row
5. Red highlight shows errors
6. Click **"Submit Solution"** when complete

### Step 8: View Final Results
1. Players see final completion time and rank for Round 2
2. Admin can see leaderboard update in real-time
3. Admin clicks **"Export Results (CSV)"** to download:
   - Round 1 times and ranks
   - Round 2 times and ranks
   - Total scores

## 🎯 Expected Behavior

### Player Flow:
```
Join → Wait → Round 1 Countdown → Round 1 Game →
Complete Round 1 → Wait for Round 2 → Round 2 Countdown →
Round 2 Game → Complete → Final Results
```

### Admin Flow:
```
Create Game → Share Link → Start Round 1 →
Monitor Players → [All Complete] → Start Round 2 →
Monitor Players → Export Results
```

## 🐛 Things to Check

### Round Indicator:
- [ ] Shows "Round 1 of 2" at top of player screen
- [ ] Updates to "Round 2 of 2" when Round 2 starts

### Round 1 Completion:
- [ ] Shows completion time and rank
- [ ] Displays waiting message
- [ ] Updates when all players complete

### Round 2 Button:
- [ ] Admin sees "Start Round 2" button after all complete
- [ ] Button is orange/highlighted
- [ ] Disappears after clicking

### Tango Puzzle:
- [ ] Grid displays correctly
- [ ] Pre-filled cells are gray and unclickable
- [ ] Clicking cycles: Empty → ☀️ → 🌙 → Empty
- [ ] Submit button works
- [ ] Solution validation works

### Leaderboard:
- [ ] Updates in real-time
- [ ] Shows player statuses
- [ ] Shows completion times

### CSV Export:
- [ ] Contains both rounds' data
- [ ] Includes player names
- [ ] Shows times and ranks

## 🔍 Troubleshooting

### "Start Round 2" button doesn't appear
- Make sure ALL players completed Round 1
- Check admin console for "round1-complete" event
- Refresh admin page

### Tango puzzle not showing
- Check browser console for errors
- Verify `/js/tangoGame.js` is loading
- Make sure puzzle.type === 'tango'

### Solution marked as incorrect
- For Round 1: Must be in order [0,1,2,3,4,5,6]
- For Round 2: Must match exact solution (all cells correct)

### Players see old screen after round starts
- Refresh player browser
- Check socket connection (F12 → Network → WS)

## 📊 Quick Test Scenario (5 minutes)

1. **Admin:** Create medium difficulty game
2. **Player 1-2:** Join game
3. **Admin:** Start Round 1
4. **Players:** Quickly solve (just arrange 1-7 in order)
5. **Admin:** Wait for "Start Round 2" button
6. **Admin:** Click "Start Round 2"
7. **Players:** Fill Tango grid (try to solve or just fill random)
8. **Admin:** Export results

## 🎨 Visual Indicators

- **Purple gradient**: Main background
- **Round indicator**: Purple box at top showing current round
- **Orange button**: Start Round 2 (stands out)
- **Green badge**: Round 1 completed
- **Blue info box**: Waiting messages
- **Red highlight**: Tango puzzle errors

## ✨ Success Criteria

✅ Players complete Round 1
✅ Waiting screen shows with Round 1 stats
✅ Admin gets notification when all complete
✅ "Start Round 2" button appears
✅ Round 2 (Tango puzzle) loads correctly
✅ Players can interact with Sun/Moon grid
✅ Solution validation works
✅ Final results show
✅ CSV export includes both rounds

---

**Current Status:** Ready to test! All backend and frontend code is implemented.

**Run:** `npm start` then open `http://localhost:3000/admin.html`
