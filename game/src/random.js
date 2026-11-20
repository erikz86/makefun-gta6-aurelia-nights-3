export function rng(seed) {
  let n = seed >>> 0;
  return () => ((n = (Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
}

