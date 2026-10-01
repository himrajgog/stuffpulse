import React from 'react';

// 1. Purple Cloud with Box Mascot
export const PurpleCloudMascot = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Cloud Body */}
    <g className="animate-float-slow">
      {/* Cloud puffs */}
      <path
        d="M50 110C33.4315 110 20 96.5685 20 80C20 65.237 30.6865 52.969 44.8293 50.4578C47.9621 33.1517 63.0232 20 81 20C101.435 20 118 36.5655 118 57C132.359 58.6364 143 70.8354 143 85.5C143 100.688 130.688 113 115.5 113H50Z"
        fill="#8B5CF6"
      />
      {/* Eyes */}
      <circle cx="68" cy="72" r="5" fill="#18181B" />
      <circle cx="69.5" cy="70.5" r="1.8" fill="#FFFFFF" />
      <circle cx="92" cy="72" r="5" fill="#18181B" />
      <circle cx="93.5" cy="70.5" r="1.8" fill="#FFFFFF" />

      {/* Cardboard Box */}
      <g transform="translate(48, 88)">
        {/* Box base */}
        <rect x="0" y="8" width="64" height="42" rx="4" fill="#C2884A" />
        <rect x="0" y="8" width="64" height="42" rx="4" stroke="#9A6328" strokeWidth="2" />
        {/* Box tape */}
        <rect x="26" y="8" width="12" height="42" fill="#E4A86A" />
        {/* Open flaps */}
        <path d="M0 8L-8 -6L24 2L0 8Z" fill="#D89955" stroke="#9A6328" strokeWidth="1.5" />
        <path d="M64 8L72 -6L40 2L64 8Z" fill="#D89955" stroke="#9A6328" strokeWidth="1.5" />
        {/* Mascot arms holding the box */}
        <path d="M-6 20C-12 12 -4 4 4 10" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M70 20C76 12 68 4 60 10" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

// 2. Orange Pin Mascot
export const OrangePinMascot = ({ className = "w-24 h-28" }) => (
  <svg viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Floating dotted shadow ground */}
    <ellipse cx="70" cy="148" rx="35" ry="7" fill="#FDBA74" fillOpacity="0.4" />
    <ellipse cx="70" cy="148" rx="20" ry="4" fill="#EA580C" fillOpacity="0.3" stroke="#EA580C" strokeDasharray="3 3" strokeWidth="1" />
    
    {/* Location Pin Character */}
    <g className="animate-bounce-subtle">
      {/* Pin Body */}
      <path
        d="M70 18C47.9086 18 30 35.9086 30 58C30 84 70 135 70 135C70 135 110 84 110 58C110 35.9086 92.0914 18 70 18Z"
        fill="#FF6B35"
      />
      {/* Eyes */}
      <circle cx="58" cy="54" r="5" fill="#FFFFFF" />
      <circle cx="59.5" cy="54" r="2.5" fill="#18181B" />
      <circle cx="82" cy="54" r="5" fill="#FFFFFF" />
      <circle cx="83.5" cy="54" r="2.5" fill="#18181B" />
      {/* Smile */}
      <path d="M64 68C67 72 73 72 76 68" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 3. Green Phone Mascot (CRM & Dialer)
export const GreenPhoneMascot = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 150 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Character Body */}
    <g>
      {/* Legs */}
      <path d="M56 122V142C56 146 50 146 50 146" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M90 122V142C90 146 96 146 96 146" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Rounded body */}
      <rect x="25" y="32" width="92" height="92" rx="28" fill="#2BB673" />
      
      {/* Eyes */}
      <circle cx="56" cy="74" r="4.5" fill="#FFFFFF" />
      <circle cx="56" cy="74" r="2.2" fill="#18181B" />
      <circle cx="84" cy="74" r="4.5" fill="#FFFFFF" />
      <circle cx="84" cy="74" r="2.2" fill="#18181B" />
      {/* Nose/Mouth */}
      <ellipse cx="70" cy="88" rx="4" ry="3" fill="#18181B" />

      {/* Hand holding mobile phone */}
      <g transform="translate(108, 48)">
        {/* Smartphone */}
        <rect x="0" y="0" width="18" height="34" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="3" y="4" width="12" height="22" rx="1.5" fill="#38BDF8" />
        {/* Arm */}
        <path d="M-8 26C-2 26 4 20 2 12" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
        {/* Radiating sound waves */}
        <path d="M22 6C26 10 26 18 22 22" stroke="#2BB673" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M27 2C33 8 33 24 27 28" stroke="#2BB673" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 1" />
      </g>
    </g>
  </svg>
);

