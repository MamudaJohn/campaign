import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Line, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { COURTYARD_LEVEL, createCampusLayout } from './campus-layout.mjs';
import { createCampusSign, createCourtyardTextures, createLearningDisplay } from './campus-materials';

const BLUE = '#577fbb', GOLD = '#b7a16d';

function AcademicWing({ building }) {
  const { x, z, width, depth, height, kind, accent, label } = building;
  const sign = useMemo(() => createCampusSign(label), [label]);
  const pediment = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width * .36, 0); shape.lineTo(0, 1.1); shape.lineTo(width * .36, 0); shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: .32, bevelEnabled: false });
  }, [width]);
  useEffect(() => () => { sign.dispose(); pediment.dispose(); }, [sign, pediment]);
  const library = kind === 'library';
  return <group position={[x, COURTYARD_LEVEL, z]}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[width, height, depth]}/><meshStandardMaterial color={library ? '#283745' : '#213243'} roughness={.68} metalness={.2}/></mesh>
    <mesh position={[0, height + .1, 0]} castShadow receiveShadow><boxGeometry args={[width + .6, .22, depth + .5]}/><meshStandardMaterial color="#39434a" roughness={.5} metalness={.4}/></mesh>
    <mesh position={[0, .14, depth * .55]} receiveShadow castShadow><boxGeometry args={[width + .6, .28, 1.8]}/><meshStandardMaterial color="#34414a" roughness={.72}/></mesh>
    {[0, 1].map(floor => <group key={floor} position={[0, 1.5 + floor * (height / 2.6), depth / 2 + .02]}>
      <mesh receiveShadow><boxGeometry args={[width * .86, 1.15, .04]}/><meshPhysicalMaterial color="#68899b" metalness={.3} roughness={.24} clearcoat={.75} emissive={accent === 'gold' ? '#716549' : '#3f596c'} emissiveIntensity={.16}/></mesh>
      {Array.from({ length: library ? 12 : 6 }, (_, index) => <mesh key={index} position={[(index / (library ? 11 : 5) - .5) * width * .86, 0, .055]}><boxGeometry args={[.055, 1.2, .05]}/><meshStandardMaterial color="#1b2837" roughness={.45} metalness={.5}/></mesh>)}
      <mesh position={[0, -.65, .04]}><boxGeometry args={[width * .92, .08, .1]}/><meshStandardMaterial color="#52606a" roughness={.6}/></mesh>
    </group>)}
    <mesh position={[0, height * .62, depth / 2 + .12]}><planeGeometry args={[width * .7, width * .7 / 8]}/><meshBasicMaterial map={sign} toneMapped/></mesh>
    {library && <>
      <mesh geometry={pediment} position={[0, height + .16, depth / 2 - .2]} castShadow receiveShadow><meshStandardMaterial color="#45515a" roughness={.65}/></mesh>
      {[-.3, -.18, -.06, .06, .18, .3].map(offset => <group key={offset} position={[offset * width, 0, depth / 2 + .8]}><mesh position={[0, height * .41, 0]} castShadow receiveShadow><cylinderGeometry args={[.17, .22, height * .8, 12]}/><meshStandardMaterial color="#5b6468" roughness={.65}/></mesh><mesh position={[0, .2, 0]}><boxGeometry args={[.5, .2, .5]}/><meshStandardMaterial color="#4d575f" roughness={.7}/></mesh></group>)}
    </>}
    <mesh position={[0, height + .24, depth / 2]}><boxGeometry args={[width * .78, .018, .025]}/><meshBasicMaterial color={accent === 'gold' ? GOLD : BLUE} transparent opacity={.4}/></mesh>
  </group>;
}

