import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: true, message: "Backend alive", port: PORT });
});

app.post("/api/runPrompt", async (req, res) => {
  try {
    const { phone, amount, description } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ status: false, message: "Phone and amount required" });
    }

    const response = await fetch(`${process.env.API_BASE_URL}/mpesa/payment/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SECRET_KEY, // ✅ secret key only
      },
      body: JSON.stringify({
        amount,
        phone,
        description: description || "Payment",
      }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      status: false,
      message: "Could not connect to provider",
      error: error.message,
    });
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
