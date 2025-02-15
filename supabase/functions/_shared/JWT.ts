import { JWTPayload, jwtVerify, SignJWT } from "npm:jose@5.9.6";
import { getEnv } from "./Env.ts";

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        console.log("JWT is valid:", payload);
        return payload;
    } catch (error) {
        console.error("Invalid JWT:", error);
        return null;
    }
}

export async function createJWT(payload: JWTPayload): Promise<string> {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(getSecret());

    return jwt;
}

function getSecret(): Uint8Array {
    const secret = getEnv("ADMIN_JWT_SECRET");
    return new TextEncoder().encode(secret);
}
