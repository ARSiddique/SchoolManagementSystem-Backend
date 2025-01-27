const dotenv = require("dotenv");
dotenv.config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()
const path = require("path");
const Routes = require("./routes/route.js")

const PORT = process.env.PORT
// Middleware for parsing incoming JSON data and form data
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// Serve static files (like uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// Routes
app.use("/", Routes);

// Server
app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
