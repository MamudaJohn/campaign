export const COURTYARD_LEVEL = -1.65;

export function randomAt(index, salt = 0) {
  const value = Math.sin(index * 127.1 + salt * 311.7 + 74.7) * 43758.5453;
  return value - Math.floor(value);
}

// Low academic wings sit to either side; the library stays well behind the stage.
export function createCampusLayout() {
  return [
    { id: 'learning-lab', x: -14, z: -17, width: 9, depth: 7, height: 4.8, kind: 'lab', label: 'DIGITAL LEARNING', accent: 'blue' },
    { id: 'research-lab', x: 14, z: -19, width: 9, depth: 7, height: 5.2, kind: 'lab', label: 'RESEARCH & INNOVATION', accent: 'gold' },
    { id: 'lecture-wing', x: -23, z: -33, width: 11, depth: 7, height: 5.8, kind: 'hall', label: 'LEARN / BUILD / DISCOVER', accent: 'gold' },
    { id: 'knowledge-wing', x: 23, z: -34, width: 11, depth: 7, height: 5.5, kind: 'hall', label: 'CONNECTED KNOWLEDGE', accent: 'blue' },
    { id: 'library', x: 0, z: -51, width: 27, depth: 8, height: 6.2, kind: 'library', label: 'LIBRARY / KNOWLEDGE COMMONS', accent: 'gold' },
  ];
}

// A full city silhouette rises behind the campus, with taller stepped side towers.
// The central row remains behind the library and the floating candidate stage.
export function createSkylineLayout() {
  const buildings = [];
  [-1, 1].forEach(side => {
    [17, 25, 34, 43].forEach((distance, index) => {
      buildings.push({
        id: `research-tower-${side}-${index}`,
        x: side * distance,
        z: -38 - index * 4 - (side > 0 ? 2 : 0),
        width: 4.2 + randomAt(index, side + 7) * 1.8,
        depth: 4.4 + randomAt(index, side + 13) * 1.8,
        height: [23, 28, 19.5, 25][index] + (side > 0 ? .8 : 0),
        accent: side < 0 ? 'blue' : 'gold',
        layer: 'near',
      });
    });
  });
  for (let index = 0; index < 15; index++) {
    const x = (index - 7) * 6.4;
    buildings.push({
      id: `horizon-tower-${index}`,
      x,
      z: -61 - randomAt(index, 31) * 9,
      width: 3 + randomAt(index, 18) * 2.3,
      depth: 3.8 + randomAt(index, 19) * 2,
      height: Math.abs(x) < 10 ? 11 + randomAt(index, 20) * 3 : 15 + randomAt(index, 21) * 7,
      accent: index % 4 === 0 ? 'gold' : 'blue',
      layer: 'far',
    });
  }
  return buildings;
}
