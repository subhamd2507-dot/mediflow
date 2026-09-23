"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const NODE_POSITIONS: [number, number, number][] = [
  [1.65, 0.45, 0.15],
  [-1.5, -0.5, 0.2],
  [0.15, 1.55, 0.1],
];

function OrbScene() {
  const orbGroup = useRef<THREE.Group>(null);
  const ringsGroup = useRef<THREE.Group>(null);

  const mouse = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x =
        (event.clientX / window.innerWidth - 0.5) * 2;

      mouse.current.y =
        (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const connectionGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    NODE_POSITIONS.forEach(([x, y, z]) => {
      points.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      );
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    return geometry;
  }, []);

  useFrame((state) => {
    if (orbGroup.current) {
      const targetRotationY =
        state.clock.elapsedTime * 0.18 +
        mouse.current.x * 0.12;

      const targetRotationX =
        mouse.current.y * 0.08;

      orbGroup.current.rotation.y = THREE.MathUtils.lerp(
        orbGroup.current.rotation.y,
        targetRotationY,
        0.025
      );

      orbGroup.current.rotation.x = THREE.MathUtils.lerp(
        orbGroup.current.rotation.x,
        targetRotationX,
        0.025
      );

      orbGroup.current.position.x = THREE.MathUtils.lerp(
  orbGroup.current.position.x,
  mouse.current.x * 0.10,
  0.025
);

orbGroup.current.position.y = THREE.MathUtils.lerp(
  orbGroup.current.position.y,
  Math.sin(state.clock.elapsedTime * 0.7) * 0.04 -
    mouse.current.y * 0.08,
  0.025
);
    }

    if (ringsGroup.current) {
      ringsGroup.current.rotation.z += 0.0015;
      ringsGroup.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      {/* Soft lighting */}
      <ambientLight intensity={0.5} />

      <pointLight
        position={[2.5, 2.5, 3]}
        intensity={4}
        distance={8}
        color="#22d3ee"
      />

      <pointLight
        position={[-2, -1, 2]}
        intensity={2.5}
        distance={7}
        color="#8b5cf6"
      />

      {/* Floating particles */}
      <Sparkles
        count={95}
        scale={[4.8, 4.8, 4.8]}
        size={2}
        speed={0.22}
        opacity={0.7}
        color="#67e8f9"
      />

      <Sparkles
        count={45}
        scale={[3.8, 3.8, 3.8]}
        size={1.4}
        speed={0.16}
        opacity={0.55}
        color="#a78bfa"
      />

      {/* Main orb */}
      <group ref={orbGroup}>

        {/* Outer glow shell */}
        <mesh>
          <sphereGeometry args={[1.65, 40, 40]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.055}
            depthWrite={false}
          />
        </mesh>

        {/* Futuristic wireframe */}
        <mesh>
          <sphereGeometry args={[1.5, 28, 28]} />
          <meshBasicMaterial
            color="#22d3ee"
            wireframe
            transparent
            opacity={0.48}
          />
        </mesh>

        {/* Inner energy sphere */}
        <mesh>
          <sphereGeometry args={[1.16, 40, 40]} />
          <meshStandardMaterial
            color="#0e7490"
            emissive="#0891b2"
            emissiveIntensity={1.8}
            roughness={0.25}
            metalness={0.25}
            transparent
            opacity={0.48}
          />
        </mesh>

        {/* Core */}
        <mesh>
          <sphereGeometry args={[0.72, 36, 36]} />
          <meshStandardMaterial
            color="#14b8a6"
            emissive="#22d3ee"
            emissiveIntensity={2.4}
            roughness={0.15}
            metalness={0.35}
            transparent
            opacity={0.72}
          />
        </mesh>

        {/* Rotating energy rings */}
        <group ref={ringsGroup}>

          <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
            <torusGeometry args={[1.78, 0.022, 12, 160]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={0.65}
            />
          </mesh>

          <mesh rotation={[0.35, Math.PI / 3, 0.7]}>
            <torusGeometry args={[1.92, 0.018, 12, 160]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.46}
            />
          </mesh>

          <mesh rotation={[1.1, 0.2, 0.25]}>
            <torusGeometry args={[2.03, 0.014, 12, 160]} />
            <meshBasicMaterial
              color="#a78bfa"
              transparent
              opacity={0.36}
            />
          </mesh>

        </group>

        {/* Healthcare network connections */}
        <lineSegments geometry={connectionGeometry}>
          <lineBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.42}
          />
        </lineSegments>

        {/* Connected network nodes */}
        {NODE_POSITIONS.map(([x, y, z], index) => (
          <group key={index} position={[x, y, z]}>

            <mesh>
              <sphereGeometry args={[0.12, 20, 20]} />
              <meshBasicMaterial
                color={
                  index === 0
                    ? "#22d3ee"
                    : index === 1
                    ? "#60a5fa"
                    : "#a78bfa"
                }
              />
            </mesh>

            <mesh>
              <sphereGeometry args={[0.22, 20, 20]} />
              <meshBasicMaterial
                color={
                  index === 0
                    ? "#22d3ee"
                    : index === 1
                    ? "#60a5fa"
                    : "#a78bfa"
                }
                transparent
                opacity={0.10}
                depthWrite={false}
              />
            </mesh>

          </group>
        ))}

      </group>
    </>
  );
}

export default function HealthcareOrb() {
  return (
    <div
      className="h-full w-full"
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 5.2],
          fov: 42,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <OrbScene />
      </Canvas>
    </div>
  );
}