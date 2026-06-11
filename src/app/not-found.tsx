export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 text-white font-mono">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.08),transparent_9%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />

            <section className="relative z-10 text-center">
                <p className="mb-4 text-[10px] tracking-[0.42em] text-cyan-200/70">LOST COORDINATE</p>
                <h1 className="mb-4 text-7xl font-bold tracking-[0.12em] text-white md:text-8xl">404</h1>
                <p className="mb-8 text-sm tracking-[0.24em] text-gray-400">Page not found</p>
                <a
                    href="/"
                    className="inline-flex items-center justify-center border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 text-xs tracking-[0.24em] text-cyan-200 transition-colors hover:border-cyan-200 hover:bg-cyan-300/15 hover:text-white"
                >
                    Return to orbit
                </a>
            </section>
        </main>
    );
}
