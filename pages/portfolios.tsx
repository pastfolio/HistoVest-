"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import SavedPortfolios from "../components/SavedPortfolios";

export default function PortfoliosPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white flex justify-center items-center px-6">
            <div className="max-w-4xl w-full p-10 bg-black/30 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl">
                <h1 className="text-2xl font-bold text-[#facc15] text-center">📂 Your Portfolios</h1>
                {user && <SavedPortfolios userId={user.id} />}
            </div>
        </div>
    );
}
