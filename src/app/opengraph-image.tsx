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
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#000",
                }}
            >
                <img
                    src="https://wakatopo.vercel.app/wakato_gemini_logo.png"
                    alt="WAKATO Portfolio"
                    width={1200}
                    height={630}
                    style={{ objectFit: "cover" }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
