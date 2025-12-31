import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect
} from 'react';
import Obstacle from './Obstacle';

const SpawnManager = forwardRef(({ segmentLength, lanePositions }, ref) => {
  const obstacleFrequency = 1;
  const obstaclesPerSegment = 5;
  const obstacleTypes = ['rock', 'trap', 'pole'];

  const obstacleRefs = useRef([]);
  const canSpawnRef = useRef(false);

  // ⛔ Hide everything immediately
  useEffect(() => {
    obstacleRefs.current.forEach((obs) => {
      if (!obs) return;
      obs.visible = false;
    });

    const timer = setTimeout(() => {
      canSpawnRef.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useImperativeHandle(ref, () => ({
    randomize: () => {
      // 🚫 Do nothing before 5 seconds
      if (!canSpawnRef.current) return;

      obstacleRefs.current.forEach((obs) => {
        if (!obs) return;

        if (Math.random() > obstacleFrequency) {
          obs.visible = false;
          return;
        }

        obs.visible = true;
        obs.position.x =
          lanePositions[Math.floor(Math.random() * lanePositions.length)];
        obs.position.z = -Math.random() * segmentLength;
      });
    }
  }));

  return (
    <>
      {Array.from({ length: obstaclesPerSegment }).map((_, i) => (
        <Obstacle
          key={i}
          ref={(el) => (obstacleRefs.current[i] = el)}
          type={
            obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
          }
        />
      ))}
    </>
  );
});

export default SpawnManager;
