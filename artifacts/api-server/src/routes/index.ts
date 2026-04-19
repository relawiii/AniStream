import { Router, type IRouter } from "express";
import healthRouter from "./health";
import followsRouter from "./follows";
import scheduleCacheRouter from "./schedule-cache";
import notificationPrefsRouter from "./notification-prefs";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/follows", followsRouter);
router.use("/schedule/cache", scheduleCacheRouter);
router.use("/notification-prefs", notificationPrefsRouter);

export default router;
