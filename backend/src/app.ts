import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import { logger } from "./lib/logger.js";
import { connectDB } from "./lib/mongoose.js";

// Route handlers
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import reviewsRouter from "./routes/reviews.js";
import couponsRouter from "./routes/coupons.js";
import settingsRouter from "./routes/settings.js";
import uploadRouter from "./routes/upload.js";
import paymentsRouter from "./routes/payments.js";
import adminRouter from "./routes/admin.js";
import usersRouter from "./routes/users.js";
import notificationsRouter from "./routes/notifications.js";
import healthRouter from "./routes/health.js";

// Connect to MongoDB (non-blocking)
connectDB().catch((err) => logger.warn({ err }, "MongoDB unavailable"));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

app.use(cors({ origin: true, credentials: true }));

// Raw body for Stripe webhook
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api/notifications", notificationsRouter);

// Coupon validation (alias)
app.post("/api/coupons/validate", (req, res) => {
  res.redirect(307, "/api/coupons/validate");
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