function Courtyard({ cinematic }) {
  const maps = useMemo(createCourtyardTextures, []);
  useEffect(() => () => maps.roughnessMap.dispose(), [maps]);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, COURTYARD_LEVEL, -16]} receiveShadow><planeGeometry args={[130, 130]}/>{cinematic ? <MeshReflectorMaterial resolution={512} blur={[350, 160]} mixBlur={.9} mixStrength={.45} mirror={.12} depthScale={.2} color="#1c2b3a" metalness={.25} roughness={.55} roughnessMap={maps.roughnessMap}/> : <meshStandardMaterial color="#1c2b3a" metalness={.25} roughness={.55} roughnessMap={maps.roughnessMap}/>}</mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * 7.1, COURTYARD_LEVEL + .035, -13]} receiveShadow><boxGeometry args={[.18, .07, 55]}/><meshStandardMaterial color="#3b4850" roughness={.75}/></mesh>
      {[0, -9, -20].map((z, index) => <group key={z} position={[side * 7.5, COURTYARD_LEVEL, z]}><mesh position={[0, .4, 0]} castShadow receiveShadow><boxGeometry args={[.2, .8, .2]}/><meshStandardMaterial color="#34424b" metalness={.5} roughness={.5}/></mesh><mesh position={[0, .76, 0]}><boxGeometry args={[.21, .12, .21]}/><meshBasicMaterial color="#c9b78c"/></mesh>{index === 0 && <pointLight position={[0, .9, 0]} color="#d9c8a5" intensity={5} distance={6} decay={2}/>}</group>)}
    </group>)}
    {[-7.5, 7.5].map(x => <group key={x} position={[x, COURTYARD_LEVEL, -11]}><mesh position={[0, .3, 0]} castShadow receiveShadow><boxGeometry args={[1.7, .6, 1.5]}/><meshStandardMaterial color="#3b464c" roughness={.85}/></mesh><mesh position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[.08, .12, 1.6, 8]}/><meshStandardMaterial color="#332f28" roughness={1}/></mesh><mesh position={[0, 2.1, 0]} scale={[1, 1.1, .9]} castShadow receiveShadow><icosahedronGeometry args={[1.05, 1]}/><meshStandardMaterial color="#284b44" roughness={.95}/></mesh><mesh position={[.45, 1.8, .15]} castShadow><icosahedronGeometry args={[.66, 1]}/><meshStandardMaterial color="#36564b" roughness={.95}/></mesh></group>)}
  </group>;
}

function LearningScreen({ side, motion }) {
  const ref = useRef(), time = useRef(side < 0 ? 0 : 2);
  const map = useMemo(() => createLearningDisplay(side < 0 ? 'code' : 'research'), [side]);
  useEffect(() => () => map.dispose(), [map]);
  useFrame((_, delta) => { if (motion) time.current += Math.min(delta, .05); ref.current.position.y = 3 + Math.sin(time.current * .4) * .12; });
  return <group ref={ref} position={[side * 8.5, 3, -10]} rotation={[0, side * -.2, side * .025]}>
    <mesh castShadow><boxGeometry args={[3.4, 2.17, .08]}/><meshPhysicalMaterial color="#1d3146" metalness={.7} roughness={.3} clearcoat={.6}/></mesh>
    <mesh position={[0, 0, .048]}><planeGeometry args={[3.2, 2]}/><meshBasicMaterial map={map} color="#7a93a7" transparent opacity={.67}/></mesh>
    <mesh position={[0, -1.13, 0]}><boxGeometry args={[1.5, .015, .025]}/><meshBasicMaterial color={side < 0 ? BLUE : GOLD} transparent opacity={.5}/></mesh>
  </group>;
}

function OpenBook({ position, rotation = [0, 0, 0], scale = 1, motion }) {
  const ref = useRef(), time = useRef(position[0]);
  useFrame((_, delta) => { if (motion) time.current += Math.min(delta, .05); ref.current.position.y = position[1] + Math.sin(time.current * .45) * .16; ref.current.rotation.y = rotation[1] + Math.sin(time.current * .2) * .1; });
  return <group ref={ref} position={position} rotation={rotation} scale={scale}>
    {[-1, 1].map(side => <group key={side} rotation={[0, 0, side * -.15]} position={[side * .44, 0, 0]}>
      <mesh position={[0, -.06, 0]} castShadow receiveShadow><boxGeometry args={[.88, .08, 1.24]}/><meshStandardMaterial color="#344d6e" roughness={.45} metalness={.15}/></mesh>
      <mesh castShadow receiveShadow><boxGeometry args={[.83, .075, 1.15]}/><meshStandardMaterial color="#b6ad91" roughness={.8}/></mesh>
      {Array.from({ length: 6 }, (_, index) => <mesh key={index} position={[0, .042, -.4 + index * .14]}><boxGeometry args={[.53, .003, .014]}/><meshStandardMaterial color="#77766b" roughness={.9}/></mesh>)}
    </group>)}
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.045, .045, 1.25, 8]}/><meshStandardMaterial color="#9c875c" roughness={.45} metalness={.4}/></mesh>
  </group>;
}

function ResearchOrbit({ motion }) {
  const ref = useRef();
  const ellipse = useMemo(() => Array.from({ length: 81 }, (_, index) => { const angle = index / 80 * Math.PI * 2; return [Math.cos(angle) * 2.6, Math.sin(angle) * .95, 0]; }), []);
  useFrame((_, delta) => { if (motion) ref.current.rotation.y += Math.min(delta, .05) * .05; });
  return <group ref={ref} position={[0, 4.1, -19]} rotation={[.3, 0, .1]}>
    {[0, Math.PI / 3, -Math.PI / 3].map((angle, index) => <group key={angle} rotation={[0, 0, angle]}><Line points={ellipse} lineWidth={.8} color={index === 0 ? GOLD : BLUE} transparent opacity={.22}/><mesh position={[2.6, 0, 0]}><sphereGeometry args={[.055, 8, 8]}/><meshBasicMaterial color={index === 0 ? GOLD : BLUE} transparent opacity={.5}/></mesh></group>)}
    <mesh><sphereGeometry args={[.13, 16, 16]}/><meshStandardMaterial color="#a89770" metalness={.6} roughness={.3}/></mesh>
  </group>;
}

function GraduationCap({ motion }) {
  const ref = useRef(), time = useRef(0);
  useFrame((_, delta) => { if (motion) time.current += Math.min(delta, .05); ref.current.position.y = 5.2 + Math.sin(time.current * .4) * .15; ref.current.rotation.y = -.35 + Math.sin(time.current * .15) * .1; });
  return <group ref={ref} position={[7.7, 5.2, -16]} rotation={[.22, -.35, -.1]} scale={.65}>
    <mesh position={[0, -.25, 0]} castShadow><cylinderGeometry args={[.5, .43, .5, 24]}/><meshStandardMaterial color="#182c45" roughness={.7}/></mesh>
    <mesh rotation={[0, Math.PI / 4, 0]} castShadow><boxGeometry args={[1.4, .07, 1.4]}/><meshStandardMaterial color="#273c56" roughness={.65}/></mesh>
    <Line points={[[0, .05, 0], [.6, .05, .6], [.64, -.55, .64]]} color="#ad9565" lineWidth={1.2}/>
  </group>;
}

export default function AcademicCampus({ motion, cinematic }) {
  const buildings = useMemo(createCampusLayout, []);
  return <>
    <Environment frames={1} resolution={128} environmentIntensity={.5}>
      <Lightformer form="rect" position={[0, 12, -5]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 9, 1]} color="#abc3d6" intensity={1.8}/>
      <Lightformer form="rect" position={[-12, 3, 2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 10, 1]} color="#567eb2" intensity={1.4}/>
      <Lightformer form="rect" position={[12, 4, -3]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 10, 1]} color="#c7b58d" intensity={1.2}/>
    </Environment>
    {buildings.map(building => <AcademicWing key={building.id} building={building}/>)}
    <Courtyard cinematic={cinematic}/>
    {[-1, 1].map(side => <LearningScreen key={side} side={side} motion={motion}/>)}
    <OpenBook position={[-7.6, 4.8, -9]} rotation={[.5, -.3, -.1]} scale={.6} motion={motion}/>
    <OpenBook position={[-6.8, 2.5, -6]} rotation={[.45, .2, .08]} scale={.42} motion={motion}/>
    <ResearchOrbit motion={motion}/><GraduationCap motion={motion}/>
  </>;
}
