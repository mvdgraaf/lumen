import type { Request, Response, NextFunction } from 'express';
import {Prisma} from "@prisma/client/extension";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    // TODO: Handle Prisma errors and other errors appropriately
    // if (err instanceof Prisma.PrismaClientKnownRequestError) {
    //     if (err.code === "P2002") {
    //
    //     }
    // }
}