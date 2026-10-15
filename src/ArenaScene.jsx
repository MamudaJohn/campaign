import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import AcademicCampus from './world/AcademicCampus.jsx';
import TechSkyline from './world/TechSkyline.jsx';
import CinematicEffects from './world/CinematicEffects.jsx';
import CampusFallback from './components/CampusFallback.jsx';

const BLUE = '#387cff', GOLD = '#ffcf57', ICE = '#82dbff';
function CameraRig({ pointer, motion }) {
  useFrame(({ camera }) => {
    const x = motion ? pointer.current.x * .2 : 0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x, .025);
    camera.lookAt(0, 3.4, -1);
  });
  return null;
}

function StarField({ motion }) {
  const ref = useRef();
  const points = useMemo(() => {
    const positions = new Float32Array(90 * 3);
    for (let index = 0; index < 90; index++) { const seed = Math.sin(index * 127.1 + 311.7) * 43758.5453; const value = seed - Math.floor(seed); positions[index * 3] = Math.cos(index * 2.399) * (4 + value * 15); positions[index * 3 + 1] = Math.sin(index * 2.399) * 10 + 3; positions[index * 3 + 2] = -3 - value * 20; }
    return positions;
  }, []);
  useFrame((_, delta) => { if (motion) ref.current.rotation.z += Math.min(delta, .05) * .007; });
  return (
  <points ref={ref}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]}/>
    </bufferGeometry>
    <pointsMaterial color={ICE} size={.018} transparent opacity={.25} depthWrite={false}/>
  </points>
  );
}

function LevitationStage({ motion }) {
  const ref = useRef(), time = useRef(0);
  const blue = useMemo(() => new THREE.Color(BLUE).multiplyScalar(5), []);
  const gold = useMemo(() => new THREE.Color(GOLD).multiplyScalar(2), []);
  useFrame((_, delta) => {
    if (motion) time.current += Math.min(delta, .05);
    ref.current.rotation.y = time.current * .06;
    ref.current.position.y = -1.05 + Math.sin(time.current * .8) * .06;
  });
  return <group ref={ref} position={[0, -1.05, 0]}>
    <mesh castShadow receiveShadow><cylinderGeometry args={[4.3, 4.65, .32, 90]}/><meshPhysicalMaterial color="#243246" metalness={.9} roughness={.25} clearcoat={.8} clearcoatRoughness={.2}/><Edges color={BLUE} threshold={28}/></mesh>
    <mesh position={[0, -.2, 0]} castShadow receiveShadow><cylinderGeometry args={[3.9, 3.65, .18, 90]}/><meshStandardMaterial color="#101b2b" metalness={.8} roughness={.35}/></mesh>
    {[4.3, 3.95, 3.6].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, .17, 0]}><torusGeometry args={[radius, index === 0 ? .035 : .012, 6, 120]}/><meshBasicMaterial color={index === 1 ? gold : blue} toneMapped={false}/></mesh>)}
    {Array.from({ length: 30 }, (_, index) => { const angle = index * Math.PI / 15; return <mesh key={index} position={[Math.cos(angle) * 4.08, .18, Math.sin(angle) * 4.08]} rotation={[0, -angle, 0]}><boxGeometry args={[.18, .018, .035]}/><meshBasicMaterial color={gold} toneMapped={false}/></mesh>; })}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .165, 0]} receiveShadow><circleGeometry args={[3.5, 80]}/><meshPhysicalMaterial color="#152438" metalness={.8} roughness={.2} clearcoat={1}/></mesh>
  </group>;
}

