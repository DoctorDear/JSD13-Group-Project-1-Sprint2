import { Router } from "express";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  getPersonalizationTemplates,
  getPersonalizationTemplateByGroupId,
  createPersonalizationTemplate,
  updatePersonalizationTemplate,
} from "../../controllers/personalizationTemplate.controller.js";

export const router = Router();

router.get("/:groupId", getPersonalizationTemplateByGroupId);
router.get("/", verifyToken, requireAdmin, getPersonalizationTemplates);
router.post("/", verifyToken, requireAdmin, createPersonalizationTemplate);
router.patch("/", verifyToken, requireAdmin, updatePersonalizationTemplate);

export default router;
