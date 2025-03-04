import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            alert("Check your email for confirmation!");
            router.push("/auth/signin"); // Redirect to login
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Sign Up</h2>
                {error && <p className="text-red-400">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-700 rounded"
                    />
                    <button type="submit" className="w-full p-3 bg-yellow-400 text-gray-900 rounded">
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account? <a href="/auth/signin" className="text-blue-300">Sign in</a>
                </p>
            </div>
        </div>
    );
}
