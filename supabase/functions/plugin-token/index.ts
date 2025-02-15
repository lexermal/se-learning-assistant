import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { JWTPayload, jwtVerify, SignJWT } from "npm:jose@5.9.6";

// Read your Supabase JWT secret from env variables (always keep this secret secure)
const SUPABASE_JWT_SECRET = Deno.env.get("ADMIN_JWT_SECRET");
if (!SUPABASE_JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET is not set.");
}

// Add CORS headers export so they can be reused in responses.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Get the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized: Missing Authorization header", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Expect header as "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return new Response("Unauthorized: Invalid Authorization header", {
        status: 401,
        headers: corsHeaders,
      });
    }
    const incomingToken = parts[1];

    const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);
    const payload = await verifyJWT(incomingToken, secret);

    // Verify the incoming JWT using your Supabase JWT secret.
    // The verify() function will return the payload if the token is valid.
    const originalPayload = payload;

    // Ensure there's a sub (user id) claim
    const userId = originalPayload.sub;
    if (!userId) {
      return new Response("Unauthorized: Missing user id in token", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Prepare to generate a new token with the modified claims.
    // For example, set a short expiration (15 minutes in this case).
    const exp = getNumericDate(15 * 60); // expires in 15 minutes
    const iat = getNumericDate(0);

    const newPayload = originalPayload;
    newPayload.user_role = "plugin";
    newPayload.plugin_reference = "plugin342442";
    newPayload.exp = exp;
    newPayload.iat = iat;

    // Sign the new token.
    const newToken = await createJWT(newPayload, secret);

    // Return the new plugin token.
    return new Response(JSON.stringify({ token: newToken }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error generating plugin token:", error);
    return new Response("Internal Server Error: " + error.message, {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function verifyJWT(
  token: string,
  secret: Uint8Array,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("JWT is valid:", payload);
    return payload;
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
}

async function createJWT(
  payload: JWTPayload,
  secret: Uint8Array,
): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwt;
}
