# 🎵 MoodBeats - Premium Study Productivity Platform

## Overview

MoodBeats is a futuristic, premium study productivity application that helps you discover which audio environments enhance your focus and mood. Track your study sessions, monitor your progress, and understand your personal productivity patterns.

## 📁 Project Structure

The complete React + Vite application lives inside [`frontend/`](frontend/). Repository-level documentation, screenshots, GitHub workflows and configuration stay at the root.

```
MoodBeats/
├── frontend/            # Complete React + Vite application
│   ├── public/
│   ├── src/             # Components, pages, hooks, utils, styles, tests
│   ├── index.html       # React entry point
│   ├── index-react.html # React entry point (legacy alias)
│   ├── index-legacy.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── docs/                # Project documentation, reports and screenshots
├── .github/workflows/   # CI (runs from frontend/)
├── .gitignore
└── README.md
```

## 🚀 Installation & Commands

All application commands run from the `frontend/` directory:

```bash
cd frontend
npm install

# Development
npm run dev

# Tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## ✨ Features

### 📊 Dashboard
- **Personalized greeting** with your name and time-based salutation
- **Study statistics** showing day streak, weekly goal progress, and total study time
- **Quick session start** with beautiful card design
- **Current mood tracking** with emoji-based mood selection and stress/focus sliders
- **Weekly progress visualization** with circular progress indicator
- **Audio type explorer** with 6 different audio categories
- **Study insights** showing total time, average focus/stress/mood changes
- **Focus trend chart** displaying 7-day focus patterns

### 🎯 Study Session
- **Pre-session check-in** capturing mood, stress, focus levels
- **Task selection** from 6 study categories (Reading, Writing, Problem solving, etc.)
- **Audio selection** from 6 synthetically generated audio types
- **Session duration** with preset durations (1, 15, 25, 45, 60 minutes)
- **Active timer** with animated vinyl record visual
- **Real-time countdown** with circular progress ring
- **Volume control** for audio playback
- **Pause/Resume** functionality
- **Post-session check-in** to measure changes

### 🎧 Audio Library
- **6 Audio Types:**
  - **Lo-fi**: Mellow chords with vinyl hiss
  - **Instrumental**: Soft arpeggios, no beat
  - **Nature**: Rain and wind sounds
  - **Frequency**: 10 Hz binaural (use headphones)
  - **Ambient**: Atmospheric soundscapes
  - **Silence**: No audio, pure focus
- All audio generated using **Web Audio API** (no files required)
- Visual cards with distinct colors and icons

### 📅 Session History
- Complete list of all study sessions
- Session details: audio type, task, duration, timestamp
- Before/after metrics for focus, stress, and mood
- Delete individual sessions
- Empty state with call-to-action

### 📈 Analytics
- **Audio type comparison** charts
- Switch between Focus, Stress Reduction, and Mood metrics
- Bar charts showing average change per audio type
- Session count display for each audio type
- Color-coded visualizations

### 👤 Profile
- **Personal information** with name customization
- **Weekly goal setting** (30-600 minutes)
- **Data management:**
  - Load sample data (20 example sessions)
  - Clear all sessions
- Local storage information

## 🎨 Design System

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| **Obsidian** | `#09070D` | Main background |
| **Matte Charcoal** | `#15111D` | Cards and panels |
| **Electric Violet** | `#8B35FF` | Primary actions |
| **Neon Purple** | `#BF5AFF` | Highlights and active states |
| **Soft Lavender** | `#C9B4FF` | Secondary accents |
| **Muted Grey** | `#938B9E` | Secondary text |
| **White** | `#F7F3FF` | Primary text |

### Design Principles
- **Purple-dominant** aesthetic with controlled neon accents
- **Subtle glowing effects** on interactive elements
- **Smooth transitions** and animations
- **Card-based layout** with consistent border radius
- **Premium typography** using Bricolage Grotesque and DM Sans
- **Responsive grid system** for flexible layouts

## 🏗️ Architecture

### Technology Stack
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Web Audio API** - Synthetic audio generation
- **LocalStorage** - Client-side data persistence
- **Font Awesome** - Icon library

### File Structure
```
MoodBeats/
├── frontend/           # React + Vite application (see Project Structure above)
│   └── ...
│   ├── index-legacy.html  # Original vanilla-JS entry point
│   ├── script.js          # Legacy application logic and audio engine
│   ├── style.css          # Legacy design system
│   └── react-app.js       # Legacy placeholder
└── docs/               # Documentation and reports
```

> **Note:** The active application is the React app in `frontend/`. The legacy
> vanilla-JS files (`index-legacy.html`, `script.js`, `style.css`,
> `react-app.js`) are kept for reference.

### Key Functions

#### Audio Engine
- `startAudio(type)` - Initializes Web Audio API context for selected type
- `stopAudio()` - Cleans up audio sources and timers
- `noise(brown)` - Generates white/brown noise
- `note(freq, time, duration, type, vol, dest)` - Plays synthesized notes

#### Navigation
- `go(view)` - Changes active view
- `render()` - Updates DOM based on current state

