import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebaseConfig'

export async function updatePlayerScore(newScore) {
  const user = auth.currentUser
  if (!user) return

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  // If user doc does not exist at all
  if (!snap.exists()) {
    await setDoc(userRef, {
      player: {
        score: newScore,
      },
    })
    return
  }

  const currentScore = snap.data()?.player?.score

  // If score doesn't exist OR new score is higher
  if (currentScore === undefined || newScore > currentScore) {
    await updateDoc(userRef, {
      'player.score': newScore,
    })
  }
}


export async function fetchPlayerScore() {
  const user = auth.currentUser
  if (!user) return null

  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) return null

  const score = snap.data()?.player?.score

  return score ?? null
}