// 4. Blue Face Recognition Mascot
export const BlueFaceMascot = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 150 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Legs */}
    <path d="M58 126C58 142 50 148 50 148" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M88 126C88 142 96 148 96 148" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" />

    {/* Blue Face Shape */}
    <g className="animate-pulse-slow">
      <path
        d="M74 24C46.3858 24 24 46.3858 24 74C24 92.5 34.5 108.5 50 117C58 122 88 122 98 117C113.5 108.5 124 92.5 124 74C124 46.3858 101.614 24 74 24Z"
        fill="#3B82F6"
      />
      {/* Eyes */}
      <circle cx="58" cy="72" r="5" fill="#FFFFFF" />
      <circle cx="59.5" cy="72" r="2.5" fill="#18181B" />
      <circle cx="88" cy="72" r="5" fill="#FFFFFF" />
      <circle cx="89.5" cy="72" r="2.5" fill="#18181B" />
      {/* Smile */}
      <path d="M66 88C70 94 76 94 80 88" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />

      {/* Face Scanner Corner Brackets [ ] */}
      <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Top Left */}
        <path d="M44 54H36V44" />
        {/* Top Right */}
        <path d="M104 44V54H112" />
        {/* Bottom Left */}
        <path d="M36 94V104H44" />
        {/* Bottom Right */}
        <path d="M112 94V104H104" />
      </g>

      {/* Verified Green Badge */}
      <g transform="translate(102, 32)">
        <circle cx="12" cy="12" r="12" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M8 12.5L10.5 15L16.5 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  </svg>
);

// 5. Orange Star Mascot (Bookkeeping & POS ₹499)
export const OrangeStarMascot = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 150 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Star Body */}
    <g>
      <path
        d="M75 14L92.2982 50.8197L132.894 56.0962L103.118 84.4553L110.655 124.684L75 105.3L39.345 124.684L46.882 84.4553L17.106 56.0962L57.7018 50.8197L75 14Z"
        fill="#FF7A59"
      />
      {/* Glasses */}
      <g stroke="#18181B" strokeWidth="2.5">
        <circle cx="62" cy="62" r="8" fill="#FFFFFF" fillOpacity="0.8" />
        <circle cx="86" cy="62" r="8" fill="#FFFFFF" fillOpacity="0.8" />
        <path d="M70 62H78" />
        <path d="M54 62L46 58" />
        <path d="M94 62L102 58" />
      </g>
      <circle cx="63" cy="62" r="3" fill="#18181B" />
      <circle cx="87" cy="62" r="3" fill="#18181B" />

      {/* Mini Device / POS Screen held */}
      <g transform="translate(56, 88)">
        <rect x="0" y="0" width="36" height="38" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <rect x="4" y="4" width="28" height="15" rx="2" fill="#0EA5E9" />
        <text x="6" y="15" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">₹499</text>
        {/* Buttons on POS */}
        <circle cx="10" cy="28" r="2" fill="#94A3B8" />
        <circle cx="18" cy="28" r="2" fill="#94A3B8" />
        <circle cx="26" cy="28" r="2" fill="#94A3B8" />
        {/* Arms */}
        <path d="M-6 8C-2 16 0 16 0 16" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <path d="M42 8C38 16 36 16 36 16" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

