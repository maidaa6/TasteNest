// Line icons on a 24×24 grid, drawn with the current text colour.
const PATHS = {
  // Three eggs resting in a woven nest
  nest: (
    <>
      <path d="M7.4 12.2c-.9-.6-1.4-1.6-1.4-2.8C6 7.4 7.1 5.5 8.4 5.5s2.4 1.9 2.4 3.9" />
      <path d="M13.2 9.4c0-2 1.1-3.9 2.4-3.9s2.4 1.9 2.4 3.9c0 1.2-.5 2.2-1.4 2.8" />
      <path d="M9.6 12.2c-.6-.6-1-1.5-1-2.6 0-2.2 1.5-4.6 3.4-4.6s3.4 2.4 3.4 4.6c0 1.1-.4 2-1 2.6" />
      <path d="M2.5 12h19c-.4 4.6-4.4 8-9.5 8s-9.1-3.4-9.5-8Z" />
      <path d="M4.5 15.2c2.5.9 5 1.3 7.5 1.3s5-.4 7.5-1.3M7 12l2.5 7.4M12 12v8M17 12l-2.5 7.4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.6c1.5.7 2.6 2.2 3 4.4" />
    </>
  ),
  chef: (
    <>
      <path d="M7 13.5V19h10v-5.5" />
      <path d="M7 13.5a4 4 0 0 1-.6-7.9 5 5 0 0 1 11.2 0 4 4 0 0 1-.6 7.9" />
      <path d="M7 16h10" />
    </>
  ),
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  logout: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16l-4-4 4-4M6 12h10" />
    </>
  ),
  // Category illustrations
  bowl: (
    <>
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M8 7.5c0-1.2 1-1.3 1-2.5M12 7.5c0-1.2 1-1.3 1-2.5M16 7.5c0-1.2 1-1.3 1-2.5" />
    </>
  ),
  pot: (
    <>
      <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6Z" />
      <path d="M2 10h20M10 6.5h4M12 6.5V10" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15" />
      <path d="M5 19c3-5 6-8 10-10" />
    </>
  ),
  cake: (
    <>
      <path d="M4 20h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7Z" />
      <path d="M4 15.5c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M12 11V7.5" />
      <path d="M12 4.5c.8.8.8 1.8 0 3-.8-1.2-.8-2.2 0-3Z" />
    </>
  ),
  sun: (
    <>
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M2.5 20h19M12 4v3M4.6 9.6l2 2M19.4 9.6l-2 2" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9h.01M14.5 8.5h.01M15.5 14h.01M9.5 15h.01M12 12h.01" strokeWidth="2.6" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <circle cx="12" cy="13" r="4" />
      <path d="M12 2.5v2" />
    </>
  ),
};

export default function Icon({ name, size = 20, className, strokeWidth = 1.7 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
