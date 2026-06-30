export function TablePreview() {
  return (
    <div className="w-full h-full flex bg-background select-none">
      {Array.from({ length: 5 }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="w-5 flex flex-col border-r border-border last:border-r-0"
        >
          <div className="h-3.5 bg-secondary border-b border-border flex items-center justify-center shrink-0">
            <span className="text-[5px] font-medium text-foreground/75 leading-none">--</span>
          </div>
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="h-[8.6px] border-b border-border last:border-b-0 flex items-center justify-center shrink-0"
            >
              {colIndex === 1 ? (
                <div className="w-4 h-[5px] bg-background border-[0.5px] border-border rounded-[5px] flex items-center justify-center">
                  <span className="text-[4px] font-medium text-foreground/50 leading-none scale-[0.8] origin-center">--</span>
                </div>
              ) : (
                <span className="text-[5px] font-medium text-foreground/50 leading-none">--</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PieChartPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background select-none">
      <svg width="84" height="84" viewBox="0 0 100 100" className="transform -rotate-90">
        <path d="M 50 50 L 100 50 A 50 50 0 0 1 67.1 97 Z" fill="#EA580C" />
        <path d="M 50 50 L 67.1 97 A 50 50 0 0 1 41.3 99.2 Z" fill="#F59E0B" />
        <path d="M 50 50 L 41.3 99.2 A 50 50 0 0 1 3 67.1 Z" fill="#FBBF24" />
        <path d="M 50 50 L 3 67.1 A 50 50 0 0 1 11.7 17.9 Z" fill="#164E63" />
        <path d="M 50 50 L 11.7 17.9 A 50 50 0 0 1 100 50 Z" fill="#0D9488" />
      </svg>
    </div>
  );
}

export function LineChartPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background overflow-hidden select-none">
      <svg width="88" height="88" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lcTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lcOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="90" x2="100" y2="90" stroke="var(--border)" strokeWidth="1.5" />
        
        <path
          d="M 0 88 C 15 88, 20 60, 30 60 C 40 60, 45 75, 55 75 C 65 75, 70 65, 80 65 C 90 65, 95 70, 100 70 L 100 90 L 0 90 Z"
          fill="url(#lcTeal)"
        />
        <path
          d="M 0 88 C 15 88, 20 60, 30 60 C 40 60, 45 75, 55 75 C 65 75, 70 65, 80 65 C 90 65, 95 70, 100 70"
          fill="none"
          stroke="#0D9488"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 0 76 C 15 76, 20 20, 30 20 C 40 20, 45 60, 55 60 C 65 60, 70 40, 80 40 C 90 40, 95 42, 100 42 L 100 90 L 0 90 Z"
          fill="url(#lcOrange)"
        />
        <path
          d="M 0 76 C 15 76, 20 20, 30 20 C 40 20, 45 60, 55 60 C 65 60, 70 40, 80 40 C 90 40, 95 42, 100 42"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function BarChartPreview() {
  const bars = [
    { x: 4, h: 25 },
    { x: 20, h: 75 },
    { x: 36, h: 35 },
    { x: 52, h: 60 },
    { x: 68, h: 20 },
    { x: 84, h: 50 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-background select-none">
      <svg width="88" height="88" viewBox="0 0 100 100">
        <line x1="0" y1="90" x2="100" y2="90" stroke="var(--border)" strokeWidth="1.5" />
        {bars.map(({ x, h }, index) => (
          <rect
            key={index}
            x={x}
            y={90 - h}
            width="12"
            height={h + 10}
            rx="3.5"
            fill="#EA580C"
          />
        ))}
      </svg>
    </div>
  );
}

export function AreaChartPreview() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background overflow-hidden select-none">
      <svg width="88" height="88" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="acBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2865E3" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2865E3" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1="0" y1="90" x2="100" y2="90" stroke="var(--border)" strokeWidth="1.5" />
        <path
          d="M 0 72 C 15 72, 22 30, 35 30 C 48 30, 52 68, 65 68 C 78 68, 85 50, 100 55 L 100 90 L 0 90 Z"
          fill="url(#acBlue)"
        />
        <path
          d="M 0 72 C 15 72, 22 30, 35 30 C 48 30, 52 68, 65 68 C 78 68, 85 50, 100 55"
          fill="none"
          stroke="#2865E3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

