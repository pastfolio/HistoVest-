"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

interface Portfolio {
    id: string;
    name: string;
    created_at: string;
    stocks: any;
    investment_amount: number | null;
    start_date: string;
    end_date: string;
    end_value: number | null;
    growth: number | null;
    ai_summary: string;
}

const SavedPortfolios = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchPortfolios();
        }
    }, [user]);

    const fetchPortfolios = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("portfolios")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching portfolios:", error);
        } else {
            setPortfolios(data);
        }
    };

    const loadPortfolio = (portfolio: Portfolio) => {
        const encodedPortfolio = encodeURIComponent(JSON.stringify(portfolio));
        router.push(`/historical-stock-simulator?portfolio=${encodedPortfolio}`);
    };

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <h2 className="text-2xl font-bold text-[#facc15] mb-4">📌 Saved Portfolios</h2>
            {portfolios.length === 0 ? (
                <p className="text-gray-400">No saved portfolios yet.</p>
            ) : (
                <div className="space-y-4">
                    {portfolios.map((portfolio) => (
                        <div 
                            key={portfolio.id} 
                            className="p-4 bg-gray-800 rounded-lg shadow cursor-pointer hover:bg-gray-700"
                            onClick={() => loadPortfolio(portfolio)}
                        >
                            <h3 className="font-bold text-yellow-400">{portfolio.name}</h3>
                            <p className="text-gray-300">
                                📅 {portfolio.created_at ? new Date(portfolio.created_at).toLocaleDateString() : "Unknown Date"}
                            </p>
                            <p className="text-gray-400">
                                💰 Investment: ${portfolio.investment_amount ? portfolio.investment_amount.toLocaleString() : "N/A"}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedPortfolios;
