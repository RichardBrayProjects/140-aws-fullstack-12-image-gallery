import { Router, type Router as RouterType } from "express";
import { getPresignedUrl, getImages } from "../controllers/imageController";
import { attachAuth } from "../middleware/auth";

const router: RouterType = Router();

router.get("/images", getImages);
router.use(attachAuth);
router.post("/images/presigned-url", getPresignedUrl);

export default router;
