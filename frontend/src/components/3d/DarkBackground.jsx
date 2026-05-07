import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random';

function StarField() {
  const ref = useRef();
  const sphere = useMemo(() => {
    return random.inSphere(new Float32Array(5000 * 3), { radius: 1.5 });
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#818cf8" size={0.002} sizeAttenuation depthWrite={false} blending={2} />
      </Points>
    </group>
  );
}

function ConnectedNodes() {
  const ref = useRef();
  const particles = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 100; i++) {
      pos.push((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    }
    return new Float32Array(pos);
  }, []);

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <Points ref={ref} positions={particles} stride={3}>
      <PointMaterial transparent color="#a78bfa" size={0.015} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export const DarkBackground = () => (
  <div className="fixed inset-0 -z-10">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <StarField />
      <ConnectedNodes />
    </Canvas>
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pointer-events-none" />
  </div>
);
