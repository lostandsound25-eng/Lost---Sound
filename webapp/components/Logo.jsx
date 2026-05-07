import Link from 'next/link'

const Logo = () => (
  <svg height="50" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <text x="0" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">L</text>
    <g transform="translate(45, 10)">
      <circle cx="22" cy="30" r="20" fill="none" stroke="var(--color-golden)" strokeWidth="4"/>
      <path d="M 22 10 Q 34 30 22 50 Q 10 30 22 10" fill="none" stroke="var(--color-golden)" strokeWidth="3"/>
      <line x1="2" y1="30" x2="42" y2="30" stroke="var(--color-golden)" strokeWidth="3"/>
      <line x1="22" y1="10" x2="22" y2="50" stroke="var(--color-golden)" strokeWidth="3"/>
    </g>
    <text x="100" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">ST</text>
    <text x="180" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-orange)">&amp;</text>
    <text x="235" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">S</text>
    <g transform="translate(280, 10)">
      <circle cx="22" cy="30" r="20" fill="none" stroke="var(--color-golden)" strokeWidth="4"/>
      <circle cx="22" cy="30" r="4" fill="var(--color-golden)"/>
      <path d="M 22 14 L 26 30 L 22 46 L 18 30 Z" fill="none" stroke="var(--color-golden)" strokeWidth="2"/>
    </g>
    <text x="330" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">UND</text>
  </svg>
)

export default Logo;
