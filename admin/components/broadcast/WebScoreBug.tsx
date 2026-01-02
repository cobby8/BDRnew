import { clsx } from 'clsx';

interface WebScoreBugProps {
    game: any;
    timer: {
        timeLeft: string;
        shotClock: string;
        isShotClockRunning: boolean;
        isTimeoutActive: boolean;
        period: number;
    }
}

// Helper for Fouls
const FoulIndicators = ({ count, color }: { count: number, color: string }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => {
                const isActive = i <= count;
                return (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full border border-opacity-50"
                        style={{
                            backgroundColor: isActive ? color : '#444',
                            borderColor: isActive ? color : '#666'
                        }}
                    />
                );
            })}
        </div>
    );
};

export default function WebScoreBug({ game, timer }: WebScoreBugProps) {
    if (!game) return null;

    const { homeTeam, awayTeam, homeScore, awayScore } = game;
    // Calculate Fouls (Mocking for now as we might need live stats)
    // For MVP, we might display 0 or get it from game stats if available.
    // Assuming game object might have these later, or we use a separate stats object.
    const homeFouls = 0;
    const awayFouls = 0;

    const formatPeriod = (p: number) => {
        if (p > 4) return 'OT';
        return `${p}Q`;
    };

    return (
        <div className="relative transform scale-90 origin-top shadow-2xl rounded-xl overflow-hidden font-sans select-none">

            {/* Main Container with Gradient Background */}
            <div className="flex flex-row items-center px-4 py-2 bg-gradient-to-b from-gray-900/95 to-black/95 border border-white/10 rounded-xl min-w-[800px] justify-center text-white">

                {/* --- LEFT SIDE: HOME --- */}
                <div className="flex-1 flex flex-row items-center justify-start gap-3">
                    {/* Strip */}
                    <div className="w-1 h-8 bg-red-500 rounded-sm mr-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>

                    {/* Logo */}
                    {homeTeam?.logoUrl ? (
                        <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-8 h-8 object-contain" />
                    ) : (
                        <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                            {homeTeam?.name?.substring(0, 1)}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex flex-col items-start justify-center">
                        <span className="text-lg font-extrabold tracking-wide uppercase text-white drop-shadow-md">
                            {homeTeam?.name || 'HOME'}
                        </span>
                        <FoulIndicators count={homeFouls} color="#ef4444" />
                    </div>

                    {/* Score */}
                    <div className="ml-auto w-12 h-10 bg-gradient-to-b from-white to-gray-300 rounded-md flex items-center justify-center shadow-inner">
                        <span className="text-black text-2xl font-black font-mono tracking-tighter">
                            {homeScore || 0}
                        </span>
                    </div>
                </div>

                {/* --- CENTER: CLOCK & PERIOD --- */}
                <div className="mx-6 px-5 border-x border-white/10 flex flex-row items-center gap-4 z-10">

                    {/* Period Badge */}
                    <div className="bg-white/10 px-2 py-0.5 rounded text-amber-400 font-bold text-sm">
                        {formatPeriod(timer.period)}
                    </div>

                    {/* Game Clock */}
                    <div className={clsx(
                        "text-3xl font-bold font-mono tabular-nums tracking-widest",
                        !timer.isShotClockRunning && "text-amber-400", // Using ShotClockRunning as proxy for Play state for now
                        timer.isTimeoutActive && "text-gray-500"
                    )}>
                        {timer.timeLeft}
                    </div>

                    {/* Shot Clock */}
                    <div className="flex flex-row items-center">
                        <div className={clsx(
                            "w-12 h-9 bg-gray-800 border border-gray-600 rounded flex items-center justify-center",
                            Number(timer.shotClock) < 5 && "border-red-500 bg-red-950",
                            timer.isTimeoutActive && "border-gray-700 bg-gray-900"
                        )}>
                            <span className={clsx(
                                "text-amber-400 text-xl font-bold font-mono",
                                !timer.isShotClockRunning && "opacity-50",
                                timer.isTimeoutActive && "text-gray-500"
                            )}>
                                {timer.shotClock}
                            </span>
                        </div>
                    </div>

                </div>

                {/* --- RIGHT SIDE: AWAY --- */}
                <div className="flex-1 flex flex-row items-center justify-end gap-3">

                    {/* Score */}
                    <div className="mr-auto w-12 h-10 bg-gradient-to-b from-white to-gray-300 rounded-md flex items-center justify-center shadow-inner">
                        <span className="text-black text-2xl font-black font-mono tracking-tighter">
                            {awayScore || 0}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col items-end justify-center">
                        <span className="text-lg font-extrabold tracking-wide uppercase text-white drop-shadow-md text-right">
                            {awayTeam?.name || 'AWAY'}
                        </span>
                        <FoulIndicators count={awayFouls} color="#3b82f6" />
                    </div>

                    {/* Logo */}
                    {awayTeam?.logoUrl ? (
                        <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-8 h-8 object-contain" />
                    ) : (
                        <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                            {awayTeam?.name?.substring(0, 1)}
                        </div>
                    )}

                    {/* Strip */}
                    <div className="w-1 h-8 bg-blue-500 rounded-sm ml-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>

            </div>
        </div>
    );
}
