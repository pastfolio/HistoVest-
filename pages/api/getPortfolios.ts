import { supabase } from "../../utils/supabaseClient";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const { user_id } = req.query;
        const { data, error } = await supabase
            .from("portfolios")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json({ portfolios: data });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
