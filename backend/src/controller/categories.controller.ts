import type {AuthenticatedRequest} from "../types/express";
import type {Response, NextFunction} from "express";
import {prisma} from "../lib/db.lib"

export async function listCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.companyId) return res.status(400).json({error: "Company ID is required."});
        const categories = await prisma.category.findMany({
            where: {companyId: req.companyId}
        });

        if (categories.length === 0) return res.status(404).json({error: "No categories found."});

        return res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}

export async function createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.companyId) return res.status(400).json({error: "Company ID is required."});
        const category = await prisma.category.create({
            data: {
                name: req.body.name,
                companyId: req.companyId
            }
        });
        return res.status(201).json(category);
    } catch (error) {
        next(error);
    }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.companyId) return res.status(400).json({error: "Company ID is required."});
        const id = req.params.id;

        if (!id || Array.isArray(id)) return res.status(400).json({error: "Category ID is required."});

        const exist = await prisma.category.findUnique({
            where: {id, companyId: req.companyId}
        });

        if (!exist) return res.status(404).json({error: "Category not found."});

        const category = await prisma.category.delete({
            where: {id, companyId: req.companyId}
        });

        return res.status(200).json({ message: "Category deleted successfully."});
    } catch (error) {
        next(error);
    }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.companyId) return res.status(400).json({error: "Company ID is required."});
        const id = req.params.id;
        if (!id || Array.isArray(id)) return res.status(400).json({error: "Category ID is required."});
        const exist = await prisma.category.findUnique({
            where: {id, companyId: req.companyId}
        });

        if (!exist) return res.status(404).json({error: "Category not found."});
        const category = await prisma.category.update({
            where: {id, companyId: req.companyId},
            data: {
                name: req.body.name
            }
        });
        return res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}