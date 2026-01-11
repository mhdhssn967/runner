import { forwardRef, useImperativeHandle, useRef } from 'react'
import Coin from './Coin'

const CoinManager = forwardRef(({ segmentLength, lanePositions }, ref) => {
  const coinRefs = useRef([])

  /* ================== TUNABLE VARIABLES ================== */

  const MAX_COINS_PER_LINE = 5
  const MIN_COINS_PER_LINE = 1

  const MAX_LINES_PER_SEGMENT = 3
  const COIN_SPACING = 3
  const LINE_GAP = 10

  const LANE_INSET = 1 // ✅ keeps coins away from edges

  /* ======================================================= */

  const TOTAL_POOL_SIZE =
    MAX_COINS_PER_LINE * MAX_LINES_PER_SEGMENT

  const coinPool = Array.from({ length: TOTAL_POOL_SIZE }, (_, i) => i)

  useImperativeHandle(ref, () => ({
    getCoins: () => coinRefs.current,

    randomize: () => {
      coinRefs.current.forEach((coin) => coin?.collect())

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

        const baseLane =
          lanePositions[
            Math.floor(Math.random() * lanePositions.length)
          ]

        const lane =
          baseLane > 0
            ? baseLane - LANE_INSET
            : baseLane < 0
            ? baseLane + LANE_INSET
            : baseLane

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
          position={[0, -100, 0]}
        />
      ))}
    </group>
  )
})

export default CoinManager
