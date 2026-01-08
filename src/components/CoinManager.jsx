import { forwardRef, useImperativeHandle, useRef } from 'react'
import Coin from './Coin'

const CoinManager = forwardRef(({ segmentLength, lanePositions }, ref) => {
  const coinRefs = useRef([])

  /* ================== TUNABLE VARIABLES ================== */

  const MAX_COINS_PER_LINE = 5
  const MIN_COINS_PER_LINE = 1

  const MAX_LINES_PER_SEGMENT = 3   // max separate coin lines
  const COIN_SPACING = 3            // 👈 frequency control (lower = denser)
  const LINE_GAP = 10               // distance between different lines

  /* ======================================================= */

  // Pre-create enough coins (max possible)
  const TOTAL_POOL_SIZE =
    MAX_COINS_PER_LINE * MAX_LINES_PER_SEGMENT

  const coinPool = Array.from({ length: TOTAL_POOL_SIZE }, (_, i) => i)

  useImperativeHandle(ref, () => ({
    getCoins: () => coinRefs.current,

    randomize: () => {
      // Hide all coins first
      coinRefs.current.forEach((coin) => coin?.collect())

      // Decide how many lines appear this segment (0–MAX)
      const linesThisSegment = Math.floor(
        Math.random() * (MAX_LINES_PER_SEGMENT + 1)
      )

      let poolIndex = 0

      for (let line = 0; line < linesThisSegment; line++) {
        const coinsInLine =
          MIN_COINS_PER_LINE +
          Math.floor(
            Math.random() *
              (MAX_COINS_PER_LINE - MIN_COINS_PER_LINE + 1)
          )

        const lane =
          lanePositions[
            Math.floor(Math.random() * lanePositions.length)
          ]

        const startZ =
          -Math.random() * (segmentLength - LINE_GAP)

        for (let i = 0; i < coinsInLine; i++) {
          const coin = coinRefs.current[poolIndex]
          if (!coin) continue

          coin.reset(
            lane,
            startZ - i * COIN_SPACING
          )

          poolIndex++
        }
      }
    }
  }))

  return (
    <group>
      {coinPool.map((_, i) => (
        <Coin
          key={i}
          ref={(el) => (coinRefs.current[i] = el)}
          position={[0, -100, 0]} // 👈 hidden on start
        />
      ))}
    </group>
  )
})

export default CoinManager
