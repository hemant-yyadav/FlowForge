import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { 
    createTag, 
    getTags, 
    deleteTag, 
    assignTagToNote, 
    removeTagFromNote, 
    getNotesByTag 
} from "../controllers/tag.controller";

const router: IRouter = Router();

router.use(middleware);

router.post("/workspaces/:workspaceId/tags", createTag);
router.get("/workspaces/:workspaceId/tags", getTags);
router.delete("/tags/:tagId", deleteTag);
router.post("/notes/:noteId/tags", assignTagToNote);
router.delete("/notes/:noteId/tags/:tagId", removeTagFromNote);
router.get("/tags/:tagId/notes", getNotesByTag);

export default router;