// 6. Yellow Triangle Mascot (Accounting Digital Khata)
export const YellowTriangleMascot = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 150 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Legs */}
    <path d="M60 128C60 144 54 150 54 150" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
    <path d="M90 128C90 144 96 150 96 150" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />

    {/* Triangle Body */}
    <g>
      <path
        d="M75 22L128 116C131 121 127 127 121 127H29C23 127 19 121 22 116L75 22Z"
        fill="#F5C518"
      />
      {/* Glasses */}
      <g stroke="#18181B" strokeWidth="2.5">
        <circle cx="65" cy="74" r="8" fill="#FFFFFF" fillOpacity="0.8" />
        <circle cx="85" cy="74" r="8" fill="#FFFFFF" fillOpacity="0.8" />
        <path d="M73 74H77" />
      </g>
      <circle cx="65" cy="74" r="3" fill="#18181B" />
      <circle cx="85" cy="74" r="3" fill="#18181B" />

      {/* Tie */}
      <path d="M75 86L72 98L75 106L78 98L75 86Z" fill="#1E293B" />

      {/* Cash / Passbook in hands */}
      <g transform="translate(52, 98)">
        <rect x="0" y="4" width="44" height="24" rx="4" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
        <circle cx="22" cy="16" r="6" fill="#15803D" />
        <text x="18" y="20" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">₹</text>
        {/* Arms */}
        <path d="M-4 -4C-1 8 0 8 0 8" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 -4C45 8 44 8 44 8" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

// 7. Green Lock Mascot (Privacy & Protection)
export const GreenLockMascot = ({ className = "w-36 h-44" }) => (
  <svg viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Shackle */}
    <path
      d="M52 74V42C52 26.536 64.536 14 80 14C95.464 14 108 26.536 108 42V74"
      stroke="#0D9488"
      strokeWidth="14"
      strokeLinecap="round"
    />
    
    {/* Legs */}
    <path d="M62 148V172C62 176 56 178 56 178" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />
    <path d="M98 148V172C98 176 104 178 104 178" stroke="#18181B" strokeWidth="5" strokeLinecap="round" />

    {/* Lock Body */}
    <rect x="34" y="66" width="92" height="88" rx="28" fill="#10B981" />

    {/* Sunglasses */}
    <g transform="translate(44, 88)">
      <path d="M0 8C0 3.5 3.5 0 8 0H26C30.5 0 34 3.5 34 8V12C34 16.5 30.5 20 26 20H8C3.5 20 0 16.5 0 12V8Z" fill="#18181B" />
      <path d="M38 8C38 3.5 41.5 0 46 0H64C68.5 0 72 3.5 72 8V12C72 16.5 68.5 20 64 20H46C41.5 20 38 16.5 38 12V8Z" fill="#18181B" />
      <rect x="32" y="6" width="8" height="4" fill="#18181B" />
      {/* Glare on glasses */}
      <line x1="6" y1="4" x2="16" y2="16" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="4" x2="54" y2="16" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Golden Security Star Badge */}
    <g transform="translate(92, 118)">
      <path d="M8 0L14 3V8C14 12 11 15 8 16C5 15 2 12 2 8V3L8 0Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <polygon points="8,4 9.5,7 13,7.5 10.5,10 11,13 8,11.5 5,13 5.5,10 3,7.5 6.5,7" fill="#FEF3C7" />
    </g>

    {/* Wooden Baton / Nightstick held */}
    <g transform="translate(24, 88)">
      <rect x="6" y="0" width="8" height="54" rx="4" fill="#92400E" stroke="#78350F" strokeWidth="1.5" transform="rotate(-8 6 0)" />
      <path d="M12 20C16 20 18 24 16 28" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

