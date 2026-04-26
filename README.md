# FITPACK

**Fitness accountability for friend groups.** Log your meals, get judged by your friends, and pay up when you slip.

🔗 **Live App → [fitpack-henna.vercel.app](https://fitpack-henna.vercel.app)**

---

## What It Does

FitPack turns fitness accountability into a social game. You log your meals with photos, your friends vote on whether they're on track, and rejected meals cost you ₹50. No excuses.

- **Log 3 meals a day** with photos and macros
- **Friends judge your meals** — approve or reject
- **Rejected meal = ₹50 penalty** added to your balance
- **Earn points** for logging, judging, and keeping streaks
- **Leaderboard** shows who's winning and who owes money

---

## Features

| Feature | Description |
|---|---|
| Meal Logging | Upload a food photo, add name, calories, protein, carbs, fat |
| Community Feed | See your friends' meals and vote approve / reject |
| Streak Tracking | Log all 3 meals daily to grow your streak |
| Points System | Earn points for every action |
| Leaderboard | Rank by points or streak length |
| Weight Tracker | Log daily weight and see a weekly chart |
| Penalty Balance | Track how much each person owes the group |

### Points Breakdown

| Action | Points |
|---|---|
| Log a meal with photo | +3 pts |
| Log all 3 meals in a day | +10 pts |
| Judge someone's meal | +5 pts |
| Log your weight | +2 pts |
| 7-day streak bonus | +25 pts |

---

## Tech Stack

- **Frontend** — React 19, React Router 7
- **Backend / DB** — Supabase (Postgres + Auth + Storage)
- **Hosting** — Vercel
- **Styling** — Custom CSS, dark theme with lime accent
- **Utilities** — date-fns, react-hot-toast

---

## Run Locally

```bash
git clone https://github.com/AnahadhBirdh/fitpack.git
cd fitpack
npm install
```

Create a `.env` file:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm start
```

App runs at `http://localhost:3000`

> See `src/DEPLOY.md` for full Supabase + Vercel setup instructions.

---

## Use It on Mobile

Open the live URL in Chrome or Safari on your phone → Share → Add to Home Screen. Works like a native app.
