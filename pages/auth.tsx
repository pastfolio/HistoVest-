"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (type: "signIn" | "signUp") => {
    setLoading(true);
    setError("");

    const { data, error } =
      type === "signUp"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push("/"); // Redirect to homepage after login
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] text-gray-200">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-[#facc15] mb-6">Sign In / Sign Up</h2>

        {/* Input Fields */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-400 text-center mt-3">{error}</p>}

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleAuth("signIn")}
            disabled={loading}
            className="w-full bg-[#facc15] text-black font-semibold p-3 rounded-md shadow-md hover:bg-yellow-500 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            onClick={() => handleAuth("signUp")}
            disabled={loading}
            className="w-full bg-gray-700 text-white font-semibold p-3 rounded-md shadow-md hover:bg-gray-600 transition"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
