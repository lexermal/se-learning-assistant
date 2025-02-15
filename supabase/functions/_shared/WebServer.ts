import { verifyJWT } from "../_shared/JWT.ts";
import { getCorsHeaders } from "../_shared/Cors.ts";
import { JWTPayload as DenoJWTPayload } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { serve as denoServe } from "https://deno.land/std@0.140.0/http/server.ts";

export type JWTPayload = DenoJWTPayload

type Handler<T> = (reqData: T, payload: JWTPayload) => Promise<WebServerResponse | Response>;

export function serve<T>(allowedMethods: string | string[], handler: Handler<T>) {
    if (typeof allowedMethods === "string") {
        allowedMethods = [allowedMethods];
    }

    denoServe(async (req: Request) => {
        const corsHeaders = getCorsHeaders();

        if (req.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        try {
            // Check if the method is allowed
            if (!allowedMethods.includes(req.method)) {
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

            const payload = await verifyJWT(incomingToken);

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

            let query = await parseRequestBody(req);
            const response = await handler(query, payload);

            if (response instanceof Response) {
                return response;
            }

            return new Response(response.getBody(), {
                status: response.status,
                headers: response.getHeaders(),
            });
        } catch (error) {
            if (error instanceof WebError && error.httpStatus < 500) {
                return new Response(error.message, {
                    status: error.httpStatus,
                    headers: corsHeaders,
                });
            }

            console.error("Error while serving web server:", error);
            return new Response("Internal Server Error: ", {
                status: 500,
                headers: corsHeaders,
            });
        }
    });
}

async function parseRequestBody(req: Request): Promise<any> {
    const text = await req.text();
    if (text) {
        return JSON.parse(text);
    }
    return {};
}

type ResponseType = "json" | "text" | "stream";

export class WebServerResponse {
    constructor(response: any, status = 200, responseType: ResponseType = "json", headers: Record<string, string> = {}) {
        this.response = response;
        this.status = status;
        this.responseType = responseType;
        this.headers = headers;
    }

    response: any;
    status: number;
    responseType: ResponseType;
    headers: Record<string, string>;

    getBody() {
        return this.responseType === "json" ? JSON.stringify(this.response) : this.response;
    }

    getHeaders() {
        const eventTypeMap = {
            "text": "text/plain",
            "json": "application/json",
            "stream": "text/event-stream"
        }

        return {
            ...getCorsHeaders(),
            "Content-Type": eventTypeMap[this.responseType],
            ...this.headers
        };
    }
}

export class WebError extends Error {
    constructor(message: string, errorKey: WebErrorKey, httpStatus = 500) {
        super(message);
        this.errorKey = errorKey;
        this.httpStatus = httpStatus;
    }

    httpStatus: number;

    errorKey: WebErrorKey;
}

export enum WebErrorKey {
    InvalidAuthorizationHeader = "invalid_authorization_header",
    MissingUserIdInToken = "missing_user_id_in_token",
    InvalidJWT = "invalid_jwt",
}