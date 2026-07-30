import { ImageResponse } from "next/og";

// New 2026-07-30 — audit finding #3 (Critical). Generated on the server via
// Next's built-in ImageResponse (no external design tool/asset needed),
// using the app's real brand colors/type pairing so a shared link actually
// looks like Mom's Village. Next.js auto-serves this at /opengraph-image
// and wires it into every page's Open Graph/Twitter metadata automatically.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#FBF4E8",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 56,
            display: "flex",
            gap: 14,
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#D9A441",
                opacity: 0.75,
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 600,
            color: "#1F2E4D",
          }}
        >
          mom
          <span style={{ color: "#A97418" }}>village</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#2B2420",
            opacity: 0.75,
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          From your first positive test to her third birthday
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            display: "flex",
            gap: 14,
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#D9A441",
                opacity: 0.75,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
