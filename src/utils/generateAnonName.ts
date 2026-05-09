const ADJECTIVES = [
  'Silent', 'Cosmic', 'Mystic', 'Hidden', 'Shadow', 'Velvet', 'Neon', 'Lunar',
  'Blazing', 'Frozen', 'Golden', 'Silver', 'Crimson', 'Azure', 'Ember', 'Storm',
  'Prism', 'Radiant', 'Phantom', 'Hollow', 'Vivid', 'Serene', 'Restless', 'Faded',
];

const NOUNS = [
  'Fox', 'Wolf', 'Eagle', 'Tiger', 'Raven', 'Phoenix', 'Falcon', 'Lynx',
  'Viper', 'Panther', 'Hawk', 'Bear', 'Owl', 'Cobra', 'Drake', 'Puma',
  'Jaguar', 'Crane', 'Kestrel', 'Moth', 'Hyena', 'Drifter', 'Nomad', 'Cipher',
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function generateAnonName(seed: string): string {
  const h = hash(seed);
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(h / ADJECTIVES.length) % NOUNS.length];
  return `${adj} ${noun}`;
}
