import React, { forwardRef, useRef, useImperativeHandle, useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Coin = forwardRef(({ type = 'gold' }, ref) => {
  const coinGLTF = useGLTF('/coin.glb'); 
  const groupRef = useRef();
  const boundingBox = useRef();

  // Rotate and shine every frame
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.05; // Rotate around Y
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.002) * 0.2; // subtle wobble

      // Shine effect
      groupRef.current.traverse((child) => {
        if (child.isMesh) {
          if (!child.material.emissive) child.material.emissive = new THREE.Color(0xffff66);
          child.material.emissiveIntensity = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
        }
      });
    }
  });

  useImperativeHandle(ref, () => ({
    getBoundingBox: () => {
      if (!groupRef.current) return null;
      boundingBox.current = new THREE.Box3().setFromObject(groupRef.current);
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

  // Enable shadows
  useMemo(() => {
    coinGLTF.scene.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = true;
    });
  }, [coinGLTF.scene]);

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <Clone object={coinGLTF.scene} scale={[1.5, 1.5, 1.5]} />
    </group>
  );
});

useGLTF.preload(['/coin.glb']);
export default Coin;
