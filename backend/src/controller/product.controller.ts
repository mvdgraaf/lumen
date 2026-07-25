import type {AuthenticatedRequest} from "../types/express";
import type {Response, NextFunction} from "express";
import {prisma} from "../lib/db.lib";
import {Prisma, ProductType} from "../generated/prisma/client.js";
import {getStringParam} from "../lib/getStringParam.lib";
import type {Asset} from "../generated/prisma/browser";

export async function listProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.companyId) return res.status(400).json({error: "Company ID is required."});

        const categoryId = getStringParam(req.query.categoryId);
        const brand = getStringParam(req.query.brand);
        const modelNumber = getStringParam(req.query.modelNumber);
        const type = getStringParam(req.query.type);

        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: {id: categoryId, companyId: req.companyId}
            });

            if (!category) return res.status(404).json({error: "Category not found."});
        }

        const upperType = type ? type.toUpperCase() : "";
        if (!isValidProductType(upperType)) return res.status(400).json({error: "Invalid product type."});

        const where: Prisma.ProductWhereInput = {
            companyId: req.companyId,
            ...(categoryId ? {categoryId} : {}),
            ...(brand ? {brand} : {}),
            ...(modelNumber ? {modelNumber} : {}),
            ...(type ? {type: upperType as Prisma.EnumProductTypeFilter["equals"]} : {})
        };

        const products = await prisma.product.findMany({where});

        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

export async function getProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    //TODO: implement get product
}

export async function createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        if (!req.companyId) return res.status(400).json({error: "Company ID is required."});

        let {SKU, name, description, categoryId, brand, modelNumber, type, dayPrice, quantity} = req.body;

        if (!name || typeof name !== "string") return res.status(400).json({error: "Name is required."});
        if (!brand || typeof brand !== "string") return res.status(400).json({error: "Brand is required."});
        if (dayPrice == undefined || typeof dayPrice !== "number") return res.status(400).json({error: "Day price is required."});
        if (!type || typeof type !== "string") return res.status(400).json({error: "Type is required."});

        if (quantity == undefined) { quantity = 1 }
            else if (typeof quantity !== "number" || !Number.isInteger(quantity)) { return res.status(400).json({error: "Quantity must be an integer."}); }
            else if (quantity < 0) { return res.status(400).json({error: "Quantity must be a non-negative integer."}); }

        if (!categoryId || typeof categoryId !== "string") return res.status(400).json({error: "Category ID is required."});
        const category = await prisma.category.findUnique({where: {id: categoryId, companyId: req.companyId}});
        if (!category) return res.status(404).json({error: "Category not found."});

        const upperType = type ? type.toUpperCase() : "";
        if (!isValidProductType(upperType)) return res.status(400).json({error: "Invalid product type."});

        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    SKU,
                    name,
                    description,
                    type: upperType as ProductType,
                    brand,
                    modelNumber,
                    dayPrice,
                    quantity,
                    categoryId,
                    companyId: req.companyId
                }
            });
            let assets: Asset[] = [];
            if (upperType == "SIMPLE" && quantity > 0) {

                const assetsData = Array.from({length: quantity}, (_, i) => ({
                    productId: product.id,
                    companyId: req.companyId!,
                    unitId: `${SKU ?? product.id}-${i + 1}`,
                    status: "AVAILABLE" as const
                }));

                await tx.asset.createMany({data: assetsData});
                assets = await tx.asset.findMany({where: {productId: product.id, companyId: req.companyId!}});
            }
            return {product, assets}
        })

        return res.status(201).json({...result.product, assets: result.assets});
    } catch (error) {
        next(error);
    }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    //TODO: Implement delete product
}

export async function updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    //TODO: Implement update product
}

function isValidProductType(value: string): value is ProductType {
    return Object.values(ProductType).includes(value as ProductType);
}