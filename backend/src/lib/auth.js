export function createApiKeyAuth({ supabaseClient = null } = {}) {
  return async function requireApiKeyAuth(req, res, next) {
    try {
      const client = supabaseClient || (await import("./supabase.js")).supabase;
      const headerValue = req.get("x-api-key");
      const apiKey = typeof headerValue === "string" ? headerValue.trim() : "";

      if (!apiKey) {
        return res.status(401).json({ error: "Missing x-api-key header" });
      }

      const { data: merchant, error } = await client
        .from("merchants")
        .select("id, email, business_name, notification_email")
        .eq("api_key", apiKey)
        .maybeSingle();

      if (error) {
        error.status = 500;
        throw error;
      }

      if (!merchant) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      req.merchant = merchant;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireApiKeyAuth(options) {
  return createApiKeyAuth(options);
}
