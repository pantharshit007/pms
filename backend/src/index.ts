import express from "express";
import cookieParser from "cookie-parser";
import { errMiddleware } from "./middleware/err.middleware";
import { env } from "./utils/env";
import { connectDB } from "./lib/db";

const app = express();
app.use(express.json());
app.use(cookieParser());

// app.use("/api/v1", );

app.get("/", (req, res) => {
  res.json({ msg: "Hey mom!" });
});

app.use(errMiddleware);

connectDB();

app.listen(env.PORT, () => {
  console.log(`> Server running on port: ${env.PORT}`);
});
