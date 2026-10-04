import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import path from "path";
import { config } from "dotenv";
import { assertHttpConfiguration, getAllowedOrigins, isAllowedOrigin } from "@repo/backend-common/config";

config({ path: path.resolve(__dirname, "../../../.env") });
assertHttpConfiguration();

const app = express();

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !isAllowedOrigin(origin)) {
        res.status(403).json({ message: "Origin not allowed" });
        return;
    }
    next();
});

app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
}));

app.use(express.json());
app.use(router);

app.listen(3001);
