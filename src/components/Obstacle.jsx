import React, {
  forwardRef,
  useRef,
  useImperativeHandle
} from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

const HITBOX_MARGIN = 0.5; // 🔧 Tweak this (0.2–0.4 ideal)

const Obstacle = forwardRef(({ type }, ref) => {
  const rock = useGLTF('/rock.glb');
  const trap = useGLTF('/trap.glb');
  const pole = useGLTF('/pole.glb');

  const models = {
    rock: rock.scene,
    trap: trap.scene,
    pole: pole.scene
  };

  const groupRef = useRef();
  const boundingBox = useRef(new THREE.Box3());

  useImperativeHandle(ref, () => ({
    getBoundingBox: () => {
      if (!groupRef.current) return null;

      boundingBox.current.setFromObject(groupRef.current);

      // 🔒 SHRINK HITBOX
      boundingBox.current.min.x += HITBOX_MARGIN;
      boundingBox.current.max.x -= HITBOX_MARGIN;

      boundingBox.current.min.y += HITBOX_MARGIN;
      boundingBox.current.max.y -= HITBOX_MARGIN;

      boundingBox.current.min.z += HITBOX_MARGIN;
      boundingBox.current.max.z -= HITBOX_MARGIN;

      return boundingBox.current;
    },

    set visible(val) {
      if (groupRef.current) groupRef.current.visible = val;
    },

    get visible() {
      return groupRef.current?.visible;
    },

    position: groupRef.current?.position
  }));

  return (
    <group ref={groupRef}>
      <Clone
        object={models[type] || rock.scene}
        castShadow
        
      />
    </group>
  );
});

useGLTF.preload(['/rock.glb', '/trap.glb', '/pole.glb']);
export default Obstacle;
