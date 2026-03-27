import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { posts } from "./data/posts";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

app.use(cors());
app.use(express.json());

function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.set("WWW-Authenticate", 'Bearer realm="api"');
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as Request & { user: unknown }).user = payload;
    next();
  } catch {
    res.set("WWW-Authenticate", 'Bearer realm="api", error="invalid_token"');
    res.status(401).json({ error: "Invalid or expired token" });
  }
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

// Protected endpoint - requires a valid JWT
app.get("/api/v1.0/protected", verifyToken, (req, res) => {
  res.json({ message: "Access granted", user: (req as Request & { user: unknown }).user });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Blog API server running on http://localhost:${PORT}`);
});
