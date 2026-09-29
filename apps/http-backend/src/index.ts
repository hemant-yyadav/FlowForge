import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
}));

app.use(express.json());
app.use(router);

app.listen(3001);