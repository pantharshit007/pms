import express from "express";
import cookieParser from "cookie-parser";
import { errMiddleware } from "./middleware/err.middleware";
import { env } from "./utils/env";
import { connectDB } from "./lib/db";
import { rootRouter } from "./routes/root.route";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", rootRouter);

app.get("/", (req, res) => {
  res.json({ msg: "Hey mom!" });
});

app.get("/ping", (req, res) => {
  res.json({ msg: "pong" });
});

app.use(errMiddleware);

connectDB();

app.listen(env.PORT, () => {
  console.log(`> Server running on port: ${env.PORT}`);
});
