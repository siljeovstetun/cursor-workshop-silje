import express from "express";
import cors from "cors";
import { posts } from "./data/posts";
import { tenders, tenderRuns, TenderRun } from "./data/tenders";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all posts
app.get("/api/posts", (req, res) => {
  const { tag, limit } = req.query;

  let filteredPosts = [...posts];

  if (tag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags.some((t) => t.toLowerCase() === (tag as string).toLowerCase())
    );
  }

  if (limit) {
    filteredPosts = filteredPosts.slice(0, parseInt(limit as string));
  }

  // Return posts without full content
  const postsWithoutContent = filteredPosts.map(({ content, ...post }) => post);

  res.json(postsWithoutContent);
});

// Get single post by slug
app.get("/api/posts/:slug", (req, res) => {
  const post = posts.find((p) => p.slug === req.params.slug);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
});

// Get all tags
app.get("/api/tags", (req, res) => {
  const allTags = posts.flatMap((post) => post.tags);
  const uniqueTags = [...new Set(allTags)].sort();

  res.json(uniqueTags);
});

// Get all tenders
app.get("/api/v1.0/tenders", (req, res) => {
  res.json(tenders);
});

// Get single tender by ID
app.get("/api/v1.0/tenders/:tenderId", (req, res) => {
  const tender = tenders.find((t) => t.id === req.params.tenderId);

  if (!tender) {
    return res.status(404).json({ error: "Tender not found" });
  }

  res.json(tender);
});

// Trigger a tender run
app.post("/api/v1.0/tenders/:tenderId/runs", (req, res) => {
  const tender = tenders.find((t) => t.id === req.params.tenderId);

  if (!tender) {
    return res.status(404).json({ error: "Tender not found" });
  }

  const run: TenderRun = {
    id: `run-${Date.now()}`,
    tenderId: tender.id,
    startedAt: new Date().toISOString(),
    status: "running",
  };

  tenderRuns.push(run);
  res.status(201).json(run);
});

// Get runs for a tender
app.get("/api/v1.0/tenders/:tenderId/runs", (req, res) => {
  const runs = tenderRuns.filter((r) => r.tenderId === req.params.tenderId);
  res.json(runs);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Blog API server running on http://localhost:${PORT}`);
});