function Audience({ motion }) {
  const heads = useRef(), bodies = useRef(), leftArms = useRef(), rightArms = useRef(), legs = useRef();
  const time = useRef(0), object = useMemo(() => new THREE.Object3D(), []);
  const people = useMemo(() => Array.from({ length: 168 }, (_, index) => {
    const row = Math.floor(index / 28), column = index % 28;
    return { x: (column - 13.5) * .53 + (row % 2) * .2, z: 3.8 + row * .65 + Math.cos((column - 13.5) * .1) * .5, scale: .72 + ((index * 17) % 11) * .026, phase: index * 1.43, clothing: ['#172a42', '#263957', '#393126', '#172436', '#2a3143'][index % 5], skin: ['#a87e61', '#664932', '#be9473', '#805a43', '#946c50'][index % 5] };
  }), []);
  const colored = useRef(false);
  useFrame((_, delta) => {
    if (motion) time.current += Math.min(delta, .05);
    const put = (mesh, index, x, y, z, scale, angle = 0) => { object.position.set(x, y, z); object.rotation.set(0, 0, angle); object.scale.setScalar(scale); object.updateMatrix(); mesh.setMatrixAt(index, object.matrix); };
    people.forEach((person, index) => {
      const bob = Math.max(0, Math.sin(time.current * 2.6 + person.phase)) * .035;
      const base = -1.65 + bob, s = person.scale;
      put(heads.current, index, person.x, base + 1.58 * s, person.z, s);
      put(bodies.current, index, person.x, base + 1.15 * s, person.z, s);
      const angle = .6 + Math.sin(time.current * 3.4 + person.phase) * .35;
      put(leftArms.current, index, person.x - .09 - Math.sin(angle) * .18 * s, base + (1.3 + Math.cos(angle) * .18) * s, person.z, s, angle);
      put(rightArms.current, index, person.x + .09 + Math.sin(angle + .35) * .18 * s, base + (1.3 + Math.cos(angle + .35) * .18) * s, person.z, s, -angle - .35);
      put(legs.current, index * 2, person.x - .055, base + .48 * s, person.z, s, .03);
      put(legs.current, index * 2 + 1, person.x + .055, base + .48 * s, person.z, s, -.03);
      if (!colored.current) {
        heads.current.setColorAt(index, new THREE.Color(person.skin));
        [bodies, leftArms, rightArms].forEach(ref => ref.current.setColorAt(index, new THREE.Color(person.clothing)));
      }
    });
    [heads, bodies, leftArms, rightArms, legs].forEach(ref => { ref.current.instanceMatrix.needsUpdate = true; if (!colored.current && ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true; });
    colored.current = true;
  });
  return <group>
    <instancedMesh ref={heads} args={[null, null, people.length]} frustumCulled={false} castShadow receiveShadow><sphereGeometry args={[.112, 12, 10]}/><meshStandardMaterial roughness={.65}/></instancedMesh>
    <instancedMesh ref={bodies} args={[null, null, people.length]} frustumCulled={false} castShadow receiveShadow><capsuleGeometry args={[.11, .42, 4, 8]}/><meshStandardMaterial roughness={.85}/></instancedMesh>
    {[leftArms, rightArms].map((ref, index) => <instancedMesh key={index} ref={ref} args={[null, null, people.length]} frustumCulled={false} castShadow receiveShadow><capsuleGeometry args={[.032, .36, 3, 6]}/><meshStandardMaterial roughness={.8}/></instancedMesh>)}
    <instancedMesh ref={legs} args={[null, null, people.length * 2]} frustumCulled={false} castShadow receiveShadow><capsuleGeometry args={[.042, .7, 3, 6]}/><meshStandardMaterial color="#121925" roughness={.9}/></instancedMesh>
  </group>;
}

export default function ArenaScene({ motion, pointer, quality = 'cinematic' }) {
  const cinematic = quality === 'cinematic';
  return <Canvas shadows={{ type: THREE.PCFSoftShadowMap }} frameloop={motion ? 'always' : 'demand'} dpr={[1, cinematic ? 1.4 : 1]} camera={{ position: [0, 4.3, 16.5], fov: 46, near: .2, far: 180 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }} fallback={<CampusFallback/>}>
    <color attach="background" args={['#080f1b']}/><fogExp2 attach="fog" args={['#101c2b', .0095]}/><ambientLight intensity={.2}/><hemisphereLight args={['#abc8ed', '#14202a', .55]}/>
    <directionalLight key={quality} position={[-8, 22, 10]} color="#c2d8ff" intensity={1.5} castShadow shadow-mapSize-width={cinematic ? 2048 : 1024} shadow-mapSize-height={cinematic ? 2048 : 1024} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-near={.5} shadow-camera-far={80} shadow-bias={-.00015} shadow-normalBias={.025} shadow-radius={3}/>
    <spotLight position={[5, 12, 5]} color="#ffe0a3" intensity={85} angle={.5} penumbra={.8} distance={45} decay={2} castShadow={cinematic} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-.0002}/>
    <pointLight position={[-5, 4, 4]} color={BLUE} intensity={14}/><pointLight position={[5, 5, 3]} color={GOLD} intensity={12}/>
    <CameraRig pointer={pointer} motion={motion}/><TechSkyline motion={motion}/><AcademicCampus motion={motion} cinematic={cinematic}/><StarField motion={motion}/><LevitationStage motion={motion}/><Audience motion={motion}/>
    {cinematic && <CinematicEffects/>}
  </Canvas>;
}
