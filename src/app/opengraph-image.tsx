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
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
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
                    }}
                />

                {/* メインコンテンツ */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 24,
                        zIndex: 10,
                        textAlign: "center",
                        paddingLeft: 40,
                        paddingRight: 40,
                    }}
                >
                    <h1
                        style={{
                            fontSize: 72,
                            fontWeight: "bold",
                            color: "white",
                            margin: 0,
                            letterSpacing: "-2px",
                        }}
                    >
                        WAKATOPO
                    </h1>
                    <p
                        style={{
                            fontSize: 32,
                            color: "#a0c4ff",
                            margin: 0,
                            fontWeight: 300,
                            letterSpacing: "2px",
                        }}
                    >
                        Living Planet Portfolio
                    </p>
                    <p
                        style={{
                            fontSize: 18,
                            color: "rgba(255,255,255,0.6)",
                            margin: "16px 0 0 0",
                            maxWidth: 600,
                        }}
                    >
                        Code breathes with the atmosphere
                    </p>
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
                    }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
