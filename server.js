require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor");
const customerRoutes = require("./routes/customer");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api", customerRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ShadiSetGo backend chal raha hai" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB se connect ho gaya");
    app.listen(PORT, () => console.log(`Server chal raha hai port ${PORT} par`));
  })
  .catch((err) => {
    console.error("MongoDB connect nahi hua:", err.message);
  });
