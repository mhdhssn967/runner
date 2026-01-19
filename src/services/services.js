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

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  const playRef = doc(
    db,
    "companies",
    companyId,
    "users",
    user.uid,
    "plays",
    today
  )

  const snap = await getDoc(playRef)

  // 🆕 First play today
  if (!snap.exists()) {
    await setDoc(playRef, {
      score: newScore,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return
  }

  const currentScore = snap.data()?.score

  // 🔁 Same day → only update if higher
  if (currentScore === undefined || newScore > currentScore) {
    await updateDoc(playRef, {
      score: newScore,
      updatedAt: serverTimestamp()
    })
  }
}


export async function fetchPlayerScore(companyId) {
  const user = auth.currentUser
  if (!user || !companyId) return null

  const today = new Date().toISOString().split("T")[0]

  const playRef = doc(
    db,
    "companies",
    companyId,
    "users",
    user.uid,
    "plays",
    today
  )

  const snap = await getDoc(playRef)
  if (!snap.exists()) return null

  return snap.data()?.score ?? null
}
