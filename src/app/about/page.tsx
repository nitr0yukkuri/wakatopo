import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">

            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20" />

            {/* Top Navigation */}
            <nav className="relative z-50 p-6 md:p-12">
                <Link href="/" className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-cyan-500 hover:text-white transition-colors group">
                    <span className="w-6 h-[1px] bg-cyan-500 group-hover:bg-white transition-colors" />
                    RETURN TO ORBIT
                </Link>
            </nav>

            <div className="relative z-10 container mx-auto px-6 md:px-12 pt-12 pb-32 flex flex-col md:flex-row gap-16 md:gap-32 items-start justify-center min-h-[80vh]">

                {/* Left Column: Identity */}
                <div className="flex-1 max-w-lg animate-fade-in-up">
                    <div className="mb-8">
                        <span className="text-xs font-mono tracking-widest text-gray-500 block mb-4 border-l border-cyan-500 pl-4">IDENTIFICATION</span>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
                            WAKATO
                        </h1>
                        <p className="mt-4 text-xl md:text-2xl text-cyan-400 font-light tracking-wide">
                            Interactive Web Developer.
                        </p>
                    </div>

                    <div className="space-y-6 text-gray-400 font-mono text-sm leading-relaxed">
                        <p>
                            デジタルな世界に「呼吸」と「体温」を吹き込むことを目指すフロントエンドエンジニア / クリエイター。
                            静的な情報の羅列ではなく、ユーザーの操作や環境と呼応する有機的なWeb体験（Interactive Web Experience）を追求しています。
                        </p>
                        <p>
                            3Dグラフィックス（Three.js）や複雑なアニメーションを駆使し、
                            スクリーンの向こう側に確かな「世界」を感じさせる実装を得意としています。
                        </p>
                    </div>
                </div>

                {/* Right Column: Details & Stats */}
                <div className="flex-1 w-full max-w-lg space-y-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>

                    {/* Status Card */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
                        <h2 className="text-xs font-mono tracking-widest text-gray-500 mb-6 flex items-center gap-4">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            CURRENT STATUS
                        </h2>

                        <dl className="space-y-4 font-mono text-sm">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <dt className="text-gray-500">AFFILIATION</dt>
                                <dd className="text-right text-gray-200">ECC Computer IT College<br /><span className="text-xs text-gray-500">(ECCコンピュータ専門学校)</span></dd>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <dt className="text-gray-500">GRADE</dt>
                                <dd className="text-right text-gray-200">1st Year <span className="text-cyan-500">//</span> Class of 2029</dd>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <dt className="text-gray-500">BASE</dt>
                                <dd className="text-right text-gray-200">Osaka, Japan</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Tech & Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xs font-mono tracking-widest text-gray-500 mb-4 border-l border-cyan-500 pl-3">CORE TECH</h2>
                            <ul className="space-y-2 font-mono text-sm text-gray-300">
                                <li className="hover:text-cyan-400 transition-colors cursor-default">React / Next.js</li>
                                <li className="hover:text-cyan-400 transition-colors cursor-default">TypeScript</li>
                                <li className="hover:text-cyan-400 transition-colors cursor-default">Three.js / R3F</li>
                                <li className="hover:text-cyan-400 transition-colors cursor-default">Tailwind CSS</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xs font-mono tracking-widest text-gray-500 mb-4 border-l border-cyan-500 pl-3">LINKS</h2>
                            <ul className="space-y-2 font-mono text-sm text-cyan-400 hover:text-cyan-300">
                                <li>
                                    <a href="https://github.com/nitr0yukkuri" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline underline-offset-4">
                                        GitHub ↗
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 hover:underline underline-offset-4">
                                        Twitter ↗
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 hover:underline underline-offset-4">
                                        Zenn ↗
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
}
