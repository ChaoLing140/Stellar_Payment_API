import 'dotenv/config';
import express from "express";
import morgan from "morgan";
import cors from "cors";
import paymentsRouter from "./routes/payments.js";
import merchantsRouter from "./routes/merchants.js";
import { requireApiKeyAuth } from "./lib/auth.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "stellar-payment-api" });
});

app.use("/api/create-payment", requireApiKeyAuth());
app.use("/api", paymentsRouter);
app.use("/api", merchantsRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error"
  });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
