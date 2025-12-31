import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import SpawnManager from './SpawnManager';

const InfinitePlatform = ({ isPlaying,setStrikeZoneCoordinates }) => {
  const { scene } = useGLTF('/platform.glb');

  const segmentLength = 87.3;
  const numSegments = 4;
  const speed = 0.3;
  const lanePositions = [-1.7, 0, 1.7];
  const totalLength = segmentLength * numSegments;
  const resetThreshold = 160;

  const segmentRefs = useRef([]);
  const spawnerRefs = useRef([]);

  useFrame((state, delta) => {
    if (!isPlaying) return;
    const frameSpeed = speed * (delta * 60);

    segmentRefs.current.forEach((group, i) => {
      if (!group) return;
      group.position.z += frameSpeed;

      if (group.position.z > resetThreshold) {
        group.position.z -= totalLength;
        // Tell the specific spawner for this segment to randomize
        spawnerRefs.current[i]?.randomize();
      }
    });
  });

  return (
    <group>
      {[...Array(numSegments)].map((_, i) => (
        <group
          key={i}
          ref={(el) => (segmentRefs.current[i] = el)}
          position={[0, 0, -i * segmentLength]}
        >
          {/* Platform Model */}
          <group position={[0.2, 0.1, 0]}>
            <Clone object={scene} deep receiveShadow />
          </group>

          {/* New Spawner Component */}
          <SpawnManager 
            ref={(el) => (spawnerRefs.current[i] = el)}
            segmentLength={segmentLength}
            lanePositions={lanePositions}
            setStrikeZoneCoordinates={setStrikeZoneCoordinates}
          />
        </group>
      ))}
    </group>
  );
};

export default InfinitePlatform;