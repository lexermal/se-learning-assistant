export function getEnv(key: string): string {
    const value = Deno.env.get(key);
    if (!value) {
        throw new Error(`${key} is not set.`);
    }
    return value;
}
