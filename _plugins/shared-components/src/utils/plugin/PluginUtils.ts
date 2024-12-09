export function getBackendDomain() {
    if (process.env.NODE_ENV === "production") {
        return "";
    }
    return "http://localhost:3000";
}