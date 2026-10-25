/* ==========================================================================
   Course catalog: the single source of truth for courses, chapters and
   lessons. Lesson *content* lives in js/lessons/*.js and is loaded on demand;
   everything the catalog and course pages need (titles, colours, step counts)
   lives here so those pages never have to download lesson code.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Small icon art (64×64) for lessons and chapters ---------- */
  PL.art = {
    programs: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M21 25c-7 0-9-9-2-11 1-7 10-8 13-3 3-5 12-4 13 3 7 2 5 11-2 11z" fill="#fff" stroke="#67E8F9" stroke-width="2.5"/>
      <rect x="21" y="22" width="22" height="6" rx="2" fill="#E0F7FB"/>
      <rect x="13" y="28" width="38" height="28" rx="10" fill="#0891B2"/>
      <rect x="18" y="33" width="28" height="15" rx="6" fill="#CFFAFE"/>
      <circle cx="26" cy="40.5" r="3" fill="#0E7490"/><circle cx="38" cy="40.5" r="3" fill="#0E7490"/>
      <rect x="9" y="38" width="5" height="10" rx="2.5" fill="#0E7490"/><rect x="50" y="38" width="5" height="10" rx="2.5" fill="#0E7490"/></svg>`,
    variables: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 24 L32 15 L52 24 L32 33 Z" fill="#5EEAD4"/>
      <path d="M12 24 V44 L32 53 V33 Z" fill="#14B8A6"/>
      <path d="M52 24 V44 L32 53 V33 Z" fill="#0D9488"/>
      <rect x="17" y="34" width="11" height="8" rx="2" fill="#fff" transform="rotate(24 22 38)"/>
      <rect x="26" y="5" width="12" height="12" rx="3" fill="#1E6FE8"/><text x="32" y="14.5" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" font-family="monospace">7</text></svg>`,
    numbers: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="8" width="22" height="22" rx="6" fill="#2563EB"/><rect x="34" y="8" width="22" height="22" rx="6" fill="#60A5FA"/>
      <rect x="8" y="34" width="22" height="22" rx="6" fill="#93C5FD"/><rect x="34" y="34" width="22" height="22" rx="6" fill="#1D4ED8"/>
      <path d="M19 13v12M13 19h12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M39 19h12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M14.5 40.5l9 9M23.5 40.5l-9 9" stroke="#1E3A8A" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M39 45h12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><circle cx="45" cy="39.5" r="2.3" fill="#fff"/><circle cx="45" cy="50.5" r="2.3" fill="#fff"/></svg>`,
    strings: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="7" y="13" width="50" height="38" rx="8" fill="#EA580C"/>
      <rect x="7" y="13" width="50" height="13" rx="8" fill="#C2410C"/><rect x="7" y="20" width="50" height="6" fill="#C2410C"/>
      <rect x="12" y="29" width="40" height="17" rx="4" fill="#fff"/>
      <text x="32" y="23" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff" font-family="sans-serif" letter-spacing=".5">HELLO</text>
      <text x="32" y="42" text-anchor="middle" font-size="11" font-weight="800" fill="#C2410C" font-family="monospace">"Ada"</text></svg>`,
    input: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="12" y="6" width="40" height="52" rx="7" fill="#16A34A"/>
      <rect x="17" y="11" width="22" height="30" rx="4" fill="#DCFCE7"/>
      <rect x="20" y="15" width="7" height="9" rx="2" fill="#F59E0B"/><rect x="29" y="15" width="7" height="9" rx="2" fill="#E5484D"/>
      <rect x="20" y="28" width="7" height="9" rx="2" fill="#8B3DFF"/><rect x="29" y="28" width="7" height="9" rx="2" fill="#1E6FE8"/>
      <rect x="42" y="13" width="6" height="12" rx="2" fill="#15803D"/><rect x="44" y="15" width="2" height="8" rx="1" fill="#DCFCE7"/>
      <circle cx="45" cy="31" r="2.5" fill="#BBF7D0"/><circle cx="45" cy="38" r="2.5" fill="#BBF7D0"/>
      <rect x="17" y="45" width="30" height="8" rx="3" fill="#15803D"/></svg>`,
    conditionals: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 32 H24" stroke="#DB2777" stroke-width="5" stroke-linecap="round"/>
      <path d="M30 28 C38 18 42 16 56 16" stroke="#16A34A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M30 36 C38 46 42 48 56 48" stroke="#F9A8D4" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M27 20 L39 32 L27 44 L15 32 Z" fill="#FDE68A" stroke="#F59E0B" stroke-width="3" stroke-linejoin="round"/>
      <text x="27" y="36" text-anchor="middle" font-size="12" font-weight="800" fill="#B45309" font-family="sans-serif">?</text></svg>`,
    logic: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 40 H18 M30 40 H36 M48 40 H56 V20 H44" stroke="#C4B5FD" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 40 L28 33" stroke="#9333EA" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="40" r="3" fill="#9333EA"/><circle cx="30" cy="40" r="3" fill="#9333EA"/>
      <path d="M36 40 L46 40" stroke="#9333EA" stroke-width="4" stroke-linecap="round"/><circle cx="36" cy="40" r="3" fill="#9333EA"/><circle cx="48" cy="40" r="3" fill="#9333EA"/>
      <circle cx="34" cy="18" r="10" fill="#FDE047"/><path d="M30 26 h8 v5 h-8z" fill="#A3A3A3"/>
      <path d="M8 40 V20 H24" stroke="#C4B5FD" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    loops: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M50 26 A19 19 0 1 0 51 38" stroke="#4F46E5" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M44 25 L52 27 L54 18" stroke="#4F46E5" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="32" cy="13" r="4" fill="#A5B4FC"/><circle cx="16" cy="24" r="4" fill="#818CF8"/><circle cx="16" cy="41" r="4" fill="#6366F1"/><circle cx="32" cy="51" r="4" fill="#4F46E5"/></svg>`,
    while: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M26 46 Q32 62 38 46 Z" fill="#F59E0B"/><path d="M29 46 Q32 55 35 46 Z" fill="#FDE047"/>
      <path d="M32 5 C42 12 44 26 41 44 H23 C20 26 22 12 32 5 Z" fill="#fff" stroke="#E11D48" stroke-width="3"/>
      <circle cx="32" cy="22" r="5.5" fill="#FECDD3" stroke="#E11D48" stroke-width="3"/>
      <path d="M23 32 L14 44 H23 Z M41 32 L50 44 H41 Z" fill="#E11D48"/></svg>`,
    loopctl: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="36" rx="17" ry="21" fill="#FBBF24"/>
      <ellipse cx="26" cy="27" rx="5" ry="7" fill="#FEF3C7" opacity=".8"/>
      <path d="M15 36 L22 31 L28 38 L34 31 L40 38 L46 32 L49 36" stroke="#B45309" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M50 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#F59E0B"/></svg>`,
    lists: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="24" width="16" height="18" rx="4" fill="#0369A1"/><rect x="24" y="24" width="16" height="18" rx="4" fill="#0EA5E9"/><rect x="42" y="24" width="16" height="18" rx="4" fill="#7DD3FC"/><circle cx="12" cy="46" r="3.5" fill="#0C4A6E"/><circle cx="30" cy="46" r="3.5" fill="#0C4A6E"/><circle cx="48" cy="46" r="3.5" fill="#0C4A6E"/><path d="M22 33h2M40 33h2" stroke="#0C4A6E" stroke-width="3"/></svg>`,
    listwork: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="10" width="38" height="44" rx="8" fill="#FAE8FF" stroke="#C026D3" stroke-width="3"/>
      <rect x="12" y="18" width="8" height="8" rx="2" fill="#C026D3"/><rect x="23" y="20" width="15" height="4" rx="2" fill="#E879F9"/>
      <rect x="12" y="30" width="8" height="8" rx="2" fill="#A21CAF"/><rect x="23" y="32" width="15" height="4" rx="2" fill="#E879F9"/>
      <rect x="12" y="42" width="8" height="8" rx="2" fill="#D946EF"/><rect x="23" y="44" width="11" height="4" rx="2" fill="#E879F9"/>
      <path d="M52 12 V40" stroke="#A21CAF" stroke-width="4" stroke-linecap="round"/><path d="M52 12 L60 16" stroke="#A21CAF" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="47" cy="41" rx="6.5" ry="5" fill="#A21CAF"/></svg>`,
    strseq: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
      <circle cx="32" cy="32" r="15" fill="#fff" stroke="#94A3B8" stroke-width="2.5"/>
      <text x="32" y="15" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="monospace">A</text>
      <text x="52" y="35" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="monospace">B</text>
      <text x="32" y="55" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="monospace">C</text>
      <text x="12" y="35" text-anchor="middle" font-size="9" font-weight="800" fill="#334155" font-family="monospace">Z</text>
      <text x="32" y="37" text-anchor="middle" font-size="13" font-weight="800" fill="#0F172A" font-family="monospace">D</text>
      <path d="M32 6 l-4 -4 h8z" fill="#E11D48"/></svg>`,
    tuples: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="34" r="17" fill="#8B5CF6" opacity=".55"/><circle cx="40" cy="34" r="17" fill="#C4B5FD" opacity=".75"/>
      <path d="M32 20 a17 17 0 0 1 0 28 a17 17 0 0 1 0 -28z" fill="#5B21B6"/>
      <text x="32" y="15" text-anchor="middle" font-size="12" font-weight="800" fill="#5B21B6" font-family="monospace">( , )</text></svg>`,
    dicts: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="8" width="24" height="48" rx="4" fill="#10B981"/><rect x="34" y="8" width="24" height="48" rx="4" fill="#047857"/>
      <rect x="10" y="14" width="16" height="9" rx="2" fill="#fff"/><rect x="38" y="14" width="16" height="9" rx="2" fill="#fff"/>
      <path d="M12 30 h12 M12 34 h12 M40 30 h12 M40 34 h12" stroke="#065F46" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="23" y="40" width="3" height="8" rx="1.5" fill="#D1FAE5"/><rect x="51" y="40" width="3" height="8" rx="1.5" fill="#D1FAE5"/></svg>`,
    functions: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 6 H44 L38 18 H26 Z" fill="#FDBA74" stroke="#C2410C" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="32" cy="9" r="5" fill="#F97316"/>
      <rect x="12" y="18" width="40" height="26" rx="7" fill="#4D7C0F"/>
      <rect x="18" y="24" width="28" height="9" rx="3" fill="#ECFCCB"/>
      <text x="32" y="31.5" text-anchor="middle" font-size="8" font-weight="800" fill="#3F6212" font-family="monospace">def</text>
      <rect x="29" y="44" width="6" height="5" fill="#3F6212"/>
      <path d="M23 49 H41 L39 60 H25 Z" fill="#fff" stroke="#94A3B8" stroke-width="2"/>
      <path d="M24.5 53 H39.5 L38.6 59 H25.4 Z" fill="#FB923C"/></svg>`,
    params: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="34" r="25" fill="#F59E0B"/><circle cx="32" cy="34" r="20" fill="#DC2626"/>
      <circle cx="32" cy="34" r="20" fill="none" stroke="#FDE68A" stroke-width="2" stroke-dasharray="3 5"/>
      <circle cx="24" cy="27" r="4" fill="#7F1D1D"/><circle cx="40" cy="30" r="4" fill="#7F1D1D"/><circle cx="30" cy="43" r="4" fill="#7F1D1D"/><circle cx="41" cy="42" r="3" fill="#FEF3C7"/><circle cx="22" cy="38" r="3" fill="#FEF3C7"/>
      <path d="M32 34 L32 9 M32 34 L54 46" stroke="#FCD34D" stroke-width="2.5"/></svg>`,
    scope: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 30 L32 8 L58 30" fill="none" stroke="#854D0E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="12" y="28" width="40" height="30" rx="3" fill="#FEF3C7" stroke="#A16207" stroke-width="3"/>
      <path d="M32 28 V58" stroke="#A16207" stroke-width="3"/>
      <rect x="16" y="33" width="12" height="10" rx="2" fill="#FDE047"/><rect x="36" y="33" width="12" height="10" rx="2" fill="#86EFAC"/>
      <rect x="37" y="46" width="8" height="12" rx="1.5" fill="#A16207"/></svg>`,
    callstack: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="52" rx="24" ry="6" fill="#155E75"/><ellipse cx="32" cy="50" rx="24" ry="6" fill="#CFFAFE" stroke="#0E7490" stroke-width="2.5"/>
      <ellipse cx="32" cy="40" rx="22" ry="5.5" fill="#155E75"/><ellipse cx="32" cy="38" rx="22" ry="5.5" fill="#fff" stroke="#0E7490" stroke-width="2.5"/>
      <ellipse cx="32" cy="28" rx="20" ry="5" fill="#155E75"/><ellipse cx="32" cy="26" rx="20" ry="5" fill="#A5F3FC" stroke="#0E7490" stroke-width="2.5"/>
      <path d="M32 6 V16 M27 11 L32 16 L37 11" stroke="#0E7490" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    rps: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 40 C6 30 14 22 24 24 C32 22 36 30 33 38 C32 46 24 50 16 48 C11 47 9 44 8 40 Z" fill="#94A3B8" stroke="#475569" stroke-width="2.5"/>
      <rect x="30" y="8" width="24" height="30" rx="3" fill="#fff" stroke="#BE185D" stroke-width="2.5" transform="rotate(8 42 23)"/>
      <path d="M36 16 H50 M35.5 21 H49.5 M35 26 H46" stroke="#F9A8D4" stroke-width="2" stroke-linecap="round" transform="rotate(8 42 23)"/>
      <circle cx="42" cy="51" r="5" fill="none" stroke="#BE185D" stroke-width="3"/><circle cx="54" cy="51" r="5" fill="none" stroke="#BE185D" stroke-width="3"/>
      <path d="M45 47 L56 34 M51 47 L40 34" stroke="#9D174D" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    errors: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 16 a4 4 0 0 1 4 -4 H24 L29 18 H52 a4 4 0 0 1 4 4 V50 a4 4 0 0 1 -4 4 H10 a4 4 0 0 1 -4 -4 Z" fill="#FDE68A" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="13" y="25" width="26" height="22" rx="2" fill="#fff" stroke="#E5E7EB" stroke-width="1.5"/>
      <path d="M17 31 H34 M17 36 H30 M17 41 H32" stroke="#FCA5A5" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="42" cy="36" r="10" fill="#E0E7FF" fill-opacity=".7" stroke="#4338CA" stroke-width="4"/>
      <path d="M49 43 L57 51" stroke="#3730A3" stroke-width="5.5" stroke-linecap="round"/></svg>`,
    tryexcept: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 6 V22 M54 6 V22" stroke="#9A3412" stroke-width="2.5"/><path d="M18 6 L26 20 M46 6 L38 20" stroke="#64748B" stroke-width="2"/>
      <rect x="22" y="19" width="20" height="4" rx="2" fill="#C2410C"/>
      <circle cx="32" cy="29" r="4.5" fill="#FDBA74"/><path d="M32 33 V42 M32 36 L26 23 M32 36 L38 23 M32 42 L27 49 M32 42 L37 49" stroke="#C2410C" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M4 50 Q32 64 60 50" fill="none" stroke="#9A3412" stroke-width="3"/>
      <path d="M8 52 L14 56 M16 55 L20 58 M26 57 L30 59 M36 59 L40 57 M45 57 L49 55 M52 55 L56 52 M12 51 Q32 61 52 51" stroke="#FDBA74" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    search: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 52 H60" stroke="#115E59" stroke-width="4" stroke-linecap="round"/>
      <rect x="7" y="22" width="8" height="28" rx="2" fill="#5EEAD4"/><rect x="16" y="16" width="8" height="34" rx="2" fill="#2DD4BF"/><rect x="25" y="26" width="8" height="24" rx="2" fill="#99F6E4"/>
      <rect x="34" y="12" width="9" height="38" rx="2" fill="#0F766E"/><rect x="44" y="20" width="8" height="30" rx="2" fill="#5EEAD4"/><rect x="53" y="24" width="6" height="26" rx="2" fill="#2DD4BF"/>
      <path d="M38.5 4 V10 M35 7 L38.5 10.5 L42 7" stroke="#F59E0B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    sorting: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 58 H60" stroke="#701A75" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="11" cy="38" r="5" fill="#F0ABFC"/><rect x="6" y="44" width="10" height="13" rx="4" fill="#C026D3"/>
      <circle cx="25" cy="31" r="5" fill="#F0ABFC"/><rect x="20" y="37" width="10" height="20" rx="4" fill="#A21CAF"/>
      <circle cx="39" cy="23" r="5" fill="#F0ABFC"/><rect x="34" y="29" width="10" height="28" rx="4" fill="#86198F"/>
      <circle cx="53" cy="13" r="5" fill="#F0ABFC"/><rect x="48" y="19" width="10" height="38" rx="4" fill="#701A75"/></svg>`,
    bigo: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 6 V56 H60" stroke="#94A3B8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 50 H58" stroke="#86EFAC" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M10 54 L56 26" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M10 54 C30 52 38 40 44 8" stroke="#15803D" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="8" r="4" fill="#DC2626"/></svg>`,
    recur: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 58 H60" stroke="#9F1239" stroke-width="3" stroke-linecap="round"/>
      <path d="M6 56 C3 44 6 36 13 32 C8 27 9 14 19 12 C29 14 30 27 25 32 C32 36 35 44 32 56 Z" fill="#E11D48"/><ellipse cx="19" cy="21" rx="6" ry="5.5" fill="#FFE4C7"/><ellipse cx="19" cy="44" rx="8" ry="9" fill="#FFF1F2"/><circle cx="19" cy="44" r="3" fill="#E11D48"/>
      <path d="M36 56 C34 48 36 42 41 39 C38 35 39 26 45 25 C51 26 52 35 49 39 C54 42 56 48 54 56 Z" fill="#F59E0B"/><ellipse cx="45" cy="31" rx="4" ry="3.6" fill="#FFE4C7"/><ellipse cx="45" cy="47" rx="5" ry="6" fill="#FFF7ED"/>
      <path d="M55 56 C54 52 55 49 57 48 C56 46 56 42 59 42 C62 42 62 46 61 48 C63 49 64 52 63 56 Z" fill="#7C3AED"/></svg>`,
    fractals: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 60 V40 M32 40 L20 28 M32 40 L44 28 M20 28 L13 22 M20 28 L22 18 M44 28 L42 18 M44 28 L51 22" stroke="#1E40AF" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M13 22 l-4 -3 M13 22 l-1 -5 M22 18 l-3 -4 M22 18 l2 -5 M42 18 l-2 -5 M42 18 l3 -4 M51 22 l1 -5 M51 22 l4 -3" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="9" cy="19" r="2.4" fill="#F9A8D4"/><circle cx="24" cy="13" r="2.4" fill="#F9A8D4"/><circle cx="45" cy="14" r="2.4" fill="#F9A8D4"/><circle cx="55" cy="19" r="2.4" fill="#F9A8D4"/></svg>`,
    modules: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="24" width="48" height="30" rx="5" fill="#FDBA74" stroke="#9A3412" stroke-width="3"/>
      <path d="M24 24 V17 a3 3 0 0 1 3 -3 h10 a3 3 0 0 1 3 3 V24" fill="none" stroke="#7C2D12" stroke-width="4"/>
      <rect x="6" y="22" width="52" height="8" rx="3" fill="#C2410C"/>
      <path d="M22 44 l8 -8" stroke="#7C2D12" stroke-width="3.5" stroke-linecap="round"/><circle cx="31" cy="35" r="4" fill="none" stroke="#7C2D12" stroke-width="3"/><circle cx="44" cy="41" r="5" fill="#FFF7ED" stroke="#7C2D12" stroke-width="2.5"/></svg>`,
    files: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="12" y="6" width="40" height="52" rx="5" fill="#F3E8FF" stroke="#6B21A8" stroke-width="3"/>
      <rect x="12" y="6" width="9" height="52" rx="4" fill="#A855F7"/>
      <path d="M27 20 H45 M27 29 H45 M27 38 H40" stroke="#7E22CE" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 50 l14 -14 4 4 -14 14 -6 2 z" fill="#FACC15" stroke="#6B21A8" stroke-width="2" stroke-linejoin="round"/></svg>`,
    comps: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="40" width="56" height="8" rx="4" fill="#164E63"/><circle cx="12" cy="52" r="4" fill="#0E7490"/><circle cx="32" cy="52" r="4" fill="#0E7490"/><circle cx="52" cy="52" r="4" fill="#0E7490"/>
      <rect x="24" y="14" width="16" height="18" rx="3" fill="#22D3EE" stroke="#155E75" stroke-width="2.5"/><path d="M32 32 V38" stroke="#155E75" stroke-width="3"/>
      <rect x="6" y="30" width="9" height="9" rx="2" fill="#FDE68A"/><rect x="48" y="28" width="11" height="11" rx="2" fill="#F59E0B"/></svg>`,
    classes: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 6 l4.5 13 h13.5 l-11 8 4 13 -11 -8 -11 8 4 -13 -11 -8 h13.5z" fill="none" stroke="#9CA3AF" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 22 l4 11.5 h12 l-9.8 7 3.6 11.5 -9.8 -7 -9.8 7 3.6 -11.5 -9.8 -7 h12z" fill="#B45309"/>
      <path d="M26 34 l4 11.5 h12 l-9.8 7 3.6 11.5 -9.8 -7 -9.8 7 3.6 -11.5 -9.8 -7 h12z" fill="#F472B6" transform="translate(-6 -6)"/>
      <rect x="40" y="36" width="5" height="2" rx="1" fill="#fff"/><rect x="47" y="40" width="5" height="2" rx="1" fill="#FDE047"/><rect x="17" y="44" width="5" height="2" rx="1" fill="#fff"/></svg>`,
    methods: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="38" rx="22" ry="19" fill="#6EE7B7" stroke="#047857" stroke-width="3"/>
      <circle cx="24" cy="34" r="4" fill="#064E3B"/><circle cx="40" cy="34" r="4" fill="#064E3B"/>
      <path d="M25 44 q7 6 14 0" stroke="#064E3B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M18 22 l-4 -12 10 7 M46 22 l4 -12 -10 7" fill="#6EE7B7" stroke="#047857" stroke-width="3" stroke-linejoin="round"/></svg>`,
    inherit: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 18 V28 M14 40 V30 H50 V40 M32 30 V40" stroke="#5B21B6" stroke-width="3" fill="none"/>
      <rect x="20" y="4" width="24" height="15" rx="5" fill="#8B5CF6"/>
      <rect x="4" y="40" width="20" height="14" rx="5" fill="#C4B5FD"/><rect x="22" y="40" width="20" height="14" rx="5" fill="#C4B5FD"/><rect x="40" y="40" width="20" height="14" rx="5" fill="#C4B5FD"/></svg>`,
    dunder: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 56 H58 M8 56 V6" stroke="#BAE6FD" stroke-width="3"/>
      <path d="M10 54 L30 42" stroke="#0EA5E9" stroke-width="4" stroke-linecap="round"/><path d="M30 42 L52 16" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
      <path d="M10 54 L52 16" stroke="#F59E0B" stroke-width="3" stroke-dasharray="4 4"/>
      <path d="M52 16 l-9 2 m9 -2 l-1 9" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/></svg>`,
    stacks: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="56" rx="26" ry="5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2.5"/>
      <rect x="12" y="44" width="40" height="9" rx="4.5" fill="#F6C177"/><rect x="12" y="34" width="40" height="9" rx="4.5" fill="#8B5A3C"/>
      <rect x="12" y="24" width="40" height="9" rx="4.5" fill="#8B5CF6"/><rect x="12" y="14" width="40" height="9" rx="4.5" fill="#F472B6"/>
      <path d="M32 2 v8 m-4 -4 l4 4 4 -4" stroke="#BE185D" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    refs: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 34 C28 44 16 46 12 56 M32 34 C36 44 48 46 52 56" stroke="#64748B" stroke-width="2" fill="none"/>
      <ellipse cx="32" cy="18" rx="15" ry="17" fill="#818CF8"/><path d="M29 34 h6 l-3 4z" fill="#4338CA"/>
      <ellipse cx="27" cy="12" rx="4" ry="6" fill="#C7D2FE"/>
      <rect x="2" y="52" width="20" height="10" rx="3" fill="#FDE047"/><rect x="42" y="52" width="20" height="10" rx="3" fill="#FDE047"/></svg>`,
    trees: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 18 V26 M14 38 V30 H50 V38 M50 46 V52 H42 M50 52 H58" stroke="#65A30D" stroke-width="3" fill="none"/>
      <path d="M22 6 h8 l3 3 h11 v11 H22z" fill="#4D7C0F"/>
      <path d="M4 36 h7 l2 2 h9 v9 H4z" fill="#A3E635"/><path d="M40 36 h7 l2 2 h9 v9 H40z" fill="#A3E635"/>
      <rect x="36" y="52" width="10" height="11" rx="2" fill="#ECFCCB" stroke="#65A30D" stroke-width="2"/><rect x="53" y="52" width="10" height="11" rx="2" fill="#ECFCCB" stroke="#65A30D" stroke-width="2"/></svg>`,
    graphs: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 14 L32 30 L52 12 M32 30 L18 52 M32 30 L50 48 M18 52 L50 48 M12 14 L18 52" stroke="#CA8A04" stroke-width="3" fill="none"/>
      <circle cx="12" cy="14" r="7" fill="#A16207"/><circle cx="52" cy="12" r="7" fill="#EAB308"/><circle cx="32" cy="30" r="7" fill="#A16207"/>
      <circle cx="18" cy="52" r="7" fill="#EAB308"/><circle cx="50" cy="48" r="7" fill="#A16207"/></svg>`,
    hashing: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="8" width="56" height="6" rx="3" fill="#155E75"/>
      <path d="M14 14 v6 M28 14 v6 M42 14 v6 M54 14 v6" stroke="#155E75" stroke-width="3" stroke-linecap="round"/>
      <path d="M8 22 h12 l2 26 H6z" fill="#22D3EE"/><path d="M36 22 h12 l2 30 H34z" fill="#F472B6"/>
      <rect x="22" y="50" width="12" height="9" rx="2" fill="#FDE047"/><text x="28" y="57.5" font-size="7" font-weight="800" text-anchor="middle" fill="#713F12" font-family="monospace">#3</text></svg>`,
    memo: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M4 58 H18 V46 H30 V34 H42 V22 H54 V10 H60 V58z" fill="#FDBA74"/>
      <path d="M4 58 H18 V46 H30 V34 H42 V22 H54 V10" stroke="#C2410C" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <rect x="6" y="8" width="20" height="24" rx="3" fill="#fff" stroke="#9A3412" stroke-width="2.5"/>
      <path d="M10 15 h12 M10 20 h12 M10 25 h8" stroke="#C2410C" stroke-width="2" stroke-linecap="round"/></svg>`,
    lambdas: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#FDE047" transform="rotate(-6 32 32)"/>
      <path d="M22 46 L32 24 M26 18 L42 46" stroke="#A21CAF" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
    generators: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="24" r="19" fill="#E0F2FE" stroke="#94A3B8" stroke-width="3"/>
      <circle cx="25" cy="20" r="5" fill="#F87171"/><circle cx="37" cy="17" r="5" fill="#FBBF24"/><circle cx="33" cy="29" r="5" fill="#34D399"/><circle cx="24" cy="31" r="5" fill="#60A5FA"/>
      <path d="M18 42 h28 l4 18 H14z" fill="#DC2626"/><circle cx="32" cy="50" r="4" fill="#FDE68A"/></svg>`,
    decorators: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="26" width="44" height="32" rx="4" fill="#8B5CF6"/><rect x="6" y="18" width="52" height="11" rx="3" fill="#A78BFA"/>
      <rect x="28" y="18" width="8" height="40" fill="#FDE047"/>
      <path d="M32 18 C24 4 12 10 22 18 M32 18 C40 4 52 10 42 18" stroke="#FDE047" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    dataformats: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 6 h28 l12 12 v40 H12z" fill="#fff" stroke="#15803D" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 6 v12 h12" fill="#DCFCE7" stroke="#15803D" stroke-width="3" stroke-linejoin="round"/>
      <path d="M18 28 h28 M18 38 h28 M18 48 h28 M28 24 v28 M38 24 v28" stroke="#86EFAC" stroke-width="2.5"/>
      <text x="32" y="20" font-size="9" font-weight="800" text-anchor="middle" fill="#166534" font-family="monospace">{ }</text></svg>`,
    numpy: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="6" width="52" height="52" rx="8" fill="#0F172A"/>
      <rect x="10" y="10" width="13" height="13" rx="2" fill="#475569"/><rect x="25.5" y="10" width="13" height="13" rx="2" fill="#94A3B8"/><rect x="41" y="10" width="13" height="13" rx="2" fill="#334155"/>
      <rect x="10" y="25.5" width="13" height="13" rx="2" fill="#CBD5E1"/><rect x="25.5" y="25.5" width="13" height="13" rx="2" fill="#fff"/><rect x="41" y="25.5" width="13" height="13" rx="2" fill="#94A3B8"/>
      <rect x="10" y="41" width="13" height="13" rx="2" fill="#334155"/><rect x="25.5" y="41" width="13" height="13" rx="2" fill="#64748B"/><rect x="41" y="41" width="13" height="13" rx="2" fill="#2563EB"/></svg>`,
    pandas: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="10" width="52" height="44" rx="6" fill="#fff" stroke="#B45309" stroke-width="3"/>
      <path d="M9 12 h46 a3 3 0 0 1 3 3 v7 H6 v-7 a3 3 0 0 1 3 -3z" fill="#F59E0B"/>
      <path d="M6 33 H58 M6 44 H58 M22 22 V54" stroke="#FCD34D" stroke-width="2.5"/>
      <circle cx="31" cy="28" r="3" fill="#DC2626"/><circle cx="31" cy="39" r="3" fill="#2563EB"/><circle cx="31" cy="49" r="3" fill="#15803D"/></svg>`,
    charts: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="8" width="52" height="48" rx="6" fill="#fff" stroke="#0F766E" stroke-width="3"/>
      <path d="M12 48 L24 40 L34 42 L50 18" stroke="#0F766E" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="18" r="6" fill="#FACC15"/><circle cx="50" cy="18" r="2.5" fill="#92400E"/></svg>`,
    random: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="14" width="30" height="30" rx="7" fill="#fff" stroke="#E11D48" stroke-width="3" transform="rotate(-12 21 29)"/>
      <circle cx="14" cy="23" r="3" fill="#0F172A"/><circle cx="21" cy="29" r="3" fill="#0F172A"/><circle cx="28" cy="35" r="3" fill="#0F172A"/>
      <rect x="30" y="24" width="28" height="28" rx="7" fill="#E11D48" transform="rotate(10 44 38)"/>
      <circle cx="38" cy="32" r="3" fill="#fff"/><circle cx="50" cy="44" r="3" fill="#fff"/><circle cx="50" cy="32" r="3" fill="#fff"/><circle cx="38" cy="44" r="3" fill="#fff"/></svg>`,
    learner: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 6 V58 H58" stroke="#94A3B8" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="9" y="6" width="25" height="49" rx="4" fill="#FFE4E6"/><rect x="34" y="6" width="22" height="49" rx="4" fill="#FEF3C7"/>
      <circle cx="18" cy="18" r="5" fill="#DC2626"/><circle cx="25" cy="32" r="5" fill="#DC2626"/><circle cx="16" cy="44" r="5" fill="#DC2626"/>
      <circle cx="44" cy="20" r="5" fill="#F97316"/><circle cx="48" cy="38" r="5" fill="#F97316"/>
      <circle cx="33" cy="26" r="6" fill="#fff" stroke="#047857" stroke-width="3" stroke-dasharray="3 2"/></svg>`,
    capstone: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M22 30 L32 60 L42 30z" fill="#F59E0B"/><path d="M24 34 L40 34 M26 41 L38 41 M28 48 L36 48" stroke="#B45309" stroke-width="2"/>
      <circle cx="32" cy="22" r="13" fill="#F9A8D4"/><circle cx="24" cy="27" r="8" fill="#FDE68A"/><circle cx="40" cy="27" r="8" fill="#BAE6FD"/>
      <path d="M44 6 l2.5 5 5.5 .8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8z" fill="#0369A1"/></svg>`,
    vectors: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#1E1B4B"/>
      <circle cx="14" cy="14" r="1.6" fill="#fff"/><circle cx="48" cy="12" r="1.2" fill="#fff"/><circle cx="52" cy="40" r="1.4" fill="#fff"/><circle cx="22" cy="50" r="1.2" fill="#C7D2FE"/>
      <path d="M14 50 H40" stroke="#F59E0B" stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round"/><path d="M40 50 V24" stroke="#38BDF8" stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round"/>
      <path d="M14 50 L36 28" stroke="#A5B4FC" stroke-width="4.5" stroke-linecap="round"/><path d="M42 22 L28 26 L38 36z" fill="#A5B4FC"/></svg>`,
    vecadd: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFEDD5"/>
      <path d="M10 50 L30 40" stroke="#C2410C" stroke-width="4.5" stroke-linecap="round"/><path d="M35 37.5 L24 37 L28 45z" fill="#C2410C"/>
      <path d="M33 39 L44 20" stroke="#0EA5E9" stroke-width="4.5" stroke-linecap="round"/><path d="M47 15 L38 21 L46 25z" fill="#0EA5E9"/>
      <path d="M10 50 L42 20" stroke="#9A3412" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round"/>
      <path d="M44 48 h10 M47 43 v10" stroke="#9A3412" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    distance: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#CCFBF1"/>
      <circle cx="20" cy="40" r="10" fill="none" stroke="#5EEAD4" stroke-width="2.5"/><circle cx="20" cy="40" r="19" fill="none" stroke="#99F6E4" stroke-width="2.5"/>
      <ellipse cx="20" cy="40" rx="9" ry="5.5" fill="#FACC15"/><rect x="17" y="31" width="5" height="6" rx="1.5" fill="#EAB308"/><circle cx="23" cy="40" r="2" fill="#0F766E"/>
      <path d="M20 40 L48 18" stroke="#0F766E" stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round"/>
      <path d="M48 11 l6 6 -6 8 -6 -8z" fill="#0EA5E9" stroke="#0369A1" stroke-width="1.5"/></svg>`,
    bigvectors: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="9" y="5" width="46" height="54" rx="8" fill="#fff" stroke="#9333EA" stroke-width="3"/>
      <circle cx="32" cy="22" r="10" fill="#C084FC"/><circle cx="28" cy="20" r="2.4" fill="#fff"/><circle cx="36" cy="20" r="2.4" fill="#fff"/><circle cx="28" cy="20.5" r="1.1" fill="#3B0764"/><circle cx="36" cy="20.5" r="1.1" fill="#3B0764"/>
      <path d="M26 12 l-3 -5 M38 12 l3 -5" stroke="#9333EA" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="15" y="37" width="24" height="4" rx="2" fill="#F59E0B"/><rect x="15" y="44" width="14" height="4" rx="2" fill="#EF4444"/><rect x="15" y="51" width="30" height="4" rx="2" fill="#6366F1"/></svg>`,
    similarity: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 52 L50 30" stroke="#0EA5E9" stroke-width="5" stroke-linecap="round"/><path d="M12 52 L44 14" stroke="#6366F1" stroke-width="5" stroke-linecap="round"/><path d="M30 42 A20 20 0 0 0 26 35" stroke="#F59E0B" stroke-width="3" fill="none"/></svg>`,
    'functions-graphs': `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 56 H58 M8 56 V6" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/><path d="M10 52 C26 50 34 16 56 10" stroke="#0EA5E9" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>`,
    slopes: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 56 L26 18 L38 34 L46 26 L60 56z" fill="#BAE6FD"/><path d="M14 42 L26 22" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="18" r="4" fill="#F59E0B"/></svg>`,
    matrices: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 8 H8 V56 H14 M50 8 H56 V56 H50" stroke="#475569" stroke-width="3.5" fill="none" stroke-linecap="round"/>${[16, 32, 48].map((y) => [20, 32, 44].map((x) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${(x + y) % 3 ? '#0EA5E9' : '#7DD3FC'}"/>`).join('')).join('')}</svg>`,
    chance: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="28" width="48" height="28" rx="5" fill="#B45309"/><path d="M8 32 Q32 6 56 32z" fill="#D97706"/><rect x="28" y="30" width="8" height="10" rx="2" fill="#FDE047"/><circle cx="20" cy="14" r="3" fill="#FDE047"/><circle cx="46" cy="10" r="2.5" fill="#FDE047"/></svg>`,
    dotproduct: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#DBEAFE"/>
      <path d="M8 46 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#fff" stroke-width="3" fill="none"/>
      <path d="M16 40 H46 L50 34 L46 48 H20z" fill="#92400E"/><path d="M31 40 V14" stroke="#78350F" stroke-width="3"/>
      <path d="M33 16 Q46 26 33 38z" fill="#FFFBEB" stroke="#D6D3D1" stroke-width="1.5"/><rect x="31" y="8" width="10" height="6" fill="#111827"/>
      <path d="M8 24 H22" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/><path d="M26 24 l-6 -4 v8z" fill="#0284C7"/></svg>`,
    cosine: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FAE8FF"/>
      <path d="M12 52 L50 34" stroke="#C026D3" stroke-width="4" stroke-linecap="round"/><path d="M12 52 L40 18" stroke="#0891B2" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 44 A20 20 0 0 0 25 37" stroke="#F59E0B" stroke-width="3" fill="none"/>
      <ellipse cx="50" cy="16" rx="8" ry="7.5" fill="#C026D3"/><circle cx="47" cy="15" r="2" fill="#fff"/><circle cx="53" cy="15" r="2" fill="#fff"/><path d="M50 9 l2 -5" stroke="#C026D3" stroke-width="2"/></svg>`,
    potions: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#D1FAE5"/>
      <polygon points="14,10 34,10 28,20 20,20" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
      <rect x="10" y="20" width="32" height="26" rx="6" fill="#059669" stroke="#065F46" stroke-width="2.5"/>
      <rect x="16" y="26" width="20" height="11" rx="3" fill="#ECFDF5"/><text x="26" y="35" font-size="9" font-weight="800" text-anchor="middle" fill="#065F46" font-family="monospace">×3</text>
      <path d="M48 30 h4 v4 q6 3 6 10 v6 q0 4 -4 4 h-12 q-4 0 -4 -4 v-6 q0 -7 6 -10z" fill="#C4B5FD" stroke="#065F46" stroke-width="2"/><rect x="42" y="38" width="4" height="4" fill="#B45309"/></svg>`,
    plotting: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#DBEAFE"/>
      <path d="M10 54 H56 M10 54 V8" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M12 52 Q32 -2 54 52" stroke="#2563EB" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="18" cy="38" r="3.5" fill="#2563EB"/><circle cx="25" cy="27" r="3.5" fill="#2563EB"/><circle cx="33" cy="25" r="3.5" fill="#F59E0B"/><circle cx="41" cy="29" r="3.5" fill="#2563EB"/><circle cx="48" cy="40" r="3.5" fill="#2563EB"/></svg>`,
    lines: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FEF3C7"/>
      <path d="M8 52 L56 16" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
      <path d="M16 46 H26 V38.5 M26 38.5 H36 V31" stroke="#F59E0B" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>
      <rect x="40" y="10" width="16" height="5" rx="2.5" fill="#0E7490" transform="rotate(-37 48 12)"/><circle cx="43" cy="20" r="2.5" fill="#1E293B"/><circle cx="52" cy="13" r="2.5" fill="#1E293B"/></svg>`,
    curves: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#ECFCCB"/>
      <path d="M8 52 C30 52 38 46 46 30 S54 8 56 6" stroke="#DB2777" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M8 40 Q22 64 36 40" stroke="#65A30D" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="51" r="4" fill="#84CC16" stroke="#3F6212" stroke-width="1.5"/></svg>`,
    slope: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#E0F2FE"/>
      <path d="M4 56 L30 14 L44 34 L52 26 L60 38 V56z" fill="#94A3B8"/><path d="M24 24 L30 14 L36 23 Q30 20 24 24z" fill="#fff"/>
      <path d="M12 48 H24 V30" stroke="#EA580C" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>
      <path d="M12 48 L24 30" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="30" r="3.5" fill="#DC2626"/></svg>`,
    rate: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFE4E6"/>
      <path d="M10 54 V10 M10 54 H56" stroke="#9F1239" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
      <path d="M12 52 L24 46 L30 46 L42 22 L54 16" stroke="#BE123C" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="30" y="36" width="20" height="7" rx="3" fill="#BE123C"/><path d="M35 36 l3 -4 h6 l3 4z" fill="#BE123C"/><circle cx="35" cy="44" r="2.6" fill="#1E293B"/><circle cx="45" cy="44" r="2.6" fill="#1E293B"/></svg>`,
    zoom: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#EDE9FE"/>
      <path d="M6 46 C16 46 18 16 30 16 S44 50 58 44" stroke="#6D28D9" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="11" fill="#fff" fill-opacity=".6" stroke="#DB2777" stroke-width="3.5"/><path d="M32 32 L40 40" stroke="#DB2777" stroke-width="5" stroke-linecap="round"/>
      <path d="M16 32 L32 16" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    descent: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#CFFAFE"/>
      <path d="M6 14 C16 54 48 54 58 14 V56 H6z" fill="#E7D3A8"/>
      <path d="M12 22 L20 34 M22 38 L28 44" stroke="#0E7490" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 4"/>
      <circle cx="32" cy="44" r="4" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/><circle cx="14" cy="18" r="6" fill="#C026D3"/><circle cx="12" cy="17" r="1.4" fill="#fff"/><circle cx="16" cy="17" r="1.4" fill="#fff"/></svg>`,
    weighted: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#DCFCE7"/>
      <path d="M8 8 H20 Q16 30 20 50 L8 56z M56 8 H44 Q48 30 44 50 L56 56z" fill="#DC2626"/>
      <circle cx="32" cy="28" r="11" fill="#A16207"/><circle cx="28" cy="26" r="3.5" fill="#fff"/><circle cx="36" cy="26" r="3.5" fill="#fff"/><circle cx="28" cy="26" r="1.6"/><circle cx="36" cy="26" r="1.6"/><path d="M30 31 l2 3 2 -3z" fill="#F59E0B"/>
      <rect x="20" y="42" width="24" height="12" rx="3" fill="#166534"/><text x="32" y="51.5" font-size="9" font-weight="800" fill="#fff" text-anchor="middle" font-family="sans-serif">×2</text></svg>`,
    matrix: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FEF9C3"/>
      <path d="M14 12 H9 V52 H14 M40 12 H45 V52 H40" stroke="#854D0E" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${[20, 32, 44].map((y, r) => [17, 27, 37].map((x, c) => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="2" fill="${r === 1 ? '#EAB308' : '#FDE68A'}"/>`).join('')).join('')}
      <rect x="49" y="16" width="9" height="32" rx="3" fill="#0EA5E9"/></svg>`,
    transform: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FCE7F3"/>
      <path d="M10 46 L22 18 L50 22 L38 50z" fill="#fff" stroke="#BE185D" stroke-width="2"/>
      <path d="M18 40 L32 33" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round"/><path d="M18 40 L25 25" stroke="#2563EB" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M33 28 l3 -6 3 6z M43 28 l3 -6 3 6z" fill="#9D174D"/></svg>`,
    combine: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#E0E7FF"/>
      ${[0, 1].map((c) => [0, 1, 2].map((r) => `<rect x="${12 + c * 21}" y="${10 + r * 15}" width="18" height="12" rx="3" fill="${c === 0 && r < 2 ? '#22C55E' : '#C7D2FE'}"/>`).join('')).join('')}
      <circle cx="52" cy="50" r="7" fill="#94A3B8"/><circle cx="48" cy="44" r="3" fill="#CBD5E1"/><circle cx="56" cy="44" r="3" fill="#CBD5E1"/><circle cx="52" cy="51" r="1.4" fill="#F472B6"/></svg>`,
    spread: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#D1FAE5"/>
      <path d="M8 52 C22 52 24 16 32 16 S42 52 56 52" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="34" r="9" fill="#fff" stroke="#DC2626" stroke-width="3"/><circle cx="32" cy="34" r="3.5" fill="#DC2626"/></svg>`,
    bayes: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#EDE9FE"/>
      <path d="M12 56 V30 l8 -8 8 8 V56z M36 56 V24 l8 -10 8 10 V56z" fill="#7C3AED"/><rect x="40" y="34" width="8" height="10" rx="4" fill="#FDE047"/>
      <path d="M18 40 q0 -10 8 -10 q8 0 8 10 v10 l-3 -3 -2.5 3 -2.5 -3 -2.5 3 -2.5 -3 -3 3z" fill="#fff" stroke="#5B21B6" stroke-width="1.5"/><circle cx="23" cy="38" r="1.6"/><circle cx="29" cy="38" r="1.6"/></svg>`,
    nextword: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFE4E6"/>
      <path d="M32 34 L32 10 A24 24 0 0 1 54 40 Z" fill="#BE123C"/><path d="M32 34 L54 40 A24 24 0 0 1 20 55 Z" fill="#F59E0B"/><path d="M32 34 L20 55 A24 24 0 0 1 32 10 Z" fill="#0EA5E9"/>
      <path d="M27 4 H37 L32 13z" fill="#1E293B"/><circle cx="32" cy="34" r="4" fill="#fff"/></svg>`,
    mlrules: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="14" width="40" height="30" rx="5" fill="#1D4ED8"/>
      <path d="M8 17 L26 31 L44 17" stroke="#BFDBFE" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <rect x="14" y="24" width="40" height="30" rx="5" fill="#fff" stroke="#93C5FD" stroke-width="2.5"/>
      <path d="M20 32 h20 M20 39 h26 M20 46 h14" stroke="#BFDBFE" stroke-width="3" stroke-linecap="round"/>
      <circle cx="47" cy="44" r="11" fill="#fff" stroke="#DC2626" stroke-width="3.5"/>
      <path d="M39.5 51.5 L54.5 36.5" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    mldata: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="6" y="10" width="40" height="44" rx="6" fill="#fff" stroke="#5EEAD4" stroke-width="2.5"/>
      <rect x="6" y="10" width="40" height="10" rx="6" fill="#0F766E"/><rect x="6" y="16" width="40" height="4" fill="#0F766E"/>
      <path d="M6 31 H46 M6 42 H46 M20 20 V54 M33 20 V54" stroke="#99F6E4" stroke-width="2"/>
      <rect x="36" y="22" width="22" height="36" rx="5" fill="#134E4A"/><rect x="39" y="26" width="16" height="25" rx="2" fill="#CCFBF1"/>
      <circle cx="47" cy="54.5" r="1.8" fill="#5EEAD4"/>
      <path d="M43 40 l3 3 6 -7" stroke="#0F766E" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    mlloop: `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 14 L40 22 L18 54 Z" fill="#FDE68A" stroke="#D97706" stroke-width="3" stroke-linejoin="round"/>
      <path d="M8 14 L40 22" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
      <circle cx="21" cy="27" r="3.5" fill="#DC2626"/><circle cx="25" cy="38" r="3.5" fill="#DC2626"/><circle cx="17" cy="40" r="2.6" fill="#16A34A"/>
      <circle cx="44" cy="42" r="15" fill="#fff" stroke="#B91C1C" stroke-width="3.5"/>
      <path d="M44 33 V42 L50 46" stroke="#991B1B" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    thinking: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="27" cy="27" r="16" fill="#E0F2FE" stroke="#0284C7" stroke-width="5"/><path d="M39 39 L54 54" stroke="#0284C7" stroke-width="7" stroke-linecap="round"/><ellipse cx="27" cy="29" rx="5" ry="6.5" fill="#0F172A"/><path d="M22 24 l-4 -3 M32 24 l4 -3 M21 30 h-5 M33 30 h5 M22 35 l-4 3 M32 35 l4 3" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/></svg>`,
    recursion: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="12" fill="#CCFBF1"/><rect x="14" y="14" width="36" height="36" rx="9" fill="#5EEAD4"/><rect x="21" y="21" width="22" height="22" rx="6" fill="#14B8A6"/><rect x="27" y="27" width="10" height="10" rx="3" fill="#0F766E"/></svg>`,
    organizing: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 20 V14 h16 v6" stroke="#475569" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="8" y="20" width="48" height="32" rx="7" fill="#64748B"/><rect x="8" y="30" width="48" height="5" fill="#475569"/><rect x="27" y="27" width="10" height="11" rx="2" fill="#FBBF24"/></svg>`,
    objects: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6 l7.6 15.4 17 2.5 -12.3 12 2.9 17L32 45 16.8 53l2.9-17L7.4 23.9l17-2.5z" fill="none" stroke="#DB2777" stroke-width="4" stroke-linejoin="round"/><path d="M32 18 l4 8 9 1.3 -6.5 6.3 1.5 9L32 38.4 24 42.6l1.5-9L19 27.3l9-1.3z" fill="#F9A8D4"/></svg>`,
    structures: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 14 L16 34 M32 14 L48 34 M16 34 L9 52 M16 34 L23 52 M48 34 L48 52" stroke="#A5B4FC" stroke-width="3.5" stroke-linecap="round"/><circle cx="32" cy="14" r="7" fill="#4F46E5"/><circle cx="16" cy="34" r="6" fill="#6366F1"/><circle cx="48" cy="34" r="6" fill="#6366F1"/><circle cx="9" cy="52" r="5" fill="#818CF8"/><circle cx="23" cy="52" r="5" fill="#818CF8"/><circle cx="48" cy="52" r="5" fill="#818CF8"/></svg>`,
    pro: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="26" width="44" height="30" rx="5" fill="#E11D48"/><rect x="7" y="18" width="50" height="11" rx="4" fill="#FB7185"/><rect x="28" y="18" width="8" height="38" fill="#FDE047"/><path d="M32 18 C24 6 14 12 22 18 M32 18 C40 6 50 12 42 18" stroke="#FDE047" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    data: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 56 H58" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/><rect x="12" y="34" width="9" height="20" rx="3" fill="#86EFAC"/><rect x="25" y="22" width="9" height="32" rx="3" fill="#4ADE80"/><rect x="38" y="28" width="9" height="26" rx="3" fill="#22C55E"/><rect x="51" y="12" width="9" height="42" rx="3" fill="#16A34A"/></svg>`,
  };

  /* ---------- Course art (120×120) ---------- */
  PL.courseArt = {
    python: `<svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="12" y="18" width="96" height="74" rx="14" fill="#fff" stroke="#E3E6EF" stroke-width="2.5"/>
      <rect x="12" y="18" width="96" height="16" rx="14" fill="#F3F4F9"/><rect x="12" y="28" width="96" height="6" fill="#F3F4F9"/>
      <circle cx="23" cy="26" r="3" fill="#FF8A80"/><circle cx="32" cy="26" r="3" fill="#FFD166"/><circle cx="41" cy="26" r="3" fill="#7BD88F"/>
      <rect x="22" y="44" width="18" height="6" rx="3" fill="#D6336C"/><rect x="44" y="44" width="26" height="6" rx="3" fill="#151A2D" opacity=".75"/><rect x="74" y="44" width="12" height="6" rx="3" fill="#1E6FE8"/>
      <rect x="32" y="56" width="22" height="6" rx="3" fill="#0B7A8A"/><rect x="58" y="56" width="30" height="6" rx="3" fill="#E8590C"/>
      <rect x="32" y="68" width="16" height="6" rx="3" fill="#8B3DFF"/><rect x="52" y="68" width="20" height="6" rx="3" fill="#151A2D" opacity=".75"/>
      <rect x="22" y="80" width="40" height="6" rx="3" fill="#151A2D" opacity=".2"/>
      <g transform="translate(78 70)"><circle r="20" fill="#4F46E5"/><path d="M8 -4 A9 9 0 1 0 8.5 4" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M4 -5 L9 -4 L10 -9" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
    computers: `<svg viewBox="0 0 120 120" aria-hidden="true">
      <g stroke="#94A3B8" stroke-width="4" stroke-linecap="round">${[38, 50, 62, 74, 86].map((p) => `<path d="M${p} 14v12M${p} 94v12M14 ${p}h12M94 ${p}h12"/>`).join('')}</g>
      <rect x="26" y="26" width="68" height="68" rx="12" fill="#334155"/><rect x="38" y="38" width="44" height="44" rx="8" fill="#475569"/>
      <text x="60" y="58" text-anchor="middle" font-size="13" font-weight="800" fill="#5EEAD4" font-family="monospace">1011</text>
      <text x="60" y="74" text-anchor="middle" font-size="13" font-weight="800" fill="#F472B6" font-family="monospace">0110</text></svg>`,
    math: `<svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M18 100 H108 M24 106 V16" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M24 92 C46 90 58 30 104 22" stroke="#0EA5E9" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M24 100 L70 56" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/><path d="M70 56 l-11 2 9 8z" fill="#F59E0B"/>
      <circle cx="66" cy="54" r="6" fill="#0EA5E9" stroke="#fff" stroke-width="3"/></svg>`,
    ml: `<svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="10" y="10" width="100" height="100" rx="18" fill="#F0FDF4"/>
      ${[[28, 30], [40, 44], [26, 56], [48, 28], [36, 70], [52, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#16A34A"/>`).join('')}
      ${[[76, 86], [88, 64], [70, 96], [94, 88], [82, 74], [64, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#F59E0B"/>`).join('')}
      <path d="M22 98 L102 26" stroke="#151A2D" stroke-width="3.5" stroke-dasharray="7 6" stroke-linecap="round"/></svg>`,
    nn: `<svg viewBox="0 0 120 120" aria-hidden="true">
      <g stroke="#C4B5FD" stroke-width="2.2">${[30, 60, 90].map((a) => [22, 48, 74, 100].map((b) => `<path d="M22 ${a} L60 ${b}"/>`).join('')).join('')}${[22, 48, 74, 100].map((a) => [44, 76].map((b) => `<path d="M60 ${a} L98 ${b}"/>`).join('')).join('')}</g>
      ${[30, 60, 90].map((y) => `<circle cx="22" cy="${y}" r="9" fill="#8B3DFF"/>`).join('')}
      ${[22, 48, 74, 100].map((y, i) => `<circle cx="60" cy="${y}" r="9" fill="${i % 2 ? '#A78BFA' : '#7C3AED'}"/>`).join('')}
      ${[44, 76].map((y) => `<circle cx="98" cy="${y}" r="9" fill="#DB2777"/>`).join('')}</svg>`,
    genai: `<svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M18 28 a12 12 0 0 1 12 -12 h60 a12 12 0 0 1 12 12 v38 a12 12 0 0 1 -12 12 h-38 l-18 16 v-16 h-4 a12 12 0 0 1 -12 -12z" fill="#EEF2FF" stroke="#6366F1" stroke-width="3"/>
      <rect x="30" y="32" width="20" height="10" rx="4" fill="#6366F1"/><rect x="54" y="32" width="14" height="10" rx="4" fill="#A5B4FC"/><rect x="72" y="32" width="18" height="10" rx="4" fill="#6366F1"/>
      <rect x="30" y="50" width="26" height="10" rx="4" fill="#A5B4FC"/><rect x="60" y="50" width="12" height="10" rx="4" fill="#F472B6" opacity=".9"/>
      <path d="M96 76 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#F59E0B"/></svg>`,
  };

  /* ---------- Helpers to keep the outline compact ---------- */
  const live = (id, file, meta) => Object.assign({ id, file }, meta);
  const soon = (title, tagline) => ({ soon: true, title, tagline });

  PL.courses = [
    {
      id: 'python',
      title: 'Python Programming',
      tagline: 'From your very first line of code to building real programs',
      desc: 'Start from zero. Each lesson is a handful of bite-sized, hands-on steps — you learn by doing, not by reading walls of text.',
      color: '#4F46E5', soft: '#ECEBFF',
      status: 'live',
      chapters: [
        {
          num: 1, title: 'Programs & Values', art: 'programs',
          tagline: 'How computers follow instructions — and the values they work with.',
          lessons: [
            live('programs', '00-programs.js', {
              title: 'What is a program?', tagline: 'A robot chef that follows your recipe exactly',
              topics: ['Instructions', 'Order matters', 'Bugs', 'print()', 'Comments'],
              color: '#0891B2', soft: '#CFFAFE', dark: '#0E7490', minutes: 8, steps: 7,
            }),
            live('variables', '01-variables.js', {
              title: 'Variables', tagline: 'Labelled boxes that remember things for you',
              topics: ['Storing values', '= means "store"', 'Numbers, text & booleans', 'Updating values'],
              color: '#0D9488', soft: '#DDF5F2', dark: '#0A6F67', minutes: 8, steps: 8,
            }),
            live('numbers', '04-numbers.js', {
              title: 'Numbers & math', tagline: 'Share candy, double beans and let Python do the sums',
              topics: ['+ − * /', '// and %', 'Powers **', 'Order of operations', '+= shortcuts'],
              color: '#2563EB', soft: '#DBEAFE', dark: '#1D4ED8', minutes: 10, steps: 7,
            }),
            live('strings', '05-strings.js', {
              title: 'Text (strings)', tagline: 'Make name badges, glue words and fill in blanks',
              topics: ['Quotes', 'Joining with +', 'Repeating with *', 'len()', 'f-strings'],
              color: '#EA580C', soft: '#FFEDD5', dark: '#C2410C', minutes: 9, steps: 7,
            }),
            live('input', '06-input.js', {
              title: 'Input & converting', tagline: 'Ask the user a question — and handle the answer',
              topics: ['input()', 'Always text!', 'int() & float()', 'str()', 'A real program'],
              color: '#16A34A', soft: '#DCFCE7', dark: '#15803D', minutes: 9, steps: 7,
            }),
          ],
        },
        {
          num: 2, title: 'Making Decisions', art: 'conditionals',
          tagline: 'Teach your programs to choose what to do.',
          lessons: [
            live('conditionals', '02-conditionals.js', {
              title: 'If statements', tagline: 'Teach your program to make decisions',
              topics: ['True & False questions', 'if / else', 'elif chains', 'and / or'],
              color: '#DB2777', soft: '#FCE7F3', dark: '#A3175A', minutes: 10, steps: 8,
            }),
            live('logic', '07-logic.js', {
              title: 'Logic: and, or, not', tagline: 'Locks, doors and light switches that think',
              topics: ['and', 'or', 'not', 'Combining conditions', 'Nested ifs'],
              color: '#9333EA', soft: '#F3E8FF', dark: '#7E22CE', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 3, title: 'Repeating Things', art: 'loops',
          tagline: 'Let the computer do the boring repetition for you.',
          lessons: [
            live('loops', '03-loops.js', {
              title: 'For loops', tagline: 'Repeat work without repeating yourself',
              topics: ['Repetition', 'Looping over a list', 'range()', 'Running totals', 'Drawing with loops'],
              color: '#4F46E5', soft: '#ECEBFF', dark: '#3730A3', minutes: 10, steps: 7,
            }),
            live('while', '08-while.js', {
              title: 'While loops', tagline: 'Keep going until something changes',
              topics: ['while', 'Countdowns', 'Stopping conditions', 'Infinite loops', 'Guessing game'],
              color: '#E11D48', soft: '#FFE4E6', dark: '#BE123C', minutes: 10, steps: 7,
            }),
            live('loopctl', '09-loop-control.js', {
              title: 'Break, continue & nested loops', tagline: 'Hunt golden eggs and paint pixel art',
              topics: ['break', 'continue', 'Loops in loops', 'Grids', 'Pixel patterns'],
              color: '#B45309', soft: '#FEF3C7', dark: '#78350F', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 4, title: 'Collections', art: 'lists',
          tagline: 'Keep many values together and work with them all at once.',
          lessons: [
            live('lists', '10-lists.js', {
              title: 'Lists', tagline: 'A freight train: load cars, count from 0, swap cargo',
              topics: ['[ ] lists', 'Indexes from 0', 'Negative indexes', 'append, insert, pop, remove', 'len() & in'],
              color: '#0369A1', soft: '#E0F2FE', dark: '#075985', minutes: 10, steps: 7,
            }),
            live('listwork', '11-list-tools.js', {
              title: 'Working with lists', tagline: 'Slice, sort and sum a music playlist',
              topics: ['Slicing', 'Slice shortcuts', 'sorted() vs .sort()', 'sum, min, max', 'Building new lists'],
              color: '#C026D3', soft: '#FAE8FF', dark: '#A21CAF', minutes: 10, steps: 7,
            }),
            live('strseq', '12-string-seq.js', {
              title: 'Strings as sequences', tagline: 'Decode secret-agent messages with a cipher wheel',
              topics: ['Indexing letters', 'Slicing text', 'Strings can\'t change', 'String methods', 'split & join'],
              color: '#475569', soft: '#E2E8F0', dark: '#334155', minutes: 10, steps: 7,
            }),
            live('tuples', '13-tuples-sets.js', {
              title: 'Tuples & sets', tagline: 'Sealed parcels, treasure maps and Venn diagrams',
              topics: ['Tuples ( )', 'Unpacking & swapping', 'Sets { }', 'No duplicates', '& | -'],
              color: '#6D28D9', soft: '#EDE9FE', dark: '#5B21B6', minutes: 10, steps: 7,
            }),
            live('dicts', '14-dicts.js', {
              title: 'Dictionaries', tagline: 'Lockers you open by name, not by number',
              topics: ['Keys & values', 'Adding & changing', 'KeyError & .get()', 'Looping with .items()', 'Counting'],
              color: '#047857', soft: '#D1FAE5', dark: '#065F46', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 5, title: 'Functions', art: 'functions',
          tagline: 'Build your own reusable commands.',
          lessons: [
            live('functions', '15-functions.js', {
              title: 'Functions', tagline: 'A juice machine: build it once, use it again and again',
              topics: ['def', 'Calling a function', 'Building ≠ running', 'Reusing code', 'Common mistakes'],
              color: '#4D7C0F', soft: '#ECFCCB', dark: '#3F6212', minutes: 10, steps: 7,
            }),
            live('params', '16-params-return.js', {
              title: 'Parameters & return', tagline: 'A pizza shop: fill in the order, get a pizza back',
              topics: ['Parameters & arguments', 'Order & keywords', 'Default values', 'return vs print', 'return exits early'],
              color: '#DC2626', soft: '#FEE2E2', dark: '#B91C1C', minutes: 10, steps: 7,
            }),
            live('scope', '17-scope.js', {
              title: 'Scope', tagline: 'What happens in the kitchen stays in the kitchen',
              topics: ['Local variables', 'Global variables', 'Where Python looks', 'Same name, two notes', 'The global trap'],
              color: '#A16207', soft: '#FEF9C3', dark: '#854D0E', minutes: 10, steps: 7,
            }),
            live('callstack', '18-call-stack.js', {
              title: 'The call stack', tagline: 'A stack of plates: functions calling functions',
              topics: ['Functions calling functions', 'Last on, first off', 'Where was I?', 'RecursionError', 'Reading a traceback'],
              color: '#0E7490', soft: '#CFFAFE', dark: '#155E75', minutes: 10, steps: 7,
            }),
            live('rps', '19-rps-project.js', {
              title: 'Project: Rock, Paper, Scissors', tagline: 'Plan, build and test a real game out of functions',
              topics: ['Breaking a problem down', 'random.choice', 'Checking input', 'Testing a function', 'The game loop'],
              color: '#BE185D', soft: '#FCE7F3', dark: '#9D174D', minutes: 12, steps: 7,
            }),
          ],
        },
        {
          num: 6, title: 'Thinking Like a Programmer', art: 'thinking',
          tagline: 'Debug with confidence and discover your first algorithms.',
          lessons: [
            live('errors', '20-errors.js', {
              title: 'Reading errors', tagline: 'Error messages are a detective\'s clues',
              topics: ['Where, what kind, details', 'The usual suspects', 'The real culprit is earlier', 'Silent bugs & print()', 'Python stops at the first error'],
              color: '#4338CA', soft: '#E0E7FF', dark: '#3730A3', minutes: 10, steps: 7,
            }),
            live('tryexcept', '21-try-except.js', {
              title: 'try / except', tagline: 'A safety net under the trapeze',
              topics: ['try and except', 'The rest of try is skipped', 'Catching the right error', 'Asking until it works', 'else and finally'],
              color: '#C2410C', soft: '#FFEDD5', dark: '#9A3412', minutes: 10, steps: 7,
            }),
            live('search', '22-searching.js', {
              title: 'Searching', tagline: 'A library shelf and the phone book trick',
              topics: ['Linear search', 'Binary search', 'Halving is powerful', 'It must be sorted', 'Counting checks'],
              color: '#0F766E', soft: '#CCFBF1', dark: '#115E59', minutes: 10, steps: 7,
            }),
            live('sorting', '23-sorting.js', {
              title: 'Sorting', tagline: 'Line everyone up for the class photo',
              topics: ['Swapping neighbours', 'Bubble sort', 'Selection sort', 'sorted() with key & reverse', 'Capitals come first'],
              color: '#86198F', soft: '#FAE8FF', dark: '#701A75', minutes: 10, steps: 7,
            }),
            live('bigo', '24-big-o.js', {
              title: 'How fast is it?', tagline: 'A party that grows: who still finishes on time?',
              topics: ['Counting steps', 'Constant, linear, quadratic', 'Doubling the input', 'Logarithmic: halving', 'Making it faster'],
              color: '#15803D', soft: '#DCFCE7', dark: '#166534', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 7, title: 'Recursion', art: 'recursion',
          tagline: 'Functions that call themselves.',
          lessons: [
            live('recur', '25-recursion.js', {
              title: 'Recursion', tagline: 'Russian dolls all the way down',
              topics: ['A function that calls itself', 'The base case', 'Down and back up', 'Each call has its own variables', 'Two ways to break it', 'Before or after the call'],
              color: '#BE123C', soft: '#FFE4E6', dark: '#9F1239', minutes: 11, steps: 8,
            }),
            live('fractals', '26-recursive-art.js', {
              title: 'Recursive art', tagline: 'Grow fractal trees and snowflakes',
              topics: ['Fractals', 'Two calls make branches', 'Depth-first drawing', 'Doubling branches', 'The Koch snowflake'],
              color: '#1D4ED8', soft: '#DBEAFE', dark: '#1E40AF', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 8, title: 'Organising Code', art: 'organizing',
          tagline: 'Toolboxes, files and elegant one-liners.',
          lessons: [
            live('modules', '27-modules.js', {
              title: 'Modules & imports', tagline: 'Borrow tools from Python\'s toolbox',
              topics: ['import and the dot', 'NameError when you forget', 'from … import', 'Nicknames with as', 'Your own module'],
              color: '#9A3412', soft: '#FFEDD5', dark: '#7C2D12', minutes: 10, steps: 7,
            }),
            live('files', '28-files.js', {
              title: 'Files', tagline: 'A notebook your program can read and write',
              topics: ['Why files?', 'open, write, close', '"w" wipes, "a" adds', 'Reading lines', 'with and FileNotFoundError'],
              color: '#7E22CE', soft: '#F3E8FF', dark: '#6B21A8', minutes: 10, steps: 7,
            }),
            live('comps', '29-comprehensions.js', {
              title: 'List comprehensions', tagline: 'A factory line that filters and builds',
              topics: ['Loop vs one-liner', 'The machine: an expression', 'The gate: if', 'Getting the order right', 'Cleaning real data'],
              color: '#155E75', soft: '#CFFAFE', dark: '#164E63', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 9, title: 'Objects', art: 'objects',
          tagline: 'Design your own types of things.',
          lessons: [
            live('classes', '30-classes.js', {
              title: 'Classes & objects', tagline: 'One cookie cutter, many cookies',
              topics: ['Class vs object', '__init__ and self', 'Attributes', 'Each object is its own', 'AttributeError & TypeError'],
              color: '#92400E', soft: '#FEF3C7', dark: '#78350F', minutes: 10, steps: 7,
            }),
            live('methods', '31-methods.js', {
              title: 'Methods & self', tagline: 'A virtual pet you can feed and play with',
              topics: ['Methods are object actions', 'rex.feed() is Pet.feed(rex)', 'self on many objects', 'Parameters & return', 'Forgetting self'],
              color: '#047857', soft: '#D1FAE5', dark: '#065F46', minutes: 10, steps: 7,
            }),
            live('inherit', '32-inheritance.js', {
              title: 'Inheritance', tagline: 'An animal family tree',
              topics: ['Parent and child classes', 'Looking up the tree', 'Overriding', 'super()', 'isinstance & one loop for all'],
              color: '#6D28D9', soft: '#EDE9FE', dark: '#5B21B6', minutes: 10, steps: 7,
            }),
            live('dunder', '33-special-methods.js', {
              title: 'Special methods', tagline: 'Vectors you can add and print',
              topics: ['__str__ for printing', '__add__ for +', 'Python calls them for you', '__eq__ for ==', '__mul__ for *'],
              color: '#0369A1', soft: '#E0F2FE', dark: '#075985', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 10, title: 'Data Structures', art: 'structures',
          tagline: 'Clever ways to organise data for speed.',
          lessons: [
            live('stacks', '34-stacks-queues.js', {
              title: 'Stacks & queues', tagline: 'The undo button and the ice-cream line',
              topics: ['Last in, first out', 'append and pop', 'First in, first out', 'deque and popleft', 'Checking brackets'],
              color: '#BE185D', soft: '#FCE7F3', dark: '#9D174D', minutes: 10, steps: 7,
            }),
            live('refs', '35-references.js', {
              title: 'References & mutability', tagline: 'Two names for one balloon',
              topics: ['Names point at objects', 'Two names, one list', 'Making a real copy', "Numbers can't change", 'Functions share the list'],
              color: '#4338CA', soft: '#E0E7FF', dark: '#3730A3', minutes: 10, steps: 7,
            }),
            live('trees', '36-trees.js', {
              title: 'Trees', tagline: 'Folders inside folders',
              topics: ['Root, children and leaves', 'A Node class', 'Visiting every node', 'Adding up a tree', 'Binary search trees'],
              color: '#4D7C0F', soft: '#ECFCCB', dark: '#3F6212', minutes: 10, steps: 7,
            }),
            live('graphs', '37-graphs.js', {
              title: 'Graphs', tagline: 'Maps, friends and solving a maze',
              topics: ['Nodes and edges', 'A dict of neighbours', 'Breadth-first search', 'Remembering visited', 'Shortest paths & mazes'],
              color: '#A16207', soft: '#FEF9C3', dark: '#854D0E', minutes: 10, steps: 7,
            }),
            live('hashing', '38-hash-tables.js', {
              title: 'Hash tables', tagline: 'How a dictionary finds things instantly',
              topics: ['Searching a pile', 'A hash function', 'One check to find', 'Collisions', "Why keys can't change"],
              color: '#0E7490', soft: '#CFFAFE', dark: '#155E75', minutes: 10, steps: 7,
            }),
            live('memo', '39-memoization.js', {
              title: 'Memoization', tagline: 'Counting the ways to climb stairs',
              topics: ['Counting paths', 'Breaking it into smaller stairs', 'The same work again and again', 'A memo notebook', '@cache'],
              color: '#C2410C', soft: '#FFEDD5', dark: '#9A3412', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 11, title: 'Pro Python', art: 'pro',
          tagline: 'The tools experienced Python programmers reach for.',
          lessons: [
            live('lambdas', '40-lambda-map-filter.js', {
              title: 'Lambda, map & filter', tagline: 'Sticky-note rules for a robot helper',
              topics: ['Tiny functions with lambda', 'map: do it to every item', 'filter: keep what passes', 'sorted with key=', 'Building a pipeline'],
              color: '#C026D3', soft: '#FAE8FF', dark: '#A21CAF', minutes: 10, steps: 7,
            }),
            live('generators', '41-generators.js', {
              title: 'Iterators & generators', tagline: 'A gumball machine that makes one at a time',
              topics: ['Lazy vs all at once', 'iter, next and StopIteration', 'yield pauses a function', 'Endless generators', 'Saving memory'],
              color: '#DC2626', soft: '#FEE2E2', dark: '#B91C1C', minutes: 10, steps: 7,
            }),
            live('decorators', '42-decorators.js', {
              title: 'Decorators', tagline: 'Gift-wrapping a function',
              topics: ['Functions are values', 'A function that wraps a function', 'The @ shortcut', 'Passing arguments through', 'Stacking decorators'],
              color: '#7C3AED', soft: '#EDE9FE', dark: '#6D28D9', minutes: 10, steps: 7,
            }),
            live('dataformats', '43-json-csv.js', {
              title: 'JSON & CSV', tagline: 'Reading real-world data files',
              topics: ['CSV is text with commas', 'csv.DictReader', 'Everything is a string', 'JSON looks like Python', 'Saving and loading'],
              color: '#15803D', soft: '#DCFCE7', dark: '#166534', minutes: 10, steps: 7,
            }),
          ],
        },
        {
          num: 12, title: 'Python for Data', art: 'data',
          tagline: 'Your bridge into machine learning and AI.',
          lessons: [
            live('numpy', '44-numpy.js', {
              title: 'NumPy arrays', tagline: 'A photo is just a grid of numbers',
              topics: ['Pixels are numbers', 'Maths on every item at once', 'Rows and columns', 'Cropping with slices', 'True/False masks'],
              color: '#2563EB', soft: '#DBEAFE', dark: '#1D4ED8', minutes: 10, steps: 7,
            }),
            live('pandas', '45-pandas.js', {
              title: 'Tables of data', tagline: 'The bake sale: filter, sort and group',
              topics: ['DataFrames', 'New columns', 'Filtering with True/False', 'Sorting', 'groupby', '& and |'],
              color: '#B45309', soft: '#FEF3C7', dark: '#92400E', minutes: 10, steps: 7,
            }),
            live('charts', '46-charts.js', {
              title: 'Charts', tagline: 'A sunflower diary in pictures',
              topics: ['plt.plot and plt.show', 'Titles and labels', 'x and y pairs', 'Line, bar or scatter?', 'Honest axes', 'Legends'],
              color: '#0F766E', soft: '#CCFBF1', dark: '#115E59', minutes: 10, steps: 7,
            }),
            live('random', '47-random.js', {
              title: 'Randomness & simulation', tagline: 'Dice, cards and darts that find π',
              topics: ['random.randint', 'randint vs randrange', 'Seeds', 'Simulating two dice', 'Estimating π', 'shuffle and choice'],
              color: '#E11D48', soft: '#FFE4E6', dark: '#BE123C', minutes: 10, steps: 7,
            }),
            live('learner', '48-first-learner.js', {
              title: 'Your first learning program', tagline: 'A fruit sorter that learns from examples',
              topics: ['Examples instead of rules', 'Measuring distance', 'Nearest neighbour', 'Testing and accuracy', 'k neighbours vote', 'Remembering isn\'t learning'],
              color: '#047857', soft: '#D1FAE5', dark: '#065F46', minutes: 12, steps: 7,
            }),
            live('capstone', '49-capstone.js', {
              title: 'Capstone project', tagline: 'Plan the ice-cream van with data',
              topics: ['Planning a data project', 'Loading and cleaning', 'Exploring with pandas', 'Finding a pattern', 'Predicting tomorrow', 'The whole program'],
              color: '#0369A1', soft: '#E0F2FE', dark: '#075985', minutes: 12, steps: 7,
            }),
          ],
        },
      ],
    },
    {
      id: 'math',
      title: 'Math for AI',
      tagline: 'The friendly maths behind smart machines',
      desc: 'Arrows, graphs, slopes and chance: the ideas machine learning is built on, starting from zero. Steer spaceships, ride dragons and battle monsters while the maths quietly clicks into place.',
      topics: ['Vectors', 'Graphs of functions', 'Slopes', 'Probability'],
      color: '#0EA5E9', soft: '#E0F2FE',
      status: 'live',
      chapters: [
        {
          num: 1, title: 'Vectors', art: 'vectors',
          tagline: 'Arrows made of numbers: the way AI stores everything it knows.',
          lessons: [
            live('vectors', 'm01-vectors.js', {
              title: 'What is a vector?', tagline: 'Steer a rescue ship with just two numbers',
              topics: ['Across and up', 'Minus means back', 'Order matters', 'Same arrow, any start'],
              color: '#4338CA', soft: '#E0E7FF', dark: '#3730A3', minutes: 9, steps: 7,
            }),
            live('vecadd', 'm02-vector-add.js', {
              title: 'Adding & scaling', tagline: 'A dragon courier fighting the wind',
              topics: ['Tip to tail', 'Add matching numbers', 'Stretch and flip', 'Target minus start'],
              color: '#C2410C', soft: '#FFEDD5', dark: '#9A3412', minutes: 9, steps: 7,
            }),
            live('distance', 'm03-distance.js', {
              title: 'Length & distance', tagline: 'A submarine\'s sonar measures the deep',
              topics: ['Which is closer?', 'Squares on a staircase', 'Distance between two points', 'Circles of equal distance'],
              color: '#0F766E', soft: '#CCFBF1', dark: '#115E59', minutes: 10, steps: 7,
            }),
            live('bigvectors', 'm04-many-numbers.js', {
              title: 'Vectors with many numbers', tagline: 'Monster cards with a stat for everything',
              topics: ['3 numbers = a room', 'Add and scale any size', 'Most alike', 'Pictures as vectors'],
              color: '#9333EA', soft: '#F3E8FF', dark: '#7E22CE', minutes: 9, steps: 6,
            }),
          ],
        },
        {
          num: 2, title: 'Similarity', art: 'similarity',
          tagline: 'How a computer tells that two things point the same way.',
          lessons: [
            live('dotproduct', 'm05-dot-product.js', {
              title: 'The dot product', tagline: 'A pirate ship and a magic wind',
              topics: ['Push along the course', 'The wind\'s shadow', 'Multiply and add', 'Scoring islands'],
              color: '#B91C1C', soft: '#FEE2E2', dark: '#991B1B', minutes: 10, steps: 7,
            }),
            live('cosine', 'm06-similarity.js', {
              title: 'Angles & similarity', tagline: 'An alien café that finds music twins',
              topics: ['Direction, not strength', 'Cosine similarity', 'Long taste vectors', 'Word arrows'],
              color: '#C026D3', soft: '#FAE8FF', dark: '#A21CAF', minutes: 9, steps: 6,
            }),
          ],
        },
        {
          num: 3, title: 'Functions & Graphs', art: 'functions-graphs',
          tagline: 'Machines that turn one number into another, and the pictures they draw.',
          lessons: [
            live('potions', 'm07-functions.js', {
              title: 'Function machines', tagline: 'A wizard\'s potion machines',
              topics: ['One input, one output', 'f(x) notation', 'Chaining machines', 'Cracking a secret rule'],
              color: '#047857', soft: '#D1FAE5', dark: '#065F46', minutes: 10, steps: 7,
            }),
            live('plotting', 'm08-graphs.js', {
              title: 'Graphs', tagline: 'A rocket\'s flight log in dots',
              topics: ['Input across, output up', 'Join the dots', 'Shapes tell stories', 'Between the dots'],
              color: '#2563EB', soft: '#DBEAFE', dark: '#1D4ED8', minutes: 10, steps: 7,
            }),
            live('lines', 'm09-lines.js', {
              title: 'Straight lines', tagline: 'Build the perfect skate ramp',
              topics: ['y = m × x + b', 'Start height b', 'Steepness m', 'Line of best fit'],
              color: '#B45309', soft: '#FEF3C7', dark: '#92400E', minutes: 9, steps: 6,
            }),
            live('curves', 'm10-curves.js', {
              title: 'Curves that grow and squash', tagline: 'A doubling slime and a squeeze tube',
              topics: ['Doubling vs adding', 'The bowl y = x × x', 'The squeeze tube (sigmoid)', 'The one-way valve (ReLU)'],
              color: '#4D7C0F', soft: '#ECFCCB', dark: '#3F6212', minutes: 9, steps: 6,
            }),
          ],
        },
        {
          num: 4, title: 'Slopes & Change', art: 'slopes',
          tagline: 'How steep, how fast, and which way is down: the heart of learning.',
          lessons: [
            live('slope', 'm11-slope.js', {
              title: 'Slope', tagline: 'Billy the goat compares mountain trails',
              topics: ['Rise over run', 'Uphill +, flat 0, downhill −', 'From flat to cliff', 'A mountain of many slopes'],
              color: '#0369A1', soft: '#E0F2FE', dark: '#075985', minutes: 9, steps: 6,
            }),
            live('rate', 'm12-rate.js', {
              title: 'Rate of change', tagline: 'Zip the race car\'s speed hides in a graph',
              topics: ['Distance–time graphs', 'Slope = speed', 'Not a picture of the road', 'Average speed'],
              color: '#BE123C', soft: '#FFE4E6', dark: '#9F1239', minutes: 9, steps: 6,
            }),
            live('zoom', 'm13-zoom.js', {
              title: 'Zoom into a curve', tagline: 'A roller coaster up close',
              topics: ['A slope at every point', 'Zoom until it\'s straight', 'The touching line', 'Flat tops and bottoms'],
              color: '#6D28D9', soft: '#EDE9FE', dark: '#5B21B6', minutes: 9, steps: 6,
            }),
            live('descent', 'm14-descent.js', {
              title: 'Finding the lowest point', tagline: 'Inky the octopus hunts for a lost pearl',
              topics: ['Step against the slope', 'Gradient descent', 'The learning rate', 'How AI learns'],
              color: '#0E7490', soft: '#CFFAFE', dark: '#155E75', minutes: 11, steps: 7,
            }),
          ],
        },
        {
          num: 5, title: 'Weighted Sums & Matrices', art: 'matrices',
          tagline: 'Many numbers mixed at once: what every layer of a neural network does.',
          lessons: [
            live('weighted', 'm15-weighted.js', {
              title: 'Weighted sums', tagline: 'Judge Hoot the owl scores a forest talent show',
              topics: ['Rating × weight', 'Weights pick the winner', 'Bias: a thumb on the scale', 'A neuron'],
              color: '#15803D', soft: '#DCFCE7', dark: '#166534', minutes: 9, steps: 6,
            }),
            live('matrix', 'm16-matrix.js', {
              title: 'Matrices: many sums at once', tagline: 'Professor Cog\'s robot factory',
              topics: ['Rows of weights', 'Matrix × vector', 'Shapes must match', 'A layer of neurons'],
              color: '#A16207', soft: '#FEF9C3', dark: '#854D0E', minutes: 10, steps: 6,
            }),
            live('transform', 'm17-transform.js', {
              title: 'Matrices move space', tagline: 'Whiskers the cat in the funhouse mirrors',
              topics: ['Stretch and flip', 'Columns = where arrows land', 'Spins and leans', 'Squashed flat'],
              color: '#BE185D', soft: '#FCE7F3', dark: '#9D174D', minutes: 10, steps: 6,
            }),
          ],
        },
        {
          num: 6, title: 'Chance & Data', art: 'chance',
          tagline: 'Measuring how sure we are: the language AI uses to make guesses.',
          lessons: [
            live('chance', 'm18-chance.js', {
              title: 'What is chance?', tagline: 'Goblin Gus\'s treasure chests',
              topics: ['Chance from 0 to 1', 'Counting outcomes', 'No memory', 'Many tries'],
              color: '#B45309', soft: '#FEF3C7', dark: '#92400E', minutes: 9, steps: 6,
            }),
            live('combine', 'm19-combine.js', {
              title: 'Combining chances', tagline: 'Sir Squeak braves a dungeon with two traps',
              topics: ['AND multiplies', 'OR: don\'t count twice', '1 − chance', 'Small risks pile up'],
              color: '#4338CA', soft: '#E0E7FF', dark: '#3730A3', minutes: 9, steps: 6,
            }),
            live('spread', 'm20-spread.js', {
              title: 'Average & spread', tagline: 'Fox and Bear at the archery tournament',
              topics: ['The balance point', 'Spread', 'The bell curve', 'Two numbers for a bell'],
              color: '#047857', soft: '#D1FAE5', dark: '#065F46', minutes: 10, steps: 6,
            }),
            live('bayes', 'm21-bayes.js', {
              title: 'Updating beliefs', tagline: 'Ghost or wind in the haunted castle?',
              topics: ['Count the clue', 'Stacking clues', 'Base rates', 'A spam filter'],
              color: '#6D28D9', soft: '#EDE9FE', dark: '#5B21B6', minutes: 10, steps: 6,
            }),
            live('nextword', 'm22-nextword.js', {
              title: 'Next-word dice', tagline: 'Tale-o-Tron, the story machine',
              topics: ['Weighted wheels', 'Counting text', 'Temperature', 'Scores into chances'],
              color: '#BE123C', soft: '#FFE4E6', dark: '#9F1239', minutes: 10, steps: 6,
            }),
          ],
        },
      ],
    },
    {
      id: 'ml',
      title: 'Machine Learning',
      tagline: 'Teach computers to learn from examples',
      desc: 'How apps learn to filter spam, price things, predict delivery times and recommend videos. Real situations, real-looking data, and every idea built step by step from zero, no maths beyond a straight line.',
      topics: ['What is learning?', 'Line of best fit', 'Gradient descent', 'Classification', 'Overfitting'],
      color: '#16A34A', soft: '#DCFCE7',
      status: 'live',
      chapters: [
        {
          num: 1, title: 'What is Machine Learning?', art: 'mlrules',
          tagline: 'Learning from examples instead of writing rules, and the data it learns from.',
          lessons: [
            live('mlrules', 'ml01-rules.js', {
              title: 'Rules vs examples', tagline: 'Riya\'s inbox learns to spot spam',
              topics: ['Spam or not?', 'Writing rules by hand', 'Learning from examples', 'More data, better guesses', 'Where ML is used'],
              color: '#1D4ED8', soft: '#DBEAFE', dark: '#1E40AF', minutes: 10, steps: 6,
            }),
            live('mldata', 'ml02-data.js', {
              title: 'Data: features and labels', tagline: 'Pricing second-hand phones at Arjun\'s shop',
              topics: ['Rows and columns', 'Features and the label', 'Turning words into numbers', 'Useful vs useless features', 'Cleaning messy data'],
              color: '#0F766E', soft: '#CCFBF1', dark: '#115E59', minutes: 10, steps: 6,
            }),
            live('mlloop', 'ml03-learning.js', {
              title: 'How a machine learns', tagline: 'A pizza app learns to predict delivery time',
              topics: ['A model is a recipe with dials', 'Measuring the error', 'Guess, check, adjust', 'Testing on new orders'],
              color: '#B91C1C', soft: '#FEE2E2', dark: '#991B1B', minutes: 11, steps: 6,
            }),
          ],
        },
        {
          num: 2, title: 'Predicting Numbers', art: 'mlrules',
          tagline: 'Draw the best line through real data, then let the computer find it.',
          lessons: [
            soon('Study hours and exam marks', 'Predict a score from one clue'),
            soon('How wrong is the line?', 'Errors, squared errors and the average miss'),
            soon('The line fits itself', 'Gradient descent trains a real model'),
            soon('Many clues at once', 'House rent from size, rooms and distance'),
          ],
        },
        {
          num: 3, title: 'Sorting into Groups', art: 'mlrules',
          tagline: 'Yes or no, cat or dog: models that pick a category.',
          lessons: [
            soon('Yes or no?', 'Pass or fail from hours studied'),
            soon('How sure is the model?', 'Chances between 0 and 1'),
            soon('Drawing the boundary', 'Two clues and a dividing line'),
            soon('Decision trees', 'Twenty questions that decide'),
          ],
        },
        {
          num: 4, title: 'Is the Model Any Good?', art: 'mlrules',
          tagline: 'Testing fairly, and the trap of memorising.',
          lessons: [
            soon('Practice paper vs real exam', 'Training data and test data'),
            soon('Memorising vs understanding', 'Overfitting and underfitting'),
            soon('When accuracy lies', 'A rare-disease test and false alarms'),
          ],
        },
        {
          num: 5, title: 'Patterns Without Answers', art: 'mlrules',
          tagline: 'Finding groups and similarities when nobody gives the labels.',
          lessons: [
            soon('Grouping customers', 'T-shirt sizes from height and weight'),
            soon('People who liked this…', 'How recommendations work'),
            soon('Spotting the odd one out', 'Catching card fraud'),
          ],
        },
        {
          num: 6, title: 'Project & Responsibility', art: 'mlrules',
          tagline: 'Build a model from start to finish, and use it fairly.',
          lessons: [
            soon('Build a model end to end', 'From raw data to predictions'),
            soon('Fair and responsible AI', 'When data carries old mistakes'),
          ],
        },
      ],
    },
    {
      id: 'computers', status: 'soon', title: 'How Computers Work',
      tagline: 'From light switches to the internet',
      topics: ['Binary', 'Logic gates', 'Memory', 'The CPU', 'The internet'],
      color: '#475569', soft: '#F1F5F9',
    },
    {
      id: 'nn', status: 'soon', title: 'Neural Networks',
      tagline: 'Build a brain out of tiny number-crunchers',
      topics: ['A single neuron', 'Weights & bias', 'Layers', 'Backpropagation', 'Seeing images'],
      color: '#8B3DFF', soft: '#F1E8FF',
    },
    {
      id: 'genai', status: 'soon', title: 'Generative AI & LLMs',
      tagline: 'How chatbots read, think and write',
      topics: ['Tokens', 'Embeddings', 'Attention', 'Transformers', 'Generating text'],
      color: '#6366F1', soft: '#EEF2FF',
    },
  ];
})();
