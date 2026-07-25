import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as fs from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({path: path.join(process.cwd(), '.env')});

import { testConnection } from "./lib/db.lib";
import api from "./routes/index.route.js";
import { authLib } from "./lib/auth.lib";
import { toNodeHandler } from "better-auth/node";

const app = express();

const base = YAML.load(path.join(process.cwd(), 'openapi', 'openapi.yaml'));
const openapiPathDir = path.join(process.cwd(), 'openapi');

const authSchema = await authLib.api.generateOpenAPISchema();

for (const [route, methods] of Object.entries(authSchema.paths)) {
    base.paths[`/api/auth${route}`] = methods;
}
if (authSchema.components?.schemas) {
    Object.assign(base.components.schemas, authSchema.components.schemas);
}
if (authSchema.components?.securitySchemes) {
    base.components.securitySchemes = base.components.securitySchemes || {};
    Object.assign(base.components.securitySchemes, authSchema.components.securitySchemes);
}

for (const file of fs.readdirSync(openapiPathDir)) {
    if (!file.endsWith('.yaml')) continue;
    const resource = YAML.load(path.join(openapiPathDir, file));
    if (resource.components?.schemas) {
        Object.assign(base.components.schemas, resource.components.schemas);
    }
    if (resource.components?.securitySchemes) {
        base.components.securitySchemes = base.components.securitySchemes || {};
        Object.assign(base.components.securitySchemes, resource.components.securitySchemes);
    }
    if (resource.paths) {
        Object.assign(base.paths, resource.paths);
    }
}

// null-velden opruimen (Better Auth's schema-generator laat soms `requestBody: null` etc. staan)
function stripNulls(obj: any) {
    for (const key of Object.keys(obj)) {
        if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            stripNulls(obj[key]);
        }
    }
    return obj;
}
stripNulls(base);

// gemergde spec ook naar disk schrijven, voor gebruik door openapi-typescript/openapi-generator
const outDir = path.join(process.cwd(), 'openapi');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'combined.yaml'), YAML.stringify(base, 10, 2));

// --- Middleware ---
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(cors({
    origin: "http://localhost:5173", // vervang door je productie-domein
    credentials: true,
}));

app.all('/api/authLib/{*any}', toNodeHandler(authLib));

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(base));
app.use('/api', api);
//
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//
//     res.status(500).json({
//         error: {
//             message: 'Something went wrong',
//             ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//         }
//     });
// });

await testConnection()
const port = 4000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});