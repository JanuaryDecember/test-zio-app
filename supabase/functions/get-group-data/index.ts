import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { group_id } = await req.json();

    if (!group_id) {
      return new Response(
        JSON.stringify({ error: "Missing group_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [groupResult, participantsResult, expensesResult] = await Promise.all([
      supabase
        .from("groups")
        .select("*")
        .eq("id", group_id)
        .maybeSingle(),
      supabase
        .from("participants")
        .select("*")
        .eq("group_id", group_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("expenses")
        .select("*")
        .eq("group_id", group_id)
        .order("created_at", { ascending: false }),
    ]);

    if (groupResult.error) throw groupResult.error;
    if (participantsResult.error) throw participantsResult.error;
    if (expensesResult.error) throw expensesResult.error;

    const data = {
      group: groupResult.data,
      participants: participantsResult.data || [],
      expenses: (expensesResult.data || []).map((exp: any) => ({
        ...exp,
        amount:
          typeof exp.amount === "string"
            ? parseFloat(exp.amount)
            : exp.amount,
      })),
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
