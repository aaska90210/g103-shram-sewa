const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// 🔥 YOUR MONGODB URL
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let collection;

// CONNECT DATABASE
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db("sramsewa"); // database name
    collection = db.collection("workers"); // collection name

  } catch (err) {
    console.error("❌ DB Error:", err);
  }
}

connectDB();


// 🔹 GET ALL WORKERS (optional)
app.get("/workers", async (req, res) => {
  const data = await collection.find().toArray();
  res.json(data);
});


// 🔹 GET UNIQUE SKILLS
app.get("/skills", async (req, res) => {
  try {
    const skills = await collection.distinct("skill");
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 GET UNIQUE LOCATIONS
app.get("/locations", async (req, res) => {
  try {
    const locations = await collection.distinct("location");
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 SEARCH API
app.get("/search", async (req, res) => {
  try {
    const { skill, location } = req.query;

    let query = {};

    if (skill) {
      query.skill = { $regex: new RegExp(skill, "i") }; // case-insensitive
    }

    if (location) {
      query.location = { $regex: new RegExp(location, "i") };
    }

    const results = await collection.find(query).toArray();
    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});