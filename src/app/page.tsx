import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Premium Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-4xl px-6">
        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Digital Heroes{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
            Golf
          </span>
        </h1>

        {/* Value Proposition */}
        <p className="text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          The premier subscription club where your golf scores unlock monthly
          cash prizes, and every membership directly funds global charities.
          Play with purpose.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth"
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Join the Club
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-neutral-900 border border-neutral-800 text-white font-bold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Member Login
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-800 pt-12">
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold text-white mb-2">10%</h3>
            <p className="text-sm text-neutral-500 uppercase tracking-wider font-medium">
              Minimum Charity Pledge
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold text-purple-400 mb-2">Monthly</h3>
            <p className="text-sm text-neutral-500 uppercase tracking-wider font-medium">
              Random Prize Draws
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold text-green-400 mb-2">100%</h3>
            <p className="text-sm text-neutral-500 uppercase tracking-wider font-medium">
              Secure Payouts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
