"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type NodeData = {
  position: [number, number, number];
  color: string;
  type:
    | "hospital"
    | "doctor"
    | "patient"
    | "record"
    | "document"
    | "ecg";
};

const NODES: NodeData[] = [
  {
    position: [2.2, 1.25, 0.2],
    color: "#22d3ee",
    type: "hospital",
  },
  {
    position: [-2.1, 1.0, 0.1],
    color: "#60a5fa",
    type: "doctor",
  },
  {
    position: [-2.35, -1.15, 0.15],
    color: "#a78bfa",
    type: "patient",
  },
  {
    position: [2.25, -1.1, 0.1],
    color: "#38bdf8",
    type: "record",
  },
  {
    position: [0.25, 2.25, 0.2],
    color: "#67e8f9",
    type: "document",
  },
  {
    position: [0.2, -2.25, 0.1],
    color: "#c084fc",
    type: "ecg",
  },
];

function MedicalCross({
  color,
}: {
  color: string;
}) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.18, 0.62, 0.12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[0.62, 0.18, 0.12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function DocumentNode({
  color,
}: {
  color: string;
}) {
  return (
    <group rotation={[0.15, 0.25, -0.1]}>
      <mesh>
        <boxGeometry args={[0.42, 0.54, 0.08]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>

      <mesh position={[0, 0.09, 0.05]}>
        <boxGeometry args={[0.22, 0.025, 0.03]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={[0, -0.02, 0.05]}>
        <boxGeometry args={[0.22, 0.025, 0.03]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={[0, -0.13, 0.05]}>
        <boxGeometry args={[0.16, 0.025, 0.03]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function PatientNode({
  color,
}: {
  color: string;
}) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.12, 18, 18]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={[0, -0.08, 0]}>
        <capsuleGeometry args={[0.12, 0.22, 8, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function RecordNode({
  color,
}: {
  color: string;
}) {
  return (
    <group>
      <mesh rotation={[0.15, 0.15, 0]}>
        <boxGeometry args={[0.42, 0.32, 0.08]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>

      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function DoctorNode({
  color,
}: {
  color: string;
}) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.11, 18, 18]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh position={[0, -0.05, 0]}>
        <coneGeometry args={[0.18, 0.35, 4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function ECGNode({
  color,
}: {
  color: string;
}) {
  const points: [number, number, number][] = [
    [-0.3, 0, 0],
    [-0.18, 0, 0],
    [-0.08, 0.15, 0],
    [0.02, -0.2, 0],
    [0.12, 0.28, 0],
    [0.22, -0.04, 0],
    [0.32, 0, 0],
  ];

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.95}
    />
  );
}

function NodeVisual({
  node,
}: {
  node: NodeData;
}) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshBasicMaterial color={node.color} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {node.type === "hospital" && (
        <MedicalCross color={node.color} />
      )}

      {node.type === "doctor" && (
        <DoctorNode color={node.color} />
      )}

      {node.type === "patient" && (
        <PatientNode color={node.color} />
      )}

      {node.type === "record" && (
        <RecordNode color={node.color} />
      )}

      {node.type === "document" && (
        <DocumentNode color={node.color} />
      )}

      {node.type === "ecg" && (
        <ECGNode color={node.color} />
      )}
    </group>
  );
}

function MedicalNetworkScene() {
  const networkGroup = useRef<THREE.Group>(null);
  const ringsGroup = useRef<THREE.Group>(null);
  const coreGroup = useRef<THREE.Group>(null);

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
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  const connectionGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    NODES.forEach((node) => {
      points.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...node.position)
      );
    });

    for (let i = 0; i < NODES.length; i++) {
      const current = NODES[i];
      const next = NODES[(i + 1) % NODES.length];

      points.push(
        new THREE.Vector3(...current.position),
        new THREE.Vector3(...next.position)
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);

    return geometry;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (networkGroup.current) {
      const targetRotationY =
        time * 0.08 + mouse.current.x * 0.08;

      const targetRotationX =
        mouse.current.y * 0.05;

      networkGroup.current.rotation.y =
        THREE.MathUtils.lerp(
          networkGroup.current.rotation.y,
          targetRotationY,
          0.02
        );

      networkGroup.current.rotation.x =
        THREE.MathUtils.lerp(
          networkGroup.current.rotation.x,
          targetRotationX,
          0.02
        );

      networkGroup.current.position.x =
        THREE.MathUtils.lerp(
          networkGroup.current.position.x,
          mouse.current.x * 0.12,
          0.02
        );

      networkGroup.current.position.y =
        THREE.MathUtils.lerp(
          networkGroup.current.position.y,
          Math.sin(time * 0.45) * 0.04 -
            mouse.current.y * 0.08,
          0.02
        );
    }

    if (ringsGroup.current) {
      ringsGroup.current.rotation.z += 0.0012;
      ringsGroup.current.rotation.y += 0.0018;
    }

    if (coreGroup.current) {
      const pulse =
        1 + Math.sin(time * 1.8) * 0.035;

      coreGroup.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />

      <pointLight
        position={[3, 2, 4]}
        intensity={5}
        distance={10}
        color="#22d3ee"
      />

      <pointLight
        position={[-3, -2, 3]}
        intensity={3}
        distance={8}
        color="#8b5cf6"
      />

      <pointLight
        position={[0, 0, 2]}
        intensity={2}
        distance={6}
        color="#38bdf8"
      />

      <Sparkles
        count={180}
        scale={[7, 7, 7]}
        size={1.6}
        speed={0.18}
        opacity={0.6}
        color="#67e8f9"
      />

      <Sparkles
        count={80}
        scale={[5.5, 5.5, 5.5]}
        size={1}
        speed={0.12}
        opacity={0.35}
        color="#c084fc"
      />

      <group ref={networkGroup}>
        {/* Main medical core */}
        <group ref={coreGroup}>
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshBasicMaterial
              color="#06b6d4"
              transparent
              opacity={0.035}
              depthWrite={false}
            />
          </mesh>

          <mesh>
            <icosahedronGeometry args={[1.28, 2]} />
            <meshBasicMaterial
              color="#22d3ee"
              wireframe
              transparent
              opacity={0.22}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.82, 28, 28]} />
            <meshStandardMaterial
              color="#0e7490"
              emissive="#0891b2"
              emissiveIntensity={1.8}
              roughness={0.3}
              metalness={0.3}
              transparent
              opacity={0.38}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.48, 24, 24]} />
            <meshStandardMaterial
              color="#14b8a6"
              emissive="#22d3ee"
              emissiveIntensity={2.5}
              roughness={0.2}
              metalness={0.35}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>

        {/* Medical orbit rings */}
        <group ref={ringsGroup}>
          <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
            <torusGeometry
              args={[1.72, 0.018, 10, 180]}
            />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={0.42}
            />
          </mesh>

          <mesh rotation={[0.45, Math.PI / 3, 0.8]}>
            <torusGeometry
              args={[2.0, 0.014, 10, 180]}
            />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.3}
            />
          </mesh>

          <mesh rotation={[1.1, 0.25, 0.3]}>
            <torusGeometry
              args={[2.22, 0.012, 10, 180]}
            />
            <meshBasicMaterial
              color="#a78bfa"
              transparent
              opacity={0.24}
            />
          </mesh>
        </group>

        {/* Healthcare network connections */}
        <lineSegments geometry={connectionGeometry}>
          <lineBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.2}
          />
        </lineSegments>

        {/* Network nodes */}
        {NODES.map((node, index) => (
          <group
            key={index}
            position={node.position}
          >
            <NodeVisual node={node} />
          </group>
        ))}
      </group>
    </>
  );
}

export default function HealthcareOrb() {
  return (
    <div
    className="h-full w-full mediflow-orb-enter"
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 42,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <MedicalNetworkScene />
      </Canvas>
    </div>
  );
}