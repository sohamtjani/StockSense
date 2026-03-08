import express from "express";
import cors from "cors";
import stockRoutes from "./routes/stockRoutes.js";
import { config } from "./config.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();
app.set("trust proxy", 1);

const allowLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const staticAllowed = new Set([
  config.frontendUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3011",
  "http://127.0.0.1:3011"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (staticAllowed.has(origin) || allowLocalhost.test(origin)) return callback(null, true);
      return callback(new Error("CORS blocked"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(apiLimiter);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.status(400).json({ error: "HTTPS required" });
  }
  return next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "stocksense-api" });
});

app.use("/stocks", stockRoutes);

app.listen(config.port, "127.0.0.1", () => {
  console.log(`StockSense backend running on http://127.0.0.1:${config.port}`);
});
