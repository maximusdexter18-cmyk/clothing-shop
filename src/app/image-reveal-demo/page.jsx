// src/app/image-reveal-demo/page.jsx
"use client";

import ImageReveal from "@/components/ImageReveal";

export default function ImageRevealDemo() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "60px 20px",
      }}
    >
      <div style={{ textAlign: "center", color: "#fff", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "0.05em" }}>
          Image Reveal Demo
        </h1>
        <p style={{ color: "#aaa", marginTop: "12px" }}>
          Scroll down to see the image reveal / scale effect
        </p>
      </div>

      {/* Each ImageReveal animates as it enters and leaves the viewport */}
      <ImageReveal
        src="/cat-men.jpg.jpg"
        alt="Men's collection reveal"
        height={500}
        className="w-full max-w-4xl"
        style={{ maxWidth: 896, margin: "0 auto" }}
      />

      <div style={{ height: 100 }} />

      <ImageReveal
        src="/cat-women.jpg.jpg"
        alt="Women's collection reveal"
        height={500}
        className="w-full max-w-4xl"
        style={{ maxWidth: 896, margin: "0 auto" }}
      />

      <div style={{ height: 100 }} />

      <ImageReveal
        src="/cat-kids.jpg.jpg"
        alt="Kids' collection reveal"
        height={500}
        className="w-full max-w-4xl"
        style={{ maxWidth: 896, margin: "0 auto" }}
      />
    </main>
  );
}