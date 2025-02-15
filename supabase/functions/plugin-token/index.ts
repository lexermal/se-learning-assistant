import { createJWT } from "../_shared/JWT.ts";
import { JWTPayload } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { serve, WebServerResponse } from "../_shared/WebServer.ts";
import { getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

serve("POST", async (_, payload: JWTPayload) => {
  payload.user_role = "plugin";
  payload.plugin_id = "plugin342442";
  payload.exp = getNumericDate(2 * 60 * 60);
  payload.iat = getNumericDate(0);

  // Sign the new token.
  const newToken = await createJWT(payload);

  return new WebServerResponse({ token: newToken });
});