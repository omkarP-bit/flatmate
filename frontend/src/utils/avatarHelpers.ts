const PALETTES = [
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FBEAF0', color: '#72243E' },
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#EAF3DE', color: '#27500A' },
];

export function getAvatarColors(id: string): { bg: string; color: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}