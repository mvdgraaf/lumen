import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI ,admin ,organization } from "better-auth/plugins";

import {prisma} from "./db.js";

export const auth = betterAuth({
    experimental: { joins: true },
    database: prismaAdapter(prisma,{
        provider: "postgresql"
    }),
    trustedOrigins: [
      "http://localhost:3000",
    ],
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        admin(),
        openAPI(),
        organization({
            schema: {
                organization: {
                    modelName: "Company",
                },
                member: {
                    modelName: "Member",
                    additionalFields: {
                        phone: { type: "string", required: true },
                        address: { type: "string", required: true },
                        isFreelancer: { type: "boolean", defaultValue: false },
                        defaultHourRate: { type: "number", required: true },
                    },
                },
                invitation: {
                    modelName: "Invitation",
                },
            },
        }),
    ]
});