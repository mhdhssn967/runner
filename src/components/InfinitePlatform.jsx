import React, {
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import SpawnManager from './SpawnManager';
import CoinSpawner from './CoinSpawner';

const InfinitePlatform = forwardRef(({ isPlaying }, ref) => {
  const { scene } = useGLTF('/platform.glb');

  const segmentLength = 87.3;
  const numSegments = 4;
  const speed = 0.3;
  const lanePositions = [-1.9, 0, 1.9];
  const totalLength = segmentLength * numSegments;
  const resetThreshold = 160;

  const segmentRefs = useRef([]);
  const spawnerRefs = useRef([]);
  const allObstacleRefs = useRef([]);

  useFrame((state, delta) => {
    if (!isPlaying) return;
    const frameSpeed = speed * (delta * 60);

    segmentRefs.current.forEach((group, i) => {
      if (!group) return;

      group.position.z += frameSpeed;

      if (group.position.z > resetThreshold) {
        group.position.z -= totalLength;
        spawnerRefs.current[i]?.randomize();
      }
    });
  });

  // 🔑 Expose all obstacles to parent (Game → Player)
  useImperativeHandle(ref, () => ({
    getAllObstacles: () => allObstacleRefs.current
  }));

  return (
    <group>
      {[...Array(numSegments)].map((_, i) => (
        <group
          key={i}
          ref={(el) => (segmentRefs.current[i] = el)}
          position={[0, 0, -i * segmentLength]}
        >
          {/* Platform */}
          <group position={[0.3, 0.1, 0]}>
            <Clone object={scene} deep receiveShadow />
          </group>

          {/* Spawner */}
          <CoinSpawner/>
          
          <SpawnManager
  ref={(el) => {
    spawnerRefs.current[i] = el;

    // ✅ REGISTER OBSTACLES ONLY ONCE
    if (el && !el._registered) {
      const obstacles = el.getObstacles?.();
      if (obstacles) {
        allObstacleRefs.current.push(...obstacles);
        el._registered = true; // 🔐 prevents duplicates
      }
    }
  }}
  segmentLength={segmentLength}
  lanePositions={lanePositions}
/>

        </group>
      ))}
    </group>
  );
});

export default InfinitePlatform;
