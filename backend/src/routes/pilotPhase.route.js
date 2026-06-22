import { Router } from "express";
import { 
    submitPilotNotification, 
    getAllPilotUsers, 
    deletePilotUser 
} from "../controllers/pilotPhase.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const pilotPhaseRouter = Router();

// Public route for pilot notification submission
pilotPhaseRouter.post("/pilot-notification", submitPilotNotification);

// Admin routes for pilot user management
pilotPhaseRouter.get("/pilot-users", authAdmin, getAllPilotUsers);
pilotPhaseRouter.delete("/pilot-users/:id", authAdmin, deletePilotUser);

export default pilotPhaseRouter;