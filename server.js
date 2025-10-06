// GoalChain_17 - server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// ensure uploads folder exists
fs.mkdirSync(path.join(__dirname, "public", "uploads"), { recursive: true });

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// seeded data (so site looks active immediately)
let campaigns = [
  { id: 1, title: "Clean Water Access", goal: 12000, description: "Solar boreholes & water filters for rural clinics." },
  { id: 2, title: "SheCode Tech Training", goal: 6000, description: "Bootcamps for young women in coding." },
  { id: 3, title: "Green Energy Schools", goal: 9000, description: "Solar kits & energy education for schools." }
];

let partners = [
  { id: 1, org: "SolarForAll", type: "NGO", country: "Kenya", contact: "info@solarforall.org" },
  { id: 2, org: "WaterAid Global", type: "Non-Profit", country: "Uganda", contact: "connect@wateraidglobal.org" },
  { id: 3, org: "WomenInTech Alliance", type: "NGO", country: "Ghana", contact: "hello@womenintech.africa" }
];

let sharedData = []; // uploaded reports metadata
let resources = []; // shared resources/skills

// multer config: uploads go to public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "public", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ===== Routes =====

// Serve main page (static)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// Campaigns
app.get("/api/campaigns", (req, res) => res.json(campaigns));
app.post("/api/campaigns", (req, res) => {
  const { title, goal, description } = req.body;
  const id = campaigns.length ? campaigns[campaigns.length-1].id + 1 : 1;
  const item = { id, title, goal: Number(goal||0), description };
  campaigns.push(item);
  console.log("Campaign created:", item);
  res.json({ message: "Campaign created!", campaigns });
});

// Partners
app.get("/api/partners", (req, res) => res.json(partners));
app.post("/api/partners", (req, res) => {
  const { org, type, country, contact } = req.body;
  const id = partners.length ? partners[partners.length-1].id + 1 : 1;
  const item = { id, org, type, country, contact };
  partners.push(item);
  console.log("Partner registered:", item);
  res.json({ message: "Partner registered!", partners });
});

// Data uploads
app.post("/api/data", upload.single("report"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
  const entry = { id: sharedData.length+1, filename: req.file.filename, original: req.file.originalname, uploadedAt: new Date().toISOString() };
  sharedData.push(entry);
  console.log("Report uploaded:", entry);
  res.json({ message: "Report uploaded!", file: entry });
});
app.get("/api/data", (req, res) => res.json(sharedData));

// Resources
app.get("/api/resources", (req, res) => res.json(resources));
app.post("/api/resources", (req, res) => {
  const { name, contact } = req.body;
  const item = { id: resources.length+1, name, contact };
  resources.push(item);
  console.log("Resource shared:", item);
  res.json({ message: "Resource shared!", resources });
});

// Analytics (simple AI-like score)
app.get("/api/analytics", (req, res) => {
  const totalGoalUSD = campaigns.reduce((s,c)=>s + (Number(c.goal)||0), 0);
  const impactScore = Math.round((partners.length * 2) + campaigns.length + sharedData.length*0.5 + resources.length*0.5);
  res.json({
    totalCampaigns: campaigns.length,
    totalPartners: partners.length,
    totalReports: sharedData.length,
    totalResources: resources.length,
    totalGoalUSD,
    impactScore
  });
});

// Admin check (local demo)
const ADMIN_PASSWORD = "Millie39336157";
app.post("/api/admin", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ message: "Admin access granted" });
  return res.status(401).json({ message: "Access denied" });
});

// Start
app.listen(PORT, () => console.log(`🚀 GoalChain_17 running on http://localhost:${PORT}`));
