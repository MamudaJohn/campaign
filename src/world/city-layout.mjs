export const PLAZA_LEVEL = -1.65;

export function randomAt(index, salt = 0) {
  const value = Math.sin(index * 127.1 + salt * 311.7 + 74.7) * 43758.5453;
  return value - Math.floor(value);
}

// Leave a clear foreground around the candidate stage; towers frame the view.
export function createCityLayout() {
  const towers = [];
  const rows = [-8, -20, -34, -51];
  rows.forEach((z, row) => {
    [-1, 1].forEach(side => {
      for (let column = 0; column < 4; column++) {
        const index = row * 8 + (side === 1 ? 4 : 0) + column;
        const width = 2.8 + randomAt(index, 1) * 2.7;
        const depth = 3.5 + randomAt(index, 2) * 3.5;
        const height = 9 + row * 2 + randomAt(index, 3) * 14;
        towers.push({ id: index, x: side * (9 + column * 6.3 + row * .4), z: z + randomAt(index, 4) * 2, width, depth, height, variant: index % 4, crown: index % 3 === 0, beacon: index % 4 === 0 });
      }
    });
  });
  // Distant blocks close the skyline without filling the plaza's sightline.
  for (let index = 0; index < 11; index++) {
    towers.push({ id: 32 + index, x: (index - 5) * 5.5, z: -68 - randomAt(index, 11) * 10, width: 3 + randomAt(index, 12) * 2.2, depth: 4, height: 12 + randomAt(index, 13) * 24, variant: index % 4, crown: index % 2 === 0, beacon: false });
  }
  return towers;
}
