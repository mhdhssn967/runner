import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import Coin from './Coin';

const CoinSpawner = forwardRef(({ segmentLength, lanePositions, onCollect }, ref) => {
  const coinRefs = useRef([]);
  const coinsPerSegment = Math.floor(Math.random() * 10) + 1; // 1-10 coins

  useImperativeHandle(ref, () => ({
    randomize: () => {
      coinRefs.current.forEach((coin, i) => {
        if (!coin) return;

        if (i < coinsPerSegment) {
          coin.visible = true;
          coin.position.x = lanePositions[Math.floor(Math.random() * lanePositions.length)];
          coin.position.z = -(Math.random() * segmentLength);
        } else {
          coin.visible = false;
        }
      });
    },
    getCoins: () => coinRefs.current
  }));

  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Coin
          key={i}
          ref={(el) => (coinRefs.current[i] = el)}
        />
      ))}
    </>
  );
});

export default CoinSpawner;
