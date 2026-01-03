import { forwardRef, useImperativeHandle, useRef } from 'react'
import Coin from './Coin'

const CoinManager = forwardRef(({ segmentLength, lanePositions }, ref) => {
  const coinRefs = useRef([])
  
  // Define how many coins per line and how many lines per segment
  const COINS_PER_LINE = 5
  const LINE_SPACING = 2 // distance between coins in a line
  const NUM_LINES = 3    // how many separate lines of coins per segment

  // Create a flat array for the initial render (Total coins = 15)
  const totalCoinsCount = COINS_PER_LINE * NUM_LINES
  const initialCoins = Array.from({ length: totalCoinsCount }, (_, i) => i)

  useImperativeHandle(ref, () => ({
    getCoins: () => coinRefs.current,

    randomize: () => {
      // Randomize each "Line" rather than each coin
      for (let lineIdx = 0; lineIdx < NUM_LINES; lineIdx++) {
        const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)]
        const startZ = -(Math.random() * (segmentLength - (COINS_PER_LINE * LINE_SPACING)))

        for (let i = 0; i < COINS_PER_LINE; i++) {
          const coinIdx = lineIdx * COINS_PER_LINE + i
          const finalZ = startZ - (i * LINE_SPACING)
          coinRefs.current[coinIdx]?.reset(lane, finalZ)
        }
      }
    }
  }))

  return (
    <group>
      {initialCoins.map((_, i) => (
        <Coin
          key={i}
          ref={(el) => (coinRefs.current[i] = el)}
          // Initial positions (will be randomized immediately when segment recycles)
          position={[0, 1, -i * LINE_SPACING]} 
        />
      ))}
    </group>
  )
})

export default CoinManager