const letterLogos = {
  a: './assets/images/letter-logos/letter-a.png',
  b: './assets/images/letter-logos/letter-b.png',
  c: './assets/images/letter-logos/letter-c.png',
  d: './assets/images/letter-logos/letter-d.png',
  e: './assets/images/letter-logos/letter-e.png',
  f: './assets/images/letter-logos/letter-f.png',
  g: './assets/images/letter-logos/letter-g.png',
  h: './assets/images/letter-logos/letter-h.png',
  i: './assets/images/letter-logos/letter-i.png',
  j: './assets/images/letter-logos/letter-j.png',
  k: './assets/images/letter-logos/letter-k.png',
  l: './assets/images/letter-logos/letter-l.png',
  m: './assets/images/letter-logos/letter-m.png',
  n: './assets/images/letter-logos/letter-n.png',
  o: './assets/images/letter-logos/letter-o.png',
  p: './assets/images/letter-logos/letter-p.png',
  q: './assets/images/letter-logos/letter-q.png',
  r: './assets/images/letter-logos/letter-r.png',
  s: './assets/images/letter-logos/letter-s.png',
  t: './assets/images/letter-logos/letter-t.png',
  u: './assets/images/letter-logos/letter-u.png',
  v: './assets/images/letter-logos/letter-v.png',
  w: './assets/images/letter-logos/letter-w.png',
  y: './assets/images/letter-logos/letter-y.png',
  z: './assets/images/letter-logos/letter-z.png',
  default: './assets/images/letter-logos/exclamation-mark.png',
};

export function setCustomerLogo(name, logoElement) {
  if (!name || !logoElement) return;
  const firstLetter = name.charAt(0).toLowerCase();
  const logoSrc = letterLogos[firstLetter] || letterLogos['default'];
  logoElement.src = logoSrc;
  logoElement.alt = `Logo for ${firstLetter.toUpperCase()}`;
}
