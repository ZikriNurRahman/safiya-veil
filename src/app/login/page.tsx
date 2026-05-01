// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #FFFBE9 0%, #F5E5C4 55%, #EAD4A3 100%)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Background glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%",
          right: "10%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "var(--color-tertiary)",
          opacity: 0.22,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          left: "8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "var(--color-secondary)",
          opacity: 0.15,
          filter: "blur(70px)",
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">
        <div
          className="bg-white overflow-hidden"
          style={{
            boxShadow:
              "0 4px 6px rgba(44,26,14,0.04), 0 20px 60px rgba(44,26,14,0.12)",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              height: 3,
              background:
                "linear-gradient(90deg, var(--color-tertiary), var(--color-primary), var(--color-secondary))",
            }}
          />

          <div style={{ padding: "3rem 2.5rem" }}>
            {/* Brand header */}
            <div className="text-center" style={{ marginBottom: "2.5rem" }}>
              <div
                className="flex items-center justify-center gap-3"
                style={{ marginBottom: "0.75rem" }}
              >
                <div style={{ height: 1, width: 28, background: "var(--color-secondary)" }} />
                <p
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "var(--color-secondary)",
                  }}
                >
                  Admin Portal
                </p>
                <div style={{ height: 1, width: 28, background: "var(--color-secondary)" }} />
              </div>
              <h1
                className="font-display text-brand-primary"
                style={{ fontSize: "2.4rem", lineHeight: 1.1 }}
              >
                Safiya Veil
              </h1>
              <p
                className="font-display italic"
                style={{ color: "#9CA3AF", fontSize: "0.85rem", marginTop: 6 }}
              >
                Grace in Style, Pure in Faith
              </p>
            </div>

            {/* Error state */}
            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  fontSize: "0.82rem",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.5rem",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Email field */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.62rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "#6B7280",
                    marginBottom: 8,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="owner@safiyaveil.com"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "none",
                    borderBottom: "2px solid var(--color-tertiary)",
                    background: "rgba(255,251,233,0.4)",
                    outline: "none",
                    fontSize: "0.9rem",
                    color: "var(--color-espresso)",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>

              {/* Password field */}
              <div style={{ marginBottom: "2rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.62rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "#6B7280",
                    marginBottom: 8,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "none",
                    borderBottom: "2px solid var(--color-tertiary)",
                    background: "rgba(255,251,233,0.4)",
                    outline: "none",
                    fontSize: "0.9rem",
                    color: "var(--color-espresso)",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-primary)")
                  }
                  onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderBottomColor =
                    "var(--color-tertiary)")
                  }
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  background: loading ? "var(--color-secondary)" : "var(--color-primary)",
                  color: "white",
                  border: "none",
                  fontSize: "0.7rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.25s",
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-primary)";
                }}
              >
                {loading ? "Memproses..." : "Masuk Dashboard"}
              </button>
            </form>
          </div>
        </div>

        <p
          className="text-center"
          style={{
            marginTop: "1.5rem",
            fontSize: "0.62rem",
            letterSpacing: "0.15em",
            color: "rgba(206,171,147,0.7)",
            textTransform: "uppercase",
          }}
        >
          © 2025 Safiya Veil · Admin Access Only
        </p>
      </div>
    </div>
  );
}