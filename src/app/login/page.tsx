// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-brand-primary mb-6 text-center">
          Akses Owner Safiya Veil
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-brand-secondary rounded mb-3 focus:outline-none focus:border-brand-primary"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-brand-secondary rounded mb-4 focus:outline-none focus:border-brand-primary"
          required
        />
        <button
          type="submit"
          className="w-full bg-brand-primary text-white py-2 rounded hover:bg-brand-secondary transition-colors"
        >
          Masuk
        </button>
      </form>
    </div>
  );
}