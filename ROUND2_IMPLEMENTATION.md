# Round 2 Implementation Guide

## ✅ Backend Implementation (COMPLETED)

### 1. Puzzle Generator (`src/utils/puzzleGenerator.js`)
- ✅ Round 1: Simple ordering puzzle (warm-up)
- ✅ Round 2: Real Tango puzzle (Sun/Moon grid logic puzzle)
- ✅ Generates 4x4 (easy), 6x6 (medium), or 8x8 (hard) grids
- ✅ Validates "no three in a row" rule
- ✅ Ensures balanced rows/columns (equal Suns and Moons)

### 2. Game Service (`src/services/gameService.js`)
- ✅ Multi-round game state management
- ✅ Separate tracking for Round 1 and Round 2 completions
- ✅ `startRound2()` method to trigger second round
- ✅ `submitSolution()` handles both round types
- ✅ Validates Tango puzzle solutions (grid comparison)
- ✅ Tracks player stats for both rounds

### 3. Admin Controller (`src/controllers/adminController.js`)
- ✅ `/api/admin/start-round2/:gameId` endpoint
- ✅ Updated CSV export with both rounds' data
- ✅ Multi-round countdown and activation

### 4. Socket Service (`src/services/socketService.js`)
- ✅ Emits `round1-complete` when all players finish Round 1
- ✅ Sends `round` parameter with all events
- ✅ Handles solution submission for both rounds
- ✅ Tracks completion per round

### 5. Routes (`src/routes/adminRoutes.js`)
- ✅ Added `POST /api/admin/start-round2/:gameId` route

## 📋 Frontend Implementation Needed

### Files to Update:

#### 1. `public/game.html`
**Add:**
- Round indicator (Round 1 of 2, Round 2 of 2)
- Import TangoGame.js script: `<script src="/js/tangoGame.js"></script>`
- Container for Tango puzzle: `<div id="tango-game-container"></div>`
- Update socket handlers to detect `puzzle.type` (ordering vs tango)

**Socket Events to Handle:**
```javascript
socket.on('game-start', ({ puzzle, round }) => {
  if (puzzle.type === 'ordering') {
    // Show existing drag-drop puzzle UI
  } else if (puzzle.type === 'tango') {
    // Show TangoGame UI
    const tangoGame = new TangoGame('tango-game-container', puzzle, (solution) => {
      socket.emit('submit-solution', {
        playerId,
        gameId,
        solution,
        round: 2
      });
    });
  }
});

socket.on('solution-correct', ({ completionTime, rank, round, allCompleted }) => {
  if (round === 1 && allCompleted) {
    // Show "Waiting for Round 2" screen
  } else if (round === 2) {
    // Show final results
  }
});

socket.on('round1-complete', () => {
  // For players: show "Wait for admin to start Round 2"
});
```

#### 2. `public/admin.html`
**Add:**
- Round indicator display
- "Start Round 2" button (shows after round 1 completes)
- Leaderboard for both rounds

**Socket Events to Handle:**
```javascript
socket.on('round1-complete', () => {
  // Enable "Start Round 2" button
  showRound2Button();
});

// Button click handler:
function startRound2() {
  fetch(`/api/admin/start-round2/${gameId}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      console.log('Round 2 started');
    });
}
```

**Update Leaderboard Display:**
```javascript
// Show both rounds
Player | Round 1 Time | Round 1 Rank | Round 2 Time | Round 2 Rank | Total Score
--------|-------------|--------------|--------------|--------------|-------------
Alice   | 45.2s       | 1st          | 120.5s       | 2nd          | 3
Bob     | 52.1s       | 2nd          | 115.3s       | 1st          | 3
```

## 🎮 Game Flow

### Player Experience:
1. **Join Game** → Enter name, wait for start
2. **Round 1 Starts** → Countdown (10s) → Solve ordering puzzle
3. **Complete Round 1** → See rank, wait for other players
4. **All Complete Round 1** → "Waiting for Admin to start Round 2"
5. **Round 2 Starts** → Countdown (10s) → Solve Tango puzzle (Sun/Moon grid)
6. **Complete Round 2** → See final rank and overall score
7. **Final Results** → Both rounds displayed

### Admin Experience:
1. **Create Game** → Share join link
2. **Start Game** (Round 1) → Players play
3. **All Players Complete** → "Start Round 2" button appears
4. **Click "Start Round 2"** → Round 2 begins
5. **View Leaderboard** → See both rounds' results
6. **Export CSV** → Download complete results

## 🔧 Quick Frontend Changes Needed

### Minimum Changes to Test:

**In `game.html`, add before `</body>`:**
```html
<script src="/js/tangoGame.js"></script>
<script>
  // Add round detection in game-start handler
  socket.on('game-start', ({ puzzle, round }) => {
    currentRound = round;

    if (puzzle.type === 'tango') {
      document.getElementById('game-screen').innerHTML = '<div id="tango-game-container"></div>';
      new TangoGame('tango-game-container', puzzle, (solution) => {
        socket.emit('submit-solution', { playerId, gameId, solution, round });
      });
    }
    // ... existing ordering puzzle code
  });
</script>
```

**In `admin.html`, add:**
```html
<button id="startRound2Btn" style="display:none" onclick="startRound2()">Start Round 2</button>

<script>
  socket.on('round1-complete', () => {
    document.getElementById('startRound2Btn').style.display = 'block';
    alert('All players completed Round 1! You can start Round 2 now.');
  });

  function startRound2() {
    fetch(`/api/admin/start-round2/${gameId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => console.log('Round 2 started'));
  }
</script>
```

## 🧪 Testing Steps

1. **Start Server:** `npm start`
2. **Create Game:** Open admin panel, create game
3. **Join Players:** Open 2-3 player tabs, join game
4. **Start Round 1:** Admin clicks "Start Game"
5. **Complete Round 1:** All players submit solutions
6. **Verify:** Admin sees "Start Round 2" button
7. **Start Round 2:** Admin clicks button
8. **Play Round 2:** Players solve Tango puzzle
9. **Check Results:** Export CSV with both rounds

## 📊 Data Structure

### Game Object:
```javascript
{
  id: "uuid",
  currentRound: 1 or 2,
  totalRounds: 2,
  rounds: {
    1: {
      puzzle: { type: 'ordering', ... },
      status: 'active',
      startTime: timestamp,
      completedPlayers: Set()
    },
    2: {
      puzzle: { type: 'tango', size: 6, solution: [[...]], givens: [[...]] },
      status: 'waiting',
      startTime: null,
      completedPlayers: Set()
    }
  },
  players: Map of {
    id, name,
    completionTime, rank,           // Round 1
    round2CompletionTime, round2Rank // Round 2
  }
}
```

## 🎯 Next Steps

1. Update `public/game.html` to handle both puzzle types
2. Update `public/admin.html` to show Round 2 button
3. Test complete 2-round gameplay
4. Polish UI/UX for transitions between rounds
5. Add loading states and animations

---

**TangoGame.js is ready!** Just need to integrate it into the existing HTML files.
