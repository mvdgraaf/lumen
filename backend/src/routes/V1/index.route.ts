import express from "express";
const router = express.Router();

import company from "./Company.route.js";

router.use("/company", company);

export default router;