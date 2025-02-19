"use client";

import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface PortfolioData {
    name: string;
    stocks: any;
    investment_amount: number;
    start_date: string;
    end_date: string;
    end_value: number;
    growth: number;
    ai_summary: string;
}

const SavePortfolio = ({ portfolioData }: { portfolioData: PortfolioData }) => {
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Get the logged-in user
    useState(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    });

    const savePortfolio = async () => {
        if (!user) {
            alert("You need to be logged in to save a portfolio.");
            return;
        }

        setSaving(true);

        const { error } = await supabase.from("portfolios").insert([
            {
                user_id: user.id,
                name: portfolioData.name || `Portfolio - ${new Date().toLocaleDateString()}`,
                stocks: portfolioData.stocks,
                investment_amount: portfolioData.investment_amount,
                start_date: portfolioData.start_date,
                end_date: portfolioData.end_date,
                end_value: portfolioData.end_value,
                growth: portfolioData.growth,
                ai_summary: portfolioData.ai_summary,
            },
        ]);

        setSaving(false);

        if (error) {
            console.error("Error saving portfolio:", error);
            alert("Failed to save portfolio.");
        } else {
            alert("Portfolio saved successfully!");
        }
    };

    return (
        <div className="text-center mt-6">
            <button 
                onClick={savePortfolio}
                disabled={saving}
                className="bg-[#facc15] text-black px-6 py-3 font-bold rounded-md hover:bg-yellow-600 transition"
            >
                {saving ? "Saving..." : "💾 Save Portfolio"}
            </button>
        </div>
    );
};

export default SavePortfolio;
