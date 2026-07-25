import type { ParsedQs } from "qs";


export function getStringParam(value: string | ParsedQs | (string | ParsedQs)[] | undefined): string | null {
    if (typeof value === "string") return value;
    return null;
}