# Testing Training Load & Recovery Feature

## 🧪 Local Testing Instructions

### Prerequisites
1. Make sure you're on the `dev` branch
2. Have your `.env` file configured (see main README)
3. Strava and Oura OAuth settings configured for localhost

### Start the Server

```bash
cd /Users/dereklin/strava-oura
npm start
```

Server will start at: http://localhost:3000

### Testing Checklist

#### ✅ **1. Training Load Ratio (ACWR)**
- [ ] Card displays correctly with ratio value
- [ ] Shows 7-day and 28-day averages
- [ ] Risk level indicator changes color (green/yellow/red)
- [ ] Recommendation text is appropriate for risk level

**Expected values:**
- Optimal: 0.8 - 1.3 (green)
- Moderate: 1.3 - 1.5 (yellow/orange)
- High: > 1.5 (red)

#### ✅ **2. Recovery Score**
- [ ] "Today's Recovery" card shows current score
- [ ] Displays sleep and readiness scores if available
- [ ] Recovery level label is correct (Excellent/Good/Fair/Poor)

**Expected levels:**
- Excellent: 85+
- Good: 70-84
- Fair: 50-69
- Poor: <50

#### ✅ **3. Daily Recommendation**
- [ ] Shows actionable training advice
- [ ] Color-coded by intensity (green=hard, blue=moderate, yellow=easy, red=rest)
- [ ] Training intensity level displayed

#### ✅ **4. 14-Day Calendar**
- [ ] Shows last 14 days in grid view
- [ ] Each day has colored border (green/blue/yellow/red)
- [ ] Recommendation text is appropriate for recovery data
- [ ] Displays recovery scores and distance if available
- [ ] Days without data show "No data available"

#### ✅ **5. UI/UX**
- [ ] All cards render properly
- [ ] Gradient backgrounds look good
- [ ] Responsive on mobile (< 768px width)
- [ ] Hover effects work
- [ ] No console errors
- [ ] Feature hidden on single-day view

#### ✅ **6. Edge Cases**
- [ ] Works with less than 28 days of data (should show message)
- [ ] Handles missing sleep/readiness data gracefully
- [ ] Shows appropriate message when no recovery data available
- [ ] Doesn't break with 0 distance days

### Test Data Scenarios

1. **New User (< 7 days)**
   - Should show: "Need at least 7 days of data"

2. **Normal Training (7-28 days)**
   - Should show: ACWR, Recovery, Recommendations
   - Calendar shows available days

3. **Full Data (28+ days)**
   - Should show: All features including 7-day recovery trend
   - Full 14-day calendar

4. **High Training Load**
   - Increase distance sharply
   - ACWR should show red warning

5. **Low Recovery**
   - Check with sleep score < 70 or readiness < 65
   - Should recommend rest

### Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile (iOS Safari / Android Chrome)

### Performance
- [ ] Page loads < 2 seconds
- [ ] No lag when changing date ranges
- [ ] Calculations complete quickly

## 🐛 Known Issues to Watch For

1. Date timezone inconsistencies
2. Missing data handling
3. Divide by zero in ACWR calculation
4. Calendar grid overflow on small screens

## 📝 Notes

Add any bugs or observations here during testing:

---

## ✅ Mark as Complete

Once all tests pass, mark TODO as completed and merge to main.

