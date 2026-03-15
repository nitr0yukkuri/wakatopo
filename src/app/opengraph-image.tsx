import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WAKATOPO | Living Planet Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #020202 0%, #0a0a1a 40%, #0d1224 70%, #060d1a 100%)",
                    fontFamily: "sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* 背景の星っぽいドット群 */}
                {[
                    [80, 60], [200, 120], [350, 45], [500, 90], [650, 30], [820, 80], [950, 55], [1100, 100],
                    [120, 200], [300, 250], [480, 180], [700, 220], [900, 170], [1050, 240],
                    [60, 350], [240, 400], [420, 320], [620, 380], [800, 330], [1000, 370], [1140, 310],
                    [150, 500], [380, 560], [560, 490], [750, 540], [920, 500], [1080, 560],
                ].map(([x, y], i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: i % 5 === 0 ? 3 : 1.5,
                            height: i % 5 === 0 ? 3 : 1.5,
                            borderRadius: "50%",
                            background: i % 7 === 0 ? "#a0c4ff" : "rgba(255,255,255,0.7)",
                        }}
                    />
                ))}

                {/* 左側の惑星 */}
                <div
                    style={{
                        position: "absolute",
                        left: -80,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 340,
                        height: 340,
                        borderRadius: "50%",
                        background: "radial-gradient(circle at 35% 35%, #4a6fa5 0%, #1a3a6b 40%, #0a1a3d 70%, #030a1a 100%)",
                        boxShadow: "0 0 60px rgba(74,111,165,0.4), inset -30px -20px 60px rgba(0,0,0,0.6)",
                        display: "flex",
                    }}
                />

                {/* 右側の小惑星 */}
                <div
                    style={{
                        position: "absolute",
                        right: 60,
                        top: 80,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "radial-gradient(circle at 40% 35%, #c47a3c 0%, #8b4513 50%, #3d1d07 100%)",
                        boxShadow: "0 0 30px rgba(196,122,60,0.3), inset -15px -10px 30px rgba(0,0,0,0.6)",
                        display: "flex",
                    }}
                />

                {/* メインコンテンツ */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0,
                        zIndex: 10,
                    }}
                >
                    {/* タグライン */}
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 400,
                            letterSpacing: "0.35em",
                            color: "rgba(160,196,255,0.8)",
                            textTransform: "uppercase",
                            marginBottom: 16,
                            display: "flex",
                        }}
                    >
                        Interactive 3D Portfolio
                    </div>

                    {/* メインタイトル */}
                    <div
                        style={{
                            fontSize: 110,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            background: "linear-gradient(180deg, #ffffff 0%, #a0c4ff 60%, #5b8dd9 100%)",
                            backgroundClip: "text",
                            color: "transparent",
                            lineHeight: 1,
                            display: "flex",
                        }}
                    >
                        WAKATOPO
                    </div>

                    {/* サブタイトル */}
                    <div
                        style={{
                            fontSize: 22,
                            fontWeight: 300,
                            color: "rgba(255,255,255,0.55)",
                            letterSpacing: "0.2em",
                            marginTop: 16,
                            display: "flex",
                        }}
                    >
                        LIVING PLANET
                    </div>

                    {/* セパレーター */}
                    <div
                        style={{
                            width: 120,
                            height: 1,
                            background: "linear-gradient(90deg, transparent, rgba(160,196,255,0.6), transparent)",
                            margin: "28px 0",
                            display: "flex",
                        }}
                    />

                    {/* 説明文 */}
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 400,
                            color: "rgba(200,220,255,0.7)",
                            letterSpacing: "0.04em",
                            textAlign: "center",
                            maxWidth: 600,
                            lineHeight: 1.6,
                            display: "flex",
                        }}
                    >
                        GitHubの活動とリアルタイム天気が連動する
                    </div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 400,
                            color: "rgba(200,220,255,0.7)",
                            letterSpacing: "0.04em",
                            textAlign: "center",
                            maxWidth: 600,
                            lineHeight: 1.6,
                            marginTop: 4,
                            display: "flex",
                        }}
                    >
                        インタラクティブな3Dポートフォリオサイト
                    </div>
                </div>

                {/* 底部のグロー */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -60,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 600,
                        height: 200,
                        borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(74,111,165,0.25) 0%, transparent 70%)",
                        display: "flex",
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