// 8. Field Bike Rider Mascot
export const FieldBikeMascot = ({ className = "w-64 h-48" }) => (
  <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Geofence Ring on ground */}
    <ellipse cx="140" cy="168" rx="80" ry="16" fill="#F97316" fillOpacity="0.15" stroke="#F97316" strokeWidth="2" strokeDasharray="6 4" />
    <circle cx="140" cy="168" r="5" fill="#F97316" />

    {/* Motorbike */}
    <g transform="translate(50, 60)">
      {/* Back wheel */}
      <circle cx="36" cy="100" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
      <circle cx="36" cy="100" r="14" fill="#E2E8F0" />
      <line x1="36" y1="86" x2="36" y2="114" stroke="#64748B" strokeWidth="2" />
      <line x1="22" y1="100" x2="50" y2="100" stroke="#64748B" strokeWidth="2" />

      {/* Front wheel */}
      <circle cx="136" cy="100" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
      <circle cx="136" cy="100" r="14" fill="#E2E8F0" />
      <line x1="136" y1="86" x2="136" y2="114" stroke="#64748B" strokeWidth="2" />
      <line x1="122" y1="100" x2="150" y2="100" stroke="#64748B" strokeWidth="2" />

      {/* Bike Chassis */}
      <path d="M36 100L66 70H106L136 100" stroke="#334155" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 70L86 100H120" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bike body */}
      <path d="M56 68C56 60 70 54 88 56L116 66L108 78H56V68Z" fill="#1E3A8A" />
      {/* Handlebar */}
      <path d="M116 66L124 44H114" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="130" cy="48" r="5" fill="#FBBF24" />

      {/* Rider Bean Character */}
      <g transform="translate(68, 12)">
        {/* Body */}
        <path d="M12 28C12 20 22 16 32 20C40 24 44 38 42 56L22 56C16 52 12 40 12 28Z" fill="#FF6B35" />
        <circle cx="28" cy="30" r="2.5" fill="#FFFFFF" />
        <circle cx="29" cy="30" r="1.2" fill="#18181B" />
        {/* Helmet */}
        <path d="M10 24C10 8 24 0 38 4C48 7 52 18 50 30H10V24Z" fill="#94A3B8" />
        <path d="M34 16H48C48 24 44 28 34 28V16Z" fill="#38BDF8" />
        {/* Rider Arms on Handlebar */}
        <path d="M30 40L56 34" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

