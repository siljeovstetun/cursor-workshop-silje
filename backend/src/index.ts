import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { posts } from "./data/posts";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth middleware: validates Bearer token against API_SECRET env var
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="api"');
    res.status(401).json({ error: "Unauthorized", message: "Missing or malformed Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.API_SECRET;
  if (!secret) {
    console.error("API_SECRET env var is not configured");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  if (token !== secret) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="api", error="invalid_token"');
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    return;
  }

  next();
}

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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// v1.0 versioned routes
const v1 = express.Router();

// Protected endpoint — requires valid Bearer token
v1.get("/protected", requireAuth, (req, res) => {
  res.json({ status: "ok", message: "Access granted" });
});

app.use("/api/v1.0", v1);

app.listen(PORT, () => {
  console.log(`Blog API server running on http://localhost:${PORT}`);
});
