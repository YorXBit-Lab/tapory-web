import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional absolute-positioned background layer — replaces the default grey stage */
  backdrop?: ReactNode;
}

export function PhoneShell({ children, backdrop }: Props) {
  const shadow = [
    '0 0 0 0.5px rgba(255,255,255,0.10)',
    'inset 0 1.5px 0 rgba(255,255,255,0.14)',
    'inset 0 -1px 0 rgba(0,0,0,0.4)',
    '0 2px 6px rgba(0,0,0,0.38)',
    '0 14px 32px rgba(0,0,0,0.22)',
    '0 36px 60px rgba(0,0,0,0.13)',
  ].join(', ');

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl px-4 py-6 lg:py-10"
      style={backdrop ? undefined : { background: 'linear-gradient(160deg, #f4f4f6 0%, #eaeaec 100%)' }}
    >
      {/* Cinematic backdrop — fills stage behind the phone */}
      {backdrop && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {backdrop}
        </div>
      )}

      {/* Spotlight — reduced opacity when backdrop is active */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-[52%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.88) 0%, transparent 68%)',
          opacity: backdrop ? 0.22 : 1,
        }}
      />

      <div className="group relative cursor-default select-none">
        {/* Volume buttons */}
        <div className="absolute -left-[3px] top-[100px] z-20 flex flex-col gap-3">
          {[0, 1].map(i => (
            <div key={i} className="h-7 w-[3px] rounded-l-full"
              style={{ background: 'linear-gradient(to bottom, #424244, #2c2c2e)', boxShadow: '-1px 0 3px rgba(0,0,0,0.55)' }} />
          ))}
        </div>

        {/* Power button */}
        <div className="absolute -right-[3px] top-[124px] z-20">
          <div className="h-11 w-[3px] rounded-r-full"
            style={{ background: 'linear-gradient(to bottom, #424244, #2c2c2e)', boxShadow: '1px 0 3px rgba(0,0,0,0.55)' }} />
        </div>

        {/* Phone body */}
        <div
          className="relative overflow-hidden transition-all duration-300 ease-out group-hover:scale-[1.014] group-hover:-translate-y-0.5"
          style={{
            width: 248,
            height: 516,
            borderRadius: '46px',
            background: 'linear-gradient(145deg, #3e3e40 0%, #1c1c1e 48%, #2d2d2f 100%)',
            boxShadow: shadow,
          }}
        >
          {/* Screen glass */}
          <div
            className="absolute overflow-hidden"
            style={{
              inset: '8px',
              borderRadius: '38px',
              backgroundColor: '#000',
              boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)',
            }}
          >
            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 z-30 flex -translate-x-1/2 items-center justify-center"
              style={{
                top: 10,
                width: 108,
                height: 30,
                borderRadius: '20px',
                backgroundColor: '#000',
                boxShadow: '0 0 0 1.5px rgba(255,255,255,0.05)',
              }}
            >
              <div
                className="ml-1 h-[9px] w-[9px] rounded-full"
                style={{
                  background: 'radial-gradient(circle at 38% 38%, #242424, #080808)',
                  boxShadow: 'inset 0 0 6px rgba(80,200,255,0.18)',
                }}
              />
            </div>

            {/* Screen area */}
            {children}
          </div>

          {/* Home indicator */}
          <div
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 96, height: 4, backgroundColor: 'rgba(255,255,255,0.22)' }}
          />
        </div>
      </div>
    </div>
  );
}
