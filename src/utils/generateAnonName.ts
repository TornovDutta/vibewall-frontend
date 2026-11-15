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

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-fuchsia-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-rose-500',
  'from-sky-500 to-indigo-600',
];

export function getAvatarGradient(seed: string): string {
  const h = hash(seed);
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}
