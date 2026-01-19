import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore"
import { auth, db } from "../../firebaseConfig"

export async function updatePlayerScore(newScore, companyId) {
  const user = auth.currentUser
  if (!user || !companyId) return

  const userRef = doc(db, "companies", companyId, "users", user.uid)
  const snap = await getDoc(userRef)

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  // 🆕 If no document exists
  if (!snap.exists()) {
    await setDoc(userRef, {
      player: {
        score: newScore,
        scoreDate: today,
        lastPlayedAt: serverTimestamp()
      }
    })
    return
  }

  const player = snap.data().player || {}
  const lastScoreDate = player.scoreDate
  const currentScore = player.score

  // 🆕 New day → always allow score
  if (lastScoreDate !== today) {
    await updateDoc(userRef, {
      "player.score": newScore,
      "player.scoreDate": today,
      "player.lastPlayedAt": serverTimestamp()
    })
    return
  }

  // 🟡 Same day → only update if higher
  if (currentScore === undefined || newScore > currentScore) {
    await updateDoc(userRef, {
      "player.score": newScore,
      "player.lastPlayedAt": serverTimestamp()
    })
  }
}





export async function fetchPlayerScore(companyId) {
  const user = auth.currentUser
  if (!user || !companyId) return null

  const userRef = doc(db, "companies", companyId, "users", user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) return null

  const player = snap.data().player
  if (!player) return null

  const today = new Date().toISOString().split("T")[0]

  // ❗ Only return score if it belongs to today
  if (player.scoreDate === today) {
    return player.score ?? null
  }

  return null
}

