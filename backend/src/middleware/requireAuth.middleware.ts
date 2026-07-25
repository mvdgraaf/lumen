import type { Request, Response, NextFunction } from "express";
import { authLib } from "../lib/auth.lib";
import { fromNodeHeaders } from "better-auth/node";
import type {AuthenticatedRequest} from "../types/express";

export async function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const sessionData = await authLib.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!sessionData) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        req.user = sessionData.user;
        req.session = sessionData.session;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Internal server error during authentication" });
    }
}

export async function requireAuthAndCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const sessionData = await authLib.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!sessionData) {
            return res.status(401).json({error: "Not authenticated"});
        }

        const companyId = sessionData.session.activeOrganizationId;

        if (!companyId) {
            return res.status(401).json({error: "No active organization found"})
        }

        req.companyId = companyId;
        req.user = sessionData.user;
        req.session = sessionData.session;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Internal server error during authentication" });
    }
    }