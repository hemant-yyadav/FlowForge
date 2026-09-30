import { Router, IRouter } from "express";
import { middleware } from "../middleware";
import { getFavorites, toggleNoteFavorite, toggleRoomFavorite } from "../controllers/favorite.controller";

const router: IRouter = Router();

router.use(middleware);

router.get("/favorites", getFavorites);
router.post("/favorites/notes/:noteId", toggleNoteFavorite);
router.post("/favorites/rooms/:roomId", toggleRoomFavorite);

export default router;