#### Session Management
- `startSes()` - Begins study session with timer
- `togglePause()` - Pauses/resumes session
- `finish()` - Ends session and shows post-check-in
- `saveSes()` - Saves completed session to localStorage

#### Data & Analytics
- `agg(list)` - Aggregates session data by audio type
- `chart(g, metric)` - Generates SVG bar charts
- `save()` - Persists sessions to localStorage

## 💾 Data Storage

### LocalStorage Keys
- `moodbeats:sessions` - Array of session objects
- `moodbeats:goal` - Weekly study goal in minutes
- `moodbeats:userName` - User's display name

### Session Data Structure
```javascript
{
  id: timestamp,
  ts: timestamp,
  task: string,
  audio: string,
  mins: number,
  pre: {
    mood: 1-5,
    stress: 1-10,
    focus: 1-10
  },
  post: {
    mood: 1-5,
    stress: 1-10,
    focus: 1-10
  }
}
```

## 🔄 Migration from StudyBeats

The application automatically migrates data from the old `studybeats:` keys to new `moodbeats:` keys on first load. Existing sessions are preserved.

## 🎯 Functionality Preserved

All original StudyBeats functionality has been maintained:

✅ Mood selection (5 emoji options)  
✅ Stress level slider (1-10)  
✅ Focus level slider (1-10)  
✅ Task selection (6 categories)  
✅ Audio selection (now 6 types)  
✅ Study timer with vinyl record animation  
✅ Pause/resume functionality  
✅ Session completion workflow  
✅ After-study check-in  
✅ Session history with timestamps  
✅ Session deletion  
✅ LocalStorage persistence  
✅ Dashboard calculations and statistics  
✅ Weekly goal tracking  

## 📱 Responsive Design

The application is fully responsive:

- **Desktop** (>1024px): Full sidebar and dashboard layout
- **Tablet** (640px-1024px): Adjusted grid and spacing
- **Mobile** (<640px): Single column layout, stacked components

## ♿ Accessibility

- **ARIA labels** on all interactive elements
- **Keyboard navigation** support
- **Focus indicators** on all focusable elements
- **Semantic HTML** structure
- **Alt text** for decorative elements
- **Color contrast** meets WCAG AA standards
- **Reduced motion** support for animations

## 🚀 Getting Started

1. **Install and start the dev server** (see Installation & Commands above):
   `cd frontend && npm install && npm run dev`
2. **Enter your name** in Profile settings (optional)
3. **Set your weekly goal** in Profile (default: 150 minutes)
4. **Start your first session** from Dashboard or Study page
5. **Complete the session** to see analytics

## 📊 Understanding Metrics

### Focus Change
Positive values indicate improved focus after the session.

### Stress Reduction
Calculated as `pre-stress minus post-stress`. Positive values mean reduced stress.

### Mood Change
Positive values indicate improved mood after the session.

## ⚠️ Important Notes

- All data is stored **locally** in your browser
- No data is sent to any server
- Clearing browser data will erase all sessions
- Audio is **synthetically generated** - no audio files are loaded
- Metrics represent **self-reported personal patterns**, not scientific proof
- Patterns become more reliable after multiple sessions (minimum 3 recommended)

## 🎨 Customization

### Changing Colors
Edit CSS custom properties in `frontend/style.css` (legacy app):
```css
:root {
  --obsidian: #09070D;
  --electric-violet: #8B35FF;
  --neon-purple: #BF5AFF;
  /* ... */
}
```

### Adding Audio Types
Edit the `AUDIO` array in `frontend/script.js` (legacy app) — for the React app, edit `frontend/src/utils/constants.js` and `frontend/src/utils/audioEngine.js`.

### Modifying Tasks
Edit the `TASKS` array in `frontend/script.js` (legacy app) or `frontend/src/utils/constants.js` (React app):
```javascript
const TASKS = ['Reading', 'Writing', 'Problem solving', ...];
```

## 🐛 Troubleshooting

### Audio not playing
- Check browser compatibility with Web Audio API
- Ensure browser tab is not muted
- Check volume slider position

### Data not saving
- Verify localStorage is enabled in browser
- Check available storage quota
- Try clearing old data if storage is full

### Timer not starting
- Check JavaScript console for errors
- Ensure all files are loaded correctly
- Try refreshing the page

## 🔮 Future Enhancements

Potential features for future versions:
- [ ] Pomodoro timer integration
- [ ] Custom audio file uploads
- [ ] Export data as CSV/JSON
- [ ] Dark/Light theme toggle
- [ ] Spotify/Apple Music integration
- [ ] Team/collaborative features
- [ ] Mobile app version
- [ ] Cloud sync capability

## 📝 License

This project is available for personal and educational use.

## 🤝 Credits

- **Design inspiration**: Modern productivity apps
- **Typography**: Bricolage Grotesque, DM Sans (Google Fonts)
- **Icons**: Font Awesome 6.4.0
- **Audio**: Web Audio API synthetic generation

---

**Built with focus, designed for productivity. 🎯✨**
