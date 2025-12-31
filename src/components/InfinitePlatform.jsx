import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import SpawnManager from './SpawnManager';
import CoinSpawner from './CoinSpawner';

const InfinitePlatform = forwardRef(({ isPlaying }, ref) => {
  const { scene } = useGLTF('/platform.glb');

  const segmentLength = 87.3;
  const numSegments = 4;
  const speed = 0.3;
  const lanePositions = [-1.7, 0, 1.7];
  const totalLength = segmentLength * numSegments;
  const resetThreshold = 160;

  const segmentRefs = useRef([]);
  const spawnerRefs = useRef([]);
  const coinSpawnerRefs = useRef([]);

  // Track refs **per segment only**, do not push into global array
  const allObstacleRefs = useRef([]);
  const allCoinRefs = useRef([]);

  useFrame((state, delta) => {
    if (!isPlaying) return;
    const frameSpeed = speed * delta * 60;

    segmentRefs.current.forEach((group, i) => {
      if (!group) return;

      group.position.z += frameSpeed;

      if (group.position.z > resetThreshold) {
        group.position.z -= totalLength;

        // Randomize obstacles & coins only when segment resets
        spawnerRefs.current[i]?.randomize();
        coinSpawnerRefs.current[i]?.randomize();
      }
    });
  });

  useImperativeHandle(ref, () => ({
    getAllObstacles: () => spawnerRefs.current.flatMap((s) => s.getObstacles?.() || []),
    getAllCoins: () => coinSpawnerRefs.current.flatMap((c) => c.getCoins?.() || [])
  }));

  return (
    <group>
      {[...Array(numSegments)].map((_, i) => (
        <group
          key={i}
          ref={(el) => (segmentRefs.current[i] = el)}
          position={[0, 0, -i * segmentLength]}
        >
          <group position={[0.2, 0.1, 0]}>
            <Clone object={scene} deep receiveShadow />
          </group>

          {/* Obstacles */}
          <SpawnManager
            ref={(el) => (spawnerRefs.current[i] = el)}
            segmentLength={segmentLength}
            lanePositions={lanePositions}
          />

          {/* Coins */}
          <CoinSpawner
            ref={(el) => (coinSpawnerRefs.current[i] = el)}
            segmentLength={segmentLength}
            lanePositions={lanePositions}
          />
        </group>
      ))}
    </group>
  );
});

export default InfinitePlatform;
