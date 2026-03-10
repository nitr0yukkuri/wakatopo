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
                                    <a href="https://x.com/0ts_st" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline underline-offset-4">
                                        Twitter ↗
                                    </a>
                                </li>
                                <li>
                                    <a href="https://zenn.dev/0st_ts" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline underline-offset-4">
                                        Zenn ↗
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Timeline Section */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 pb-32 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold tracking-widest text-white mb-12 flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-cyan-500" />
                    RECORD OF SURVIVAL
                    <span className="text-sm font-normal text-cyan-500 font-mono">// AWARDS & HISTORY</span>
                </h2>

                <div className="space-y-12 border-l border-white/10 ml-2 md:ml-4 pl-8 md:pl-12 font-mono">

                    {/* 2026 */}
                    <div className="relative">
                        <span className="absolute -left-[41px] md:-left-[57px] top-1 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <h3 className="text-xl font-bold text-cyan-400 mb-6 tracking-widest">2026</h3>

                        <ul className="space-y-6 text-sm">
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">03/</span>
                                <div className="flex-1">
                                    <span className="text-white block font-bold">CyberAgent Internship (2days)</span>
                                    <span className="text-gray-400">機械学習基盤体験型インターンシップ 参加</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/08</span>
                                <div className="flex-1">
                                    <span className="text-yellow-400 block font-bold tracking-wider">★ 最優秀賞</span>
                                    <span className="text-gray-400">技育CAMP Vol.19</span> <span className="text-white ml-2">「recaptchaゲーム」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/01</span>
                                <div className="flex-1">
                                    <span className="text-cyan-300 block font-bold tracking-wider">企業賞 (ウイングアーク１ｓｔ)</span>
                                    <span className="text-gray-400">技育博 Vol.6</span> <span className="text-white ml-2">「GitHub Planet」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">03/17</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">Mix Leap Campus #02</span> <span className="text-white ml-2">「IT企業のプロに学ぶ 生成AI活用ハンズオン」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">03/15</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">CyberAgent</span> <span className="text-white ml-2">「Connect Day for Students (大阪・梅田)」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">03/06</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">Mobile Act</span> <span className="text-white ml-2">「Mobile Act OSAKA 18」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">03/04</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">LINEヤフー Tech</span> <span className="text-white ml-2">「GitHub Copilot Meetup - Agent Skills ハンズオン」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/27</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">YUMEMI.grow</span> <span className="text-white ml-2">「復活のY〜とりあえずモバイル開発についてワイワイ語り合おう〜」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/25</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">TechTrain</span> <span className="text-white ml-2">「28卒,29卒学生あつまれ！『ニックトレイン』OSAKA」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/24</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">TSKaigi Mashup Kansai</span> <span className="text-white ml-2">「生成AIでTSを扱うときに考えたい設計&ガードレール」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/19</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">CraftStadium</span> <span className="text-white ml-2">「ハッカソン成功のための実践講座 ─プレゼン術・総仕上げ─」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/15</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ HACKATHON</span>
                                    <span className="text-gray-400">NxTEND</span> <span className="text-white ml-2">「KC3Hack 2026」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">02/13</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">LINEヤフー 大阪オフィス</span> <span className="text-white ml-2">「Mix Leap Campus #01 - データ人材のキャリアから考える学生就活」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">01/24</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">うめきたTechBase</span> <span className="text-white ml-2">「うめきたTechカンファレンス ~大新年会~」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">01/17</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">CyberAgent</span> <span className="text-white ml-2">「1day技術ワークショップ ～パフォーマンスチューニングはここから始めよう～ in関西」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">01/15</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">ココカラ勉強会</span> <span className="text-white ml-2">「【MixLeapコラボ】ココカラ勉強会 2026年 関西コミュニティ新年会」</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* 2025 */}
                    <div className="relative pt-6">
                        <span className="absolute -left-[41px] md:-left-[57px] top-7 w-3 h-3 rounded-full bg-gray-600" />
                        <h3 className="text-xl font-bold text-gray-500 mb-6 tracking-widest">2025</h3>

                        <ul className="space-y-6 text-sm">
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">12/06</span>
                                <div className="flex-1">
                                    <span className="text-orange-400 block font-bold tracking-wider">決勝進出</span>
                                    <span className="text-gray-400">ヒーローズ・リーグ</span> <span className="text-white ml-2">「GitHub Planet」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">12/07</span>
                                <div className="flex-1">
                                    <span className="text-blue-300 block font-bold tracking-wider">展示出展</span>
                                    <span className="text-gray-400">技育博 Vol.5</span> <span className="text-white ml-2">「おてんきぐらし」「グルメイカー」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">11/09</span>
                                <div className="flex-1">
                                    <span className="text-yellow-400 block font-bold tracking-wider">★ 優秀賞</span>
                                    <span className="text-gray-400">技育CAMP Vol.14</span> <span className="text-white ml-2">「GitHub Planet」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">12/21</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">NxTEND</span> <span className="text-white ml-2">「KC3 Meet! Vol.04」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">11/23</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">キャリアセレクト</span> <span className="text-white ml-2">「エンジニア学生オフ会 in 梅田」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">11/15</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">一般社団法人MA</span> <span className="text-white ml-2">「#ヒーローズリーグ 2025 予選 in 第三部」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">10/30</span>
                                <div className="flex-1">
                                    <span className="text-blue-400 block font-bold tracking-wider text-xs mb-1">■ EVENT</span>
                                    <span className="text-gray-400">LINEヤフー 大阪オフィス</span> <span className="text-white ml-2">「第5回制作物天下一武道会 - Mix Leap 8周年記念-」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">10/04</span>
                                <div className="flex-1">
                                    <span className="text-yellow-400 block font-bold tracking-wider">★ 最優秀賞</span>
                                    <span className="text-gray-400">うめきたTechBase</span> <span className="text-white ml-2">「グルメイカー」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">09/07</span>
                                <div className="flex-1">
                                    <span className="text-green-400 block font-bold tracking-wider">努力賞</span>
                                    <span className="text-gray-400">技育CAMP Vol.12</span> <span className="text-white ml-2">「きじょバト」</span>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row gap-2 md:gap-8 hover:bg-white/5 p-4 -ml-4 rounded-lg transition-colors">
                                <span className="text-gray-500 min-w-[3rem]">08/10</span>
                                <div className="flex-1">
                                    <span className="text-yellow-400 block font-bold tracking-wider">★ 優秀賞</span>
                                    <span className="text-gray-400">技育CAMP Vol.10</span> <span className="text-white ml-2">「でんしょうお」</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </main>
    );
}
