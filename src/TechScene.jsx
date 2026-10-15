import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Float, Line, OrbitControls } from '@react-three/drei';

const GOLD = '#ffcc4d';
const BLUE = '#247cff';
const ICE = '#7bdfff';

function Flight({ index, motion }) {
  const object = useRef();
  const elapsed = useRef(0);
  const radius = 2.1 + (index % 3) * .33;
  const phase = index * 2.399;
  useFrame((_, delta) => {
    if (!object.current) return;
    if (motion) elapsed.current += Math.min(delta, .05) * (.19 + (index % 3) * .065);
    const time = elapsed.current;
    object.current.position.set(Math.cos(time + phase) * radius, Math.sin(time * 1.3 + phase) * 1.85, Math.sin(time + phase) * 1.05);
    object.current.rotation.set(time + phase, time * 1.4, phase + time * .6);
  });
  return <group ref={object}>
    <mesh scale={index % 3 === 0 ? .15 : .1}>
      {index % 2 === 0 ? <octahedronGeometry/> : <boxGeometry/>}
      <meshStandardMaterial color={index % 2 === 0 ? GOLD : BLUE} metalness={.6} roughness={.22} emissive={index % 2 === 0 ? '#c77c0a' : BLUE} emissiveIntensity={.3}/>
      <Edges color="#02040b" threshold={12} lineWidth={1.5}/>
    </mesh>
    {index % 3 === 0 && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.25, .008, 6, 32]}/><meshBasicMaterial color={ICE}/></mesh>}
  </group>;
}

function Orbit({ radius, rotation, color, motion, speed }) {
  const ring = useRef();
  const points = useMemo(() => Array.from({ length: 100 }, (_, index) => {
    const angle = index / 99 * Math.PI * 1.65;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  }), [radius]);
  useFrame((_, delta) => { if (motion && ring.current) ring.current.rotation.z += delta * speed; });
  return <group rotation={rotation}><group ref={ring}>
    <Line points={points} color={color} lineWidth={1.7}/>
    <mesh position={[radius, 0, 0]}><sphereGeometry args={[.065, 12, 12]}/><meshBasicMaterial color={GOLD}/></mesh>
    <mesh position={[-radius, 0, 0]}><boxGeometry args={[.14, .14, .14]}/><meshBasicMaterial color={color}/><Edges color="#000"/></mesh>
  </group></group>;
}

function EnergyCore({ motion }) {
  const core = useRef();
  useFrame(({ clock }, delta) => {
    if (motion && core.current) { core.current.rotation.y += delta * .25; core.current.rotation.z = Math.sin(clock.elapsedTime * .3) * .1; }
  });
  return <group rotation={[.2, 0, -.18]}>
    <Float speed={motion ? 1.8 : 0} rotationIntensity={.12} floatIntensity={.28}>
      <group ref={core}>
        <mesh><octahedronGeometry args={[1.12, 0]}/><meshStandardMaterial color={GOLD} metalness={.72} roughness={.25} emissive="#a16506" emissiveIntensity={.2}/><Edges color="#02040a" lineWidth={3}/></mesh>
        <mesh rotation={[0, Math.PI / 4, 0]}><icosahedronGeometry args={[1.5, 0]}/><meshBasicMaterial color={BLUE} wireframe transparent opacity={.48}/></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.68, .045, 10, 100]}/><meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={1.1} metalness={.5} roughness={.25}/><Edges color="#02040b" threshold={24}/></mesh>
      </group>
    </Float>
    <Orbit radius={2.05} rotation={[.85, .25, .1]} color={ICE} speed={.28} motion={motion}/>
    <Orbit radius={2.28} rotation={[-.6, .7, -.4]} color={GOLD} speed={-.2} motion={motion}/>
    <Orbit radius={1.92} rotation={[.1, 1.15, .7]} color={BLUE} speed={.35} motion={motion}/>
    {Array.from({ length: 12 }, (_, index) => <Flight key={index} index={index} motion={motion}/>)}
  </group>;
}

function ParticleField({ motion }) {
  const field = useRef();
  const positions = useMemo(() => {
    const array = new Float32Array(80 * 3);
    for (let index = 0; index < 80; index++) {
      const seed = Math.sin(index * 127.1 + 311.7) * 43758.5453;
      const value = seed - Math.floor(seed);
      array[index * 3] = Math.cos(index * 2.399) * (2.2 + value * 2);
      array[index * 3 + 1] = Math.sin(index * 2.399) * (1.8 + value * 1.4);
      array[index * 3 + 2] = value * 3 - 2;
    }
    return array;
  }, []);
  useFrame((_, delta) => { if (motion && field.current) field.current.rotation.z += delta * .025; });
  return <points ref={field}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]}/></bufferGeometry><pointsMaterial color={ICE} size={.022} transparent opacity={.75} sizeAttenuation/></points>;
}

export default function TechScene({ motion }) {
  return <Canvas dpr={[1, 1.5]} frameloop={motion ? 'always' : 'demand'} camera={{ position: [0, .1, 8.3], fov: 43 }} gl={{ antialias: true, alpha: true }} fallback={<div className="static-core"><i/><i/><span>✳</span></div>}>
    <ambientLight intensity={1.2}/>
    <directionalLight position={[3, 5, 4]} color="#fff0c2" intensity={4}/>
    <directionalLight position={[-4, -2, 2]} color={BLUE} intensity={3}/>
    <pointLight position={[0, 0, 3]} color={GOLD} intensity={5}/>
    <EnergyCore motion={motion}/>
    <ParticleField motion={motion}/>
    <OrbitControls enableZoom={false} enablePan={false} enableDamping={motion} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.6}/>
  </Canvas>;
}
