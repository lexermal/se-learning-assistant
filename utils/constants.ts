import { unstable_noStore as noStore } from 'next/cache';
// import { LOGGING_BACKEND_URL } from 'server/pdf-to-markdown-conversion/src/utils/constants';

noStore();

if (typeof window !== "undefined") {
    console.error("This file is only allowed be imported on server side. Currently it's imported on client side.");
    console.log(new Error().stack);
}

export type Env = typeof env;

export const env = {
    APP_DOMAIN: getEnv('APP_DOMAIN'),
    SUPABASE_URL: getEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
    DEFAULT_PLUGIN_ENDPOINT: getEnv('DEFAULT_PLUGIN_ENDPOINT'),
    // ALLOWED_DOMAINS: getEnv('NEXT_PUBLIC_ALLOWED_DOMAINS'),
    // UPLOAD_BACKEND: getEnv('NEXT_PUBLIC_UPLOAD_BACKEND'),
    // ANTHROPIC_API_KEY: getEnv('NEXT_PUBLIC_ANTHROPIC_API_KEY'),
    // ELEVENLABS_API_KEY: getEnv('NEXT_PUBLIC_ELEVENLABS_API_KEY'),
    // MATOMO_URL: getEnv('NEXT_PUBLIC_MATOMO_URL'),
    OPENAI_API_KEY: getEnv('OPENAI_API_KEY'),
    // PLUGIN_ENDPOINT: getEnv('PLUGIN_ENDPOINT'),
    // LOGGING_BACKEND_URL: getEnv("NEXT_PUBLIC_LOGGING_BACKEND_URL"),
    // LOGGING_USERNAME: getEnv("NEXT_PUBLIC_LOGGING_USERNAME"),
    // LOGGING_PASSWORD: getEnv("NEXT_PUBLIC_LOGGING_PASSWORD"),
    // EXPERIMENTAL_EXAM_SIMULATION: getEnv("NEXT_PUBLIC_EXPERIMENTAL_EXAM_SIMULATION", "false"),
};

function getEnv(name: string, defaultVal?: string): string {
    if (!process.env[name] && process.env[name] != "") {
        if (defaultVal !== undefined) {
            return defaultVal;
        }
        throw new Error(`Missing environment variable ${name}`)
    }
    return process.env[name] as string
}
