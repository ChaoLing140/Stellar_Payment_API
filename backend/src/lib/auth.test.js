import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiKeyAuth } from "./auth.js";

function createResponse() {
  return {
    status: vi.fn(),
    json: vi.fn()
  };
}

function createRequest(headers = {}) {
  return {
    get(name) {
      return headers[name.toLowerCase()];
    }
  };
}

describe("createApiKeyAuth", () => {
  let maybeSingle;
  let eq;
  let select;
  let from;
  let supabaseClient;
  let middleware;
  let res;
  let next;

  beforeEach(() => {
    maybeSingle = vi.fn();
    eq = vi.fn(() => ({ maybeSingle }));
    select = vi.fn(() => ({ eq }));
    from = vi.fn(() => ({ select }));
    supabaseClient = { from };
    middleware = createApiKeyAuth({ supabaseClient });
    res = createResponse();
    res.status.mockReturnValue(res);
    next = vi.fn();
  });

  it("rejects requests without an x-api-key header", async () => {
    const req = createRequest();

    await middleware(req, res, next);

    expect(from).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing x-api-key header" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid API key", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    const req = createRequest({ "x-api-key": "invalid-key" });

    await middleware(req, res, next);

    expect(from).toHaveBeenCalledWith("merchants");
    expect(select).toHaveBeenCalledWith("id, email, business_name, notification_email");
    expect(eq).toHaveBeenCalledWith("api_key", "invalid-key");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid API key" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the authenticated merchant to the request", async () => {
    const merchant = {
      id: "merchant-123",
      email: "merchant@example.com",
      business_name: "Merchant Co",
      notification_email: "ops@example.com"
    };
    maybeSingle.mockResolvedValue({ data: merchant, error: null });
    const req = createRequest({ "x-api-key": "  valid-key  " });

    await middleware(req, res, next);

    expect(eq).toHaveBeenCalledWith("api_key", "valid-key");
    expect(req.merchant).toEqual(merchant);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("forwards Supabase lookup failures to the error handler", async () => {
    const error = new Error("Supabase unavailable");
    maybeSingle.mockResolvedValue({ data: null, error });
    const req = createRequest({ "x-api-key": "valid-key" });

    await middleware(req, res, next);

    expect(error.status).toBe(500);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
