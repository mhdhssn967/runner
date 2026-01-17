
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

  // If user doc does not exist
  if (!snap.exists()) {
    await setDoc(userRef, {
      player: {
        score: newScore,
        lastPlayedAt: serverTimestamp()
      }
    })
    return
  }

  const currentScore = snap.data()?.player?.score

  // Update only if score doesn't exist OR new score is higher
  if (currentScore === undefined || newScore > currentScore) {
    await updateDoc(userRef, {
      "player.score": newScore,
      "player.lastPlayedAt": serverTimestamp()
    })
  }
}



export async function fetchPlayerScore(companyId) {
  const user = auth.currentUser
  if (!user) return null

  const userRef = doc(db,'companies',companyId, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) return null

  const score = snap.data()?.player?.score

  return score ?? null
}
