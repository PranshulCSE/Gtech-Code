import { useState } from 'react';

/**
 * App-wide logo.
 *
 * HOW TO ADD YOUR OWN LOGO:
 *   1. Drop your university/GTech logo file into `Frontend/public/`
 *      (svg, png, or jpg all work) and name it `logo.svg` (or update
 *      the `src` below to match your filename, e.g. "/logo.png").
 *   2. That's it — every place <Logo /> is used (sidebar, login,
 *      signup, navbar) will pick it up automatically.
 *
 * Until you add a real file, this shows a clean "G" letter-badge
 * fallback so the UI never looks broken.
 */
const Logo = ({ size = 44, showWordmark = true, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imgFailed ? (
        <img
          src="/logo.svg"
          alt="GTech-Code logo"
          style={{ width: size, height: size }}
          className="rounded-2xl object-cover shadow-lg shadow-slate-950/15"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950 shadow-lg shadow-slate-950/15"
        >
          G
        </div>
      )}

      {showWordmark ? (
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/65">GTech-Code</p>
          <p className="text-sm font-bold">Student Portal</p>
        </div>
      ) : null}
    </div>
  );
};

export default Logo;
