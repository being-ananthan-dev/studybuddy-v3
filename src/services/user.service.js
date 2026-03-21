import { ref, set, get, update, serverTimestamp, increment } from 'firebase/database'
import { rtdb } from './firebase.config'

/**
 * Initialize a new user's profile in the database.
 * Called once after first signup or Google sign-in.
 */
export async function initUserProfile(user) {
  const userRef = ref(rtdb, `users/${user.uid}`)
  const snapshot = await get(userRef)

  if (snapshot.exists()) {
    // Existing user — update last login time
    await update(userRef, {
      lastLogin: serverTimestamp(),
      displayName: user.displayName || snapshot.val().displayName,
      photoURL: user.photoURL || snapshot.val().photoURL,
      email: user.email || snapshot.val().email,
    })
    return { isNew: false, profile: snapshot.val() }
  }

  // New user — create fresh profile
  const newProfile = {
    displayName: user.displayName || 'Student',
    email: user.email || '',
    photoURL: user.photoURL || '',
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    stats: {
      streak: 0,
      totalMinutes: 0,
      notesCount: 0,
      badgesCount: 0,
      sessionsCount: 0,
      plansCreated: 0,
      testsCompleted: 0,
      lastActiveDate: null,
    },
    // Per-day activity heatmap (last 35 days stored as { "2026-03-21": 3 })
    heatmap: {},
    settings: {
      theme: 'dark',
      age: 'college',
      mood: 'neutral',
    },
  }

  await set(userRef, newProfile)
  return { isNew: true, profile: newProfile }
}

/**
 * Get the user's profile from the database.
 */
export async function getUserProfile(uid) {
  const snapshot = await get(ref(rtdb, `users/${uid}`))
  return snapshot.exists() ? snapshot.val() : null
}

/**
 * Get the user's stats.
 */
export async function getUserStats(uid) {
  const snapshot = await get(ref(rtdb, `users/${uid}/stats`))
  return snapshot.exists() ? snapshot.val() : null
}

/**
 * Record a study activity. Call this when a user:
 * - Completes a Pomodoro session
 * - Uses the AI Tutor
 * - Creates a study plan
 * - Saves a note
 * - Completes an oral test
 * etc.
 */
export async function logActivity(uid, type, durationMinutes = 0) {
  const today = new Date().toISOString().split('T')[0] // "2026-03-21"
  const statsRef = ref(rtdb, `users/${uid}/stats`)
  const heatmapRef = ref(rtdb, `users/${uid}/heatmap/${today}`)

  // Get current heatmap value for today
  const heatSnap = await get(heatmapRef)
  const currentLevel = heatSnap.exists() ? heatSnap.val() : 0
  const newLevel = Math.min(currentLevel + 1, 4) // Max level 4

  // Update stats based on activity type
  const updates = {
    sessionsCount: increment(1),
    lastActiveDate: today,
  }

  if (durationMinutes > 0) {
    updates.totalMinutes = increment(durationMinutes)
  }

  switch (type) {
    case 'note':
      updates.notesCount = increment(1)
      break
    case 'plan':
      updates.plansCreated = increment(1)
      break
    case 'test':
      updates.testsCompleted = increment(1)
      break
    case 'badge':
      updates.badgesCount = increment(1)
      break
  }

  // Calculate streak
  const statsSnap = await get(statsRef)
  const currentStats = statsSnap.exists() ? statsSnap.val() : {}
  const lastActive = currentStats.lastActiveDate

  if (lastActive) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActive === yesterdayStr) {
      // Consecutive day — increment streak
      updates.streak = increment(1)
    } else if (lastActive !== today) {
      // Missed a day — reset streak to 1
      updates.streak = 1
    }
    // Same day — don't change streak
  } else {
    // First ever activity
    updates.streak = 1
  }

  await Promise.all([
    update(statsRef, updates),
    set(heatmapRef, newLevel),
  ])
}

/**
 * Get the user's heatmap data (last 35 days).
 */
export async function getUserHeatmap(uid) {
  const snapshot = await get(ref(rtdb, `users/${uid}/heatmap`))
  if (!snapshot.exists()) return {}
  return snapshot.val()
}
