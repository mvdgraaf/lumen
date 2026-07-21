import express from "express";
const router = express.Router();

router.get("/api/v1/company/list", (req, res) => {
    res.send("Company")
})

router.get("/api/v1/company/:id", (req, res) => {})

export default router;