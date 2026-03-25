import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-purple-500/30 overflow-hidden font-sans">
      {/* 1. HERO SECTION (Emotion-driven, Clean, No Golf Clichés) */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-20 pb-32">
        {/* Abstract background glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm text-sm text-neutral-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            10% Minimum Charity Pledge Enforced
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
            Turn your performance into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-emerald-400">
              global impact.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-neutral-400 mb-12 max-w-2xl leading-relaxed">
            A premium subscription platform where your logged scores unlock
            algorithmic monthly cash prizes—and every membership directly funds
            global charities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <Link
              href="/auth"
              className="w-full sm:w-auto px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-neutral-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
            >
              Subscribe Now &rarr;
            </Link>
            <Link
              href="/auth"
              className="w-full sm:w-auto px-10 py-5 bg-neutral-900 border border-neutral-800 text-white text-lg font-bold rounded-full hover:bg-neutral-800 transition-colors flex items-center justify-center"
            >
              Member Login
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (What user does, how they win, charity impact) */}
      <section className="py-32 bg-neutral-950 relative z-10 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              The Platform Engine
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Three steps to algorithmic payouts and charitable giving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: What the user does */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-10 rounded-3xl">
              <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center text-2xl mb-8">
                📝
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Log Your Data</h3>
              <p className="text-neutral-400 leading-relaxed">
                Play your round. Input your score into our secure dashboard.
                Every score logged acts as your active entry into the monthly
                draw.
              </p>
            </div>

            {/* Step 2: How they win */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
              <div className="w-14 h-14 bg-purple-900/30 text-purple-400 border border-purple-800/50 rounded-2xl flex items-center justify-center text-2xl mb-8">
                ⚙️
              </div>
              <h3 className="text-2xl font-bold mb-4">2. The Algorithm Runs</h3>
              <p className="text-neutral-400 leading-relaxed">
                At the end of the month, our proprietary engine generates the
                winning sequence. Match 3, 4, or 5 numbers to secure your
                fractional share of the pool.
              </p>
            </div>

            {/* Step 3: Charity Impact */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-2xl flex items-center justify-center text-2xl mb-8">
                🌍
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Impact Generated</h3>
              <p className="text-neutral-400 leading-relaxed">
                Before a single dollar is paid out to winners, exactly 10% of
                the total revenue is instantly routed to our verified global
                charity directory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FINAL PERSUASIVE CTA */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 relative z-10">
            Make your data matter.
          </h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join the platform that rewards your performance and funds the
            future. Secure your membership today.
          </p>

          <Link
            href="/auth"
            className="relative z-10 inline-block px-12 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-neutral-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Start Your Subscription
          </Link>
        </div>
      </section>
    </div>
  );
}
