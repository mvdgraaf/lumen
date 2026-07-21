import express from "express";
const router = express.Router();

import v1 from "./V1/index.route.js";

router.use("/v1", v1);

export default router;