// 9. Indian Architectural Skyline Sketch (Watermark in Footer)
export const IndianSkylineSketch = ({ className = "w-full h-36" }) => (
  <svg viewBox="0 0 1200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
    <g stroke="#CBD5E1" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" strokeLinejoin="round">
      {/* Bandra Worli Sea Link Cable Bridge (Left) */}
      <path d="M0 150L40 110L80 150" />
      <line x1="40" y1="70" x2="40" y2="150" strokeWidth="2.5" />
      <line x1="40" y1="75" x2="10" y2="150" />
      <line x1="40" y1="85" x2="20" y2="150" />
      <line x1="40" y1="95" x2="30" y2="150" />
      <line x1="40" y1="75" x2="70" y2="150" />
      <line x1="40" y1="85" x2="60" y2="150" />
      <line x1="40" y1="95" x2="50" y2="150" />

      {/* Taj Mahal & Minarets */}
      <g transform="translate(140, 20)">
        {/* Left Minaret */}
        <rect x="0" y="30" width="8" height="100" />
        <path d="M-2 30H10L4 16L-2 30Z" />
        {/* Main Dome */}
        <path d="M40 130V70C40 45 60 30 75 15C90 30 110 45 110 70V130" />
        <path d="M60 130V90C60 80 75 75 75 75C75 75 90 80 90 90V130" />
        <line x1="75" y1="15" x2="75" y2="0" strokeWidth="2" />
        {/* Side Domes */}
        <path d="M22 70C22 55 35 48 40 48V130H22V70Z" />
        <path d="M110 48C115 48 128 55 128 70V130H110V48Z" />
        {/* Right Minaret */}
        <rect x="142" y="30" width="8" height="100" />
        <path d="M140 30H152L146 16L140 30Z" />
      </g>

      {/* Qutub Minar Tower */}
      <g transform="translate(340, 10)">
        <polygon points="12,140 28,140 24,15 16,15" />
        <line x1="15" y1="45" x2="25" y2="45" />
        <line x1="14" y1="80" x2="26" y2="80" />
        <line x1="13" y1="110" x2="27" y2="110" />
        <path d="M16 15L20 4L24 15" />
      </g>

      {/* Hawa Mahal (Palace of Winds, Jaipur) */}
      <g transform="translate(420, 25)">
        <path d="M10 125L20 20C40 10 110 10 130 20L140 125Z" />
        {/* Multiple tiers of Jharokhas / arched windows */}
        {/* Tier 1 */}
        <path d="M30 115H50V95C50 85 40 85 40 85C40 85 30 85 30 95V115Z" />
        <path d="M65 115H85V95C85 85 75 85 75 85C75 85 65 85 65 95V115Z" />
        <path d="M100 115H120V95C120 85 110 85 110 85C110 85 100 85 100 95V115Z" />
        {/* Tier 2 */}
        <path d="M38 85H58V65C58 58 48 58 48 58C48 58 38 58 38 65V85Z" />
        <path d="M67 85H83V65C83 58 75 58 75 58C75 58 67 58 67 65V85Z" />
        <path d="M92 85H112V65C112 58 102 58 102 58C102 58 92 58 92 65V85Z" />
        {/* Crown Dome */}
        <path d="M60 30C60 20 75 14 75 14C75 14 90 20 90 30Z" />
      </g>

      {/* India Gate / Gateway of India Arch (Delhi & Mumbai) */}
      <g transform="translate(630, 40)">
        <rect x="0" y="20" width="80" height="90" rx="3" />
        <rect x="-8" y="10" width="96" height="12" rx="2" />
        <path d="M22 110V55C22 40 58 40 58 55V110" strokeWidth="2" />
        <line x1="8" y1="35" x2="72" y2="35" strokeDasharray="3 3" />
      </g>

      {/* Lotus Temple (New Delhi) */}
      <g transform="translate(770, 55)">
        <path d="M10 95C20 60 40 40 55 20C70 40 90 60 100 95" strokeWidth="1.8" />
        <path d="M25 95C35 70 48 55 55 35C62 55 75 70 85 95" />
        <path d="M40 95C45 80 50 68 55 52C60 68 65 80 70 95" />
      </g>

      {/* Modern Highrises / IT Park Towers (Bangalore / Hyderabad / Gurgaon) */}
      <g transform="translate(930, 30)">
        <rect x="0" y="20" width="35" height="100" />
        <line x1="17" y1="5" x2="17" y2="20" strokeWidth="2" />
        {/* Windows */}
        <line x1="8" y1="35" x2="27" y2="35" />
        <line x1="8" y1="50" x2="27" y2="50" />
        <line x1="8" y1="65" x2="27" y2="65" />
        <line x1="8" y1="80" x2="27" y2="80" />
        <line x1="8" y1="95" x2="27" y2="95" />

        <rect x="45" y="45" width="28" height="75" />
        <line x1="52" y1="60" x2="66" y2="60" />
        <line x1="52" y1="75" x2="66" y2="75" />
        <line x1="52" y1="90" x2="66" y2="90" />

        <rect x="82" y="10" width="40" height="110" />
        <polygon points="82,10 102,-5 122,10" />
        <line x1="90" y1="25" x2="114" y2="25" />
        <line x1="90" y1="40" x2="114" y2="40" />
        <line x1="90" y1="55" x2="114" y2="55" />
        <line x1="90" y1="70" x2="114" y2="70" />
        <line x1="90" y1="85" x2="114" y2="85" />
        <line x1="90" y1="100" x2="114" y2="100" />
      </g>

      {/* Baseline */}
      <line x1="0" y1="150" x2="1200" y2="150" strokeWidth="1.5" />
    </g>
  </svg>
);
