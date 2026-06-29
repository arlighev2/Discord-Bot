import { Router, type IRouter } from "express";
import healthRouter from "./health";
import donutRouter from "./donut";

const router: IRouter = Router();

router.get("/", (_req, res) => { res.json({ status: "ok" }); });
router.use(healthRouter);
router.use("/donut", donutRouter);

export default router;
