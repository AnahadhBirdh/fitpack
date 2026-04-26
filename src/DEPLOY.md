# 🚀 FitPack — Deployment Guide
> Get your app live on the internet in ~15 minutes. Free tier.

---

## STEP 1: Set Up Supabase (Free Database + Auth + Storage)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"** → give it a name like `fitpack` → set a password → create
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** (left sidebar)
5. Paste the entire contents of `SUPABASE_SCHEMA.sql` and click **Run**
6. You should see "Success. No rows returned"

**Get your keys:**
- Go to **Settings → API**
- Copy:
  - `Project URL` → this is your `SUPABASE_URL`
  - `anon public` key → this is your `SUPABASE_ANON_KEY`

---

## STEP 2: Set Up the Project Locally

```bash
# Install dependencies
cd fitpack
npm install

# Create environment file
touch .env
```

Open `.env` and paste:
```
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Replace with YOUR actual values from Step 1)

**Test locally:**
```bash
npm start
```
App opens at http://localhost:3000 ✅

---

## STEP 3: Deploy to Vercel (Free Hosting)

### Option A: GitHub (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial FitPack commit"
git remote add origin https://github.com/YOUR_USERNAME/fitpack.git
git push -u origin main
```

2. Go to **https://vercel.com** → Sign up with GitHub
3. Click **"New Project"** → Import your `fitpack` repo
4. In **Environment Variables**, add:
   - `REACT_APP_SUPABASE_URL` = your URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your key
5. Click **Deploy**

🎉 You'll get a URL like `https://fitpack-xyz.vercel.app` — share this with friends!

### Option B: Direct Deploy (No GitHub needed)

```bash
npm install -g vercel
npm run build
vercel deploy --prod
```
Follow the prompts, add env variables when asked.

---

## STEP 4: Enable Email Auth in Supabase

1. Go to **Authentication → Providers** in Supabase
2. Email is enabled by default ✅
3. Optional: Go to **Authentication → Email Templates** to customize signup email

---

## STEP 5: Share with Friends

Send them your Vercel URL. They:
1. Click Sign Up
2. Enter their name, email, password, calorie goal
3. Verify their email (Supabase sends a link)
4. Start logging meals and judging each other! 🔥

---

## 🔧 How the Penalty System Works

- When you **log a meal**, it appears in the Community feed for others to judge
- Friends click **"Approve"** or **"Reject"**
- If rejected → ₹50 is added to your penalty balance
- You can see everyone's penalty balance on the leaderboard
- Pay up IRL (honor system / UPI / cash to your friend group)

---

## 📱 Make it Feel Like an App on Mobile

On your phone:
1. Open the Vercel URL in Chrome/Safari
2. Tap the share button → "Add to Home Screen"
3. Now it's on your home screen like a real app!

---

## 🛠️ Customization Tips

| What to change | File | Line |
|---|---|---|
| Penalty amount (₹50) | `src/pages/CommunityPage.jsx` | `const PENALTY_AMOUNT = 50` |
| Points for each action | `src/pages/MealsPage.jsx` | Search for `total_points` |
| App name | `public/index.html` | `<title>` tag |
| Color scheme | `src/index.css` | `:root` variables |

---

## 💡 Troubleshooting

**"Failed to upload photo"** → Go to Supabase → Storage → Check `food-photos` bucket is public

**"Cannot read profile"** → Re-run the SQL schema in Supabase SQL Editor

**App won't build** → Make sure `.env` file has correct values, no spaces around `=`

---

Good luck! Now go crush it 🔥
