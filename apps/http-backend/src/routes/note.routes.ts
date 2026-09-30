import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { createNote, getNotes, getNote, updateNote, deleteNote, getRoomsForNote, addRoomToNote, removeRoomFromNote } from "../controllers/note.controller";

const router: IRouter = Router();

// Routes mounted at /api/v1/workspaces/:workspaceId/notes
router.post("/workspaces/:workspaceId/notes", middleware, createNote);
router.get("/workspaces/:workspaceId/notes", middleware, getNotes);

// Routes mounted at /api/v1/notes/:id
router.get("/notes/:id", middleware, getNote);
router.put("/notes/:id", middleware, updateNote);
router.delete("/notes/:id", middleware, deleteNote);

router.get("/notes/:noteId/rooms", middleware, getRoomsForNote);
router.post("/notes/:noteId/rooms", middleware, addRoomToNote);
router.delete("/notes/:noteId/rooms/:roomId", middleware, removeRoomFromNote);

export default router;
