# Phase 5 Browser Verification Plan

## Test Environment
- **URL**: http://localhost:3000
- **Server Status**: Running on Vite dev server
- **Tested In**: Manual browser inspection with DevTools

## Test Sequence

### 1. AudioVisualizer with Real AnalyserNode Data

**Goal**: Verify visualizer reads actual frequency data from AnalyserNode, not fake data.

**Test Cases**:
- [ ] Start session with 'lofi' audio → visualizer shows active bars
- [ ] Bars should respond in real-time to audio frequency changes
- [ ] Each bar height correlates to different frequency bands
- [ ] Stop audio → all bars drop to minimum (4px)
- [ ] Pause session → visualizer freezes (bars don't change)
- [ ] Resume → visualizer resumes animation

**Verification Method**:
1. Open DevTools Console
2. Monitor `audioEngine.getAnalyser()` to confirm node exists
3. Check AnalyserNode data: `analyser.getByteFrequencyData(dataArray)` returns non-zero values
4. Verify bars animate smoothly (60fps target, no stuttering)

---

### 2. All Six Audio Environments

**Goal**: Verify each environment produces distinct visualizer behavior.

**Environments to test**:
- [ ] `lofi` → Warm orange gradient, mid-range frequencies visible
- [ ] `nature` → Green gradient, lower frequencies (wind/rain noise)
- [ ] `ambient` → Purple gradient, sparse tall spikes (pads)
- [ ] `instrumental` → Cool blue gradient, consistent high-frequency activity
- [ ] `frequency` → Lavender gradient, binaural beat pattern (subtle, low amplitude)
- [ ] `none` → No visualizer renders, audio stopped

**Observation**: Each environment should show visually distinct frequency patterns.

---

### 3. Visualizer Handles Audio States

**Goal**: Verify visualizer gracefully handles pause, stop, and silent states.

**Test Cases**:
- [ ] **Playing**: Bars animate with audio
- [ ] **Paused**: RAF loop continues but animation frame is canceled, bars frozen
- [ ] **Stopped**: Visualizer unmounts cleanly, no console errors
- [ ] **No Audio**: Visualizer not rendered (conditional render: `audio !== 'none'`)
- [ ] **Low Volume**: Bars show reduced height but still respond

**Verification Method**:
1. DevTools Performance tab: Check for animation frame activity (playing vs paused)
2. Pause session and observe RAF calls stop
3. Listen for console warnings about cleanup

---

### 4. Animation Frame Cleanup

**Goal**: Verify RAF cleanup when components unmount or pause.

**Test Cases**:
- [ ] Start session (RAF active)
- [ ] Pause session → RAF canceled
- [ ] Resume session → RAF restarted
- [ ] End session → Component unmounts, RAF canceled
- [ ] Navigate away → No memory leaks or orphaned RAF calls

**Verification Method**:
1. DevTools Performance: Measure RAF frequency before/after
2. Check for console errors on unmount
3. Memory heap snapshot: Should stabilize after unmount

---

### 5. Timer Milestones Trigger Once

**Goal**: Verify milestone feedback appears exactly once per threshold, not repeatedly.

**Test Cases**:
- [ ] Start 5-minute session
- [ ] At 3:45 remaining → "¼" indicator appears once
- [ ] At 2:30 remaining → "½" indicator appears once
- [ ] At 1:15 remaining → "¾" indicator appears once
- [ ] At 1:00 remaining → "1 min left" appears once
- [ ] At 0:10 remaining → "10 sec!" appears once
- [ ] Each milestone should fade out after animation completes

**Verification Method**:
1. Watch the center timer area for milestone indicator
2. Count occurrences (should be 1 per threshold)
3. Confirm no duplicate indicators at same threshold

---

### 6. Timer Accuracy Independent of RAF

**Goal**: Verify timer countdown uses timestamps, not animation frames.

**Test Cases**:
- [ ] Start 60-second session
- [ ] Open DevTools Performance tab
- [ ] Throttle CPU (4x slowdown) → timer still counts accurate seconds
- [ ] Disable/enable animations → timer unaffected
- [ ] Check elapsed time after 30 seconds → should be ~30s, not dependent on frame rate

**Verification Method**:
1. Use DevTools Performance tab CPU throttling
2. Compare displayed time to actual elapsed time
3. Verify `timerData.remainingSeconds` updates based on `useActiveStudySession` hook (timestamp-based, not RAF-based)

---

### 7. AudioContext & Audio Node Cleanup

**Goal**: Verify no memory leaks from oscillators, gainNodes, or AudioContext.

**Test Cases**:
- [ ] Start session → oscillators created and tracked
- [ ] Pause → sources paused, not stopped
- [ ] Resume → audio resumes from pause state
- [ ] Stop → all sources disconnected and removed from tracking
- [ ] Switch environments → previous environment's oscillators cleaned up
- [ ] Multiple stop/start cycles → no accumulation of nodes

**Verification Method**:
1. Open DevTools → Application → Web Audio (if available in your browser)
2. Check `audioEngine.activeSources` length in console
3. Start/stop cycles should show activeSources array clearing
4. Memory snapshots before/after to confirm cleanup

**Console test commands**:
```javascript
// Check active sources
console.log('Active sources:', audioEngine.activeSources.length);

// Check analyser exists
console.log('Analyser:', audioEngine.getAnalyser());

// Manually trigger stop
audioEngine.stop();
console.log('After stop:', audioEngine.activeSources.length); // should be 0
```

---

### 8. Session Restoration Tests

**Goal**: Verify active and paused sessions restore correctly after page refresh.

**Test Cases**:
- [ ] Start 10-minute session, let it run for 2 minutes
- [ ] Refresh page → should restore ACTIVE state with ~8 minutes remaining
- [ ] Verify timer continues from interrupted point
- [ ] Verify volume is restored
- [ ] Verify audio continues playing at same level

**Paused Session Test**:
- [ ] Start session, let it run for 1 minute
- [ ] Click "Pause Timer"
- [ ] Verify session shows "SESSION PAUSED"
- [ ] Verify pulse indicator stops glowing
- [ ] Refresh page → should restore PAUSED state with same remaining time
- [ ] Resume → timer continues correctly

**Edge Case: Expired Session**:
- [ ] Start 2-minute session
- [ ] Wait 3+ minutes (or advance system clock)
- [ ] Refresh page → should skip to CHECK_IN stage (session expired)

---

### 9. Volume Controls & Feedback

**Goal**: Verify volume slider changes audio level and provides visual feedback.

**Test Cases**:
- [ ] Start session with audio
- [ ] Volume slider at 0% → icon shows muted, no sound
- [ ] Drag slider to 33% → icon turns red, quiet audio
- [ ] Drag slider to 66% → icon turns yellow, medium audio
- [ ] Drag slider to 100% → icon turns green, loud audio
- [ ] Slider provides smooth visual feedback (no jumps)

**Verification Method**:
1. Listen to actual audio level changes
2. Observe icon color transitions
3. Check inspector for volume input value updates

---

### 10. Timer Display Accuracy

**Goal**: Verify MM:SS format and progress percentage are accurate.

**Test Cases**:
- [ ] 300-second session → shows 05:00
- [ ] After 30 seconds → shows 04:30 with 10% progress
- [ ] After 150 seconds → shows 02:30 with 50% progress
- [ ] At completion → shows 00:00 with 100% progress
- [ ] Check that minutes use tabular numerals (fixed-width font)

---

### 11. End Session Modal & Options

**Goal**: Verify end session flow and options.

**Test Cases**:
- [ ] Click "End Session" button
- [ ] Modal appears with blur backdrop
- [ ] Shows elapsed time correctly
- [ ] Two options: "Finish & Check In" and "Discard Session"
- [ ] "Finish & Check In" → proceeds to CHECK_IN stage
- [ ] "Discard Session" → returns to DASHBOARD without recording
- [ ] "Return to Timer" → closes modal, resumes session

---

### 12. Responsive Layout

**Goal**: Verify layout adapts correctly on mobile/tablet.

**Test Cases**:
- [ ] Desktop (1200px+) → full-size timer disc (340px), 60px visualizer
- [ ] Tablet (768-1024px) → medium disc size, adjusted font
- [ ] Mobile (375-480px) → compact disc (280px), 50px visualizer, stacked buttons
- [ ] All interactive elements remain accessible and clickable

**Verification Method**:
1. DevTools Device Emulation
2. Test on actual mobile device if available
3. Verify touch targets are at least 44x44px

---

## Summary Table

| Component | Automated Tests | Browser Tests | Status |
|-----------|---|---|---|
| Timer Display | ✅ | TBD | |
| AudioVisualizer | ✅ | TBD | |
| AmbientEnvironment | ✅ | TBD | |
| AudioContext Cleanup | ✅ | TBD | |
| Session Restoration | ✅ | TBD | |
| Volume Controls | ✅ | TBD | |
| Responsive Layout | ✅ | TBD | |

---

## Notes for Tester

- All timestamps are based on `useActiveStudySession` hook, which uses `performance.now()` internally
- AudioVisualizer uses `requestAnimationFrame` for smooth 60fps updates
- Timer milestones use React state transitions (no RAF dependency)
- All audio nodes are managed by `audioEngine` module
- localStorage persists session state across page refreshes
