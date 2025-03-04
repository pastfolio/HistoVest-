import { handleAuth } from "@supabase/ssr";

export default handleAuth({ logout: { returnTo: "/" } });
