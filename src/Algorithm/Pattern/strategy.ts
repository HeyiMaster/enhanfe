type Level = 'A' | 'B' | 'S';

const strategies: Record<Level, Function> = {
  A: (val: number) => val * 2,
  B: (val: number) => val * 4 + 1,
  S: (val: number) => val * 8 + 3,
};

function calcBonus(level: Level, base: number) {
  return strategies[level] ? strategies[level](base) : base;
}

console.log(calcBonus('A', 100));
console.log(calcBonus('B', 100));
console.log(calcBonus('S', 100));
