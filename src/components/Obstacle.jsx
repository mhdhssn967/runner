import React, { forwardRef } from 'react';
import { useGLTF, Clone } from '@react-three/drei';

const Obstacle = forwardRef(({ type }, ref) => {
  const rock = useGLTF('/rock.glb');
  const trap = useGLTF('/trap.glb');
  const pole = useGLTF('/pole.glb');

  const models = { rock: rock.scene, trap: trap.scene, pole: pole.scene };

  return (
    <group ref={ref}>
      <Clone object={models[type] || rock.scene} castShadow  />
    </group>
  );
});

useGLTF.preload(['/rock.glb', '/trap.glb', '/pole.glb']);
export default Obstacle;