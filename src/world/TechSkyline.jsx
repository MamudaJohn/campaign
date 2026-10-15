import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { COURTYARD_LEVEL, createSkylineLayout } from './campus-layout.mjs';
import { createHorizonGlow, createSkylineWindows } from './skyline-materials.js';

const BLUE = '#69b1ff', GOLD = '#e3be6a';

function TowerRow({ buildings, accent }) {
  const bodies = useRef(), fronts = useRef(), sides = useRef(), crowns = useRef();
  const map = useMemo(() => createSkylineWindows(accent), [accent]);
  const outline = useMemo(() => {
    const cube = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(cube);
    const source = edges.getAttribute('position');
    const positions = [];
    buildings.forEach(building => {
      for (let index = 0; index < source.count; index++) positions.push(
        source.getX(index) * building.width + building.x,
        source.getY(index) * building.height + COURTYARD_LEVEL + building.height / 2,
        source.getZ(index) * building.depth + building.z,
      );
    });
    cube.dispose(); edges.dispose();
    return new Float32Array(positions);
  }, [buildings]);
  useEffect(() => () => map.dispose(), [map]);
  useLayoutEffect(() => {
    const object = new THREE.Object3D();
    const place = (ref, index, position, scale, angle = 0) => {
      object.position.set(...position); object.scale.set(...scale); object.rotation.set(0, angle, 0);
      object.updateMatrix(); ref.current.setMatrixAt(index, object.matrix);
    };
    buildings.forEach((building, index) => {
      const { x, z, width, height, depth } = building;
      const y = COURTYARD_LEVEL + height / 2;
      const inside = x < 0 ? 1 : -1;
      place(bodies, index, [x, y, z], [width, height, depth]);
      place(fronts, index, [x, y, z + depth / 2 + .015], [width * .88, height * .93, 1]);
      place(sides, index, [x + inside * (width / 2 + .015), y, z], [depth * .86, height * .93, 1], inside * Math.PI / 2);
      place(crowns, index, [x + width * .08, COURTYARD_LEVEL + height + .22, z - .15], [width * .65, .44, depth * .65]);
      bodies.current.setColorAt(index, new THREE.Color(building.layer === 'far' ? '#293d55' : '#354c63'));
    });
    [bodies, fronts, sides, crowns].forEach(ref => {
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.computeBoundingSphere();
    });
    bodies.current.instanceColor.needsUpdate = true;
  }, [buildings]);
  const tint = accent === 'gold' ? GOLD : BLUE;
  return <group name={`${accent}-research-skyline`}>
    <instancedMesh ref={bodies} args={[null, null, buildings.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]}/><meshStandardMaterial roughness={.58} metalness={.48}/>
    </instancedMesh>
    <instancedMesh ref={fronts} args={[null, null, buildings.length]}>
      <planeGeometry/><meshStandardMaterial map={map} color="#bccddd" emissive={tint} emissiveMap={map} emissiveIntensity={1.35} roughness={.38} metalness={.55}/>
    </instancedMesh>
    <instancedMesh ref={sides} args={[null, null, buildings.length]}>
      <planeGeometry/><meshStandardMaterial map={map} color="#8dabc1" emissive={tint} emissiveMap={map} emissiveIntensity={.72} roughness={.45} metalness={.5}/>
    </instancedMesh>
    <instancedMesh ref={crowns} args={[null, null, buildings.length]}>
      <boxGeometry args={[1, 1, 1]}/><meshStandardMaterial color="#1c2c3d" roughness={.5} metalness={.6}/>
    </instancedMesh>
    <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[outline, 3]}/></bufferGeometry><lineBasicMaterial color="#080f1a" transparent opacity={.65}/></lineSegments>
    {buildings.filter(building => building.layer === 'near').map((building, index) => <group key={building.id} position={[building.x, COURTYARD_LEVEL + building.height + .45, building.z + building.depth * .32]}>
      <mesh><boxGeometry args={[building.width * .48, .045, .05]}/><meshBasicMaterial color={tint}/></mesh>
      <mesh position={[building.width * .43, -building.height * .46, .2]}><boxGeometry args={[.04, building.height * .75, .035]}/><meshBasicMaterial color={tint} transparent opacity={.7}/></mesh>
      {index % 2 === 0 && <>
        <mesh position={[0, 1, -.5]}><cylinderGeometry args={[.025, .055, 2, 6]}/><meshStandardMaterial color="#758b9d" metalness={.65} roughness={.4}/></mesh>
        <mesh position={[0, 2, -.5]}><sphereGeometry args={[.055, 8, 8]}/><meshBasicMaterial color={tint}/></mesh>
      </>}
    </group>)}
  </group>;
}

function DataConnection({ side, motion, target, horizontalScale }) {
  const travellers = useRef([]), time = useRef(side < 0 ? .15 : .55);
  const curve = useMemo(() => new THREE.CubicBezierCurve3(
    new THREE.Vector3(side * 14, 3.5, side < 0 ? -13.4 : -15.4),
    new THREE.Vector3(side * 15, 11, -20),
    new THREE.Vector3(target.x * horizontalScale, target.height - 1, target.z + 7),
    new THREE.Vector3(target.x * horizontalScale, COURTYARD_LEVEL + target.height + .5, target.z + target.depth * .32),
  ), [side, target, horizontalScale]);
  const points = useMemo(() => curve.getPoints(64), [curve]);
  const light = useMemo(() => new THREE.Color(side < 0 ? BLUE : GOLD).multiplyScalar(2.1), [side]);
  const position = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    if (motion) time.current += Math.min(delta, .05) * .055;
    travellers.current.forEach((mesh, index) => {
      if (mesh) { curve.getPoint((time.current + index / 3) % 1, position); mesh.position.copy(position); }
    });
  });
  return <group name="campus-city-data-link">
    <Line points={points} color={side < 0 ? BLUE : GOLD} transparent opacity={.24} lineWidth={.65}/>
    {[0, 1, 2].map(index => <mesh key={index} ref={element => { travellers.current[index] = element; }}>
      <sphereGeometry args={[.048, 8, 8]}/><meshBasicMaterial color={light} toneMapped={false}/>
    </mesh>)}
    <Line points={[[side * 5.6, COURTYARD_LEVEL + .045, 1], [side * 5.6, COURTYARD_LEVEL + .045, -7], [side * 9.2, COURTYARD_LEVEL + .045, -10.6], [side * 9.2, COURTYARD_LEVEL + .045, -22], [side * 18, COURTYARD_LEVEL + .045, -31]]} color={side < 0 ? BLUE : GOLD} transparent opacity={.22} lineWidth={.8}/>
  </group>;
}

// The city and university share one palette, atmosphere, and flowing data network.
export default function TechSkyline({ motion }) {
  const aspect = useThree(state => state.size.width / Math.max(1, state.size.height));
  // Keep the city in view on a tall phone canvas, where a fixed-width city is cropped.
  const horizontalScale = Math.min(1, Math.max(.24, aspect / 1.3));
  const rows = useMemo(() => {
    const buildings = createSkylineLayout();
    return { blue: buildings.filter(building => building.accent === 'blue'), gold: buildings.filter(building => building.accent === 'gold') };
  }, []);
  const glow = useMemo(createHorizonGlow, []);
  useEffect(() => () => glow.dispose(), [glow]);
  return <group name="connected-campus-skyline">
    <mesh position={[0, 11, -84]}><planeGeometry args={[145, 50]}/><meshBasicMaterial map={glow} transparent opacity={.65} depthWrite={false} fog={false}/></mesh>
    <group scale={[horizontalScale, 1, 1]}><TowerRow buildings={rows.blue} accent="blue"/><TowerRow buildings={rows.gold} accent="gold"/></group>
    <DataConnection side={-1} motion={motion} target={rows.blue[0]} horizontalScale={horizontalScale}/><DataConnection side={1} motion={motion} target={rows.gold[0]} horizontalScale={horizontalScale}/>
  </group>;
}
