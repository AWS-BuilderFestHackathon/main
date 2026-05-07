import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function FloatingParticles() {
  const ref = useRef();
  const particles = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 200; i++) {
      pos.push((Math.random() - 0.5) * 10, Math.random() * 10 - 5, (Math.random() - 0.5) * 10);
    }
    return new Float32Array(pos);
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.05;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += Math.sin(state.clock.elapsedTime + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={particles} stride={3}>
      <PointMaterial transparent color="#6366f1" size={0.025} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  );
}

export const LightBackground = () => (
  <div className="fixed inset-0 -z-10">
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <FloatingParticles />
    </Canvas>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pointer-events-none" />
  </div>
);
