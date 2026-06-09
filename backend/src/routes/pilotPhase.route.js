import { Router } from "express";
import { submitPilotNotification } from "../controllers/pilotPhase.controller.js";

const pilotPhaseRouter = Router();

pilotPhaseRouter.post("/pilot-notification", submitPilotNotification);

export default pilotPhaseRouter;