import express from "express";
import cors from "cors";
import { posts } from "./data/posts";

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

// Versioned public endpoint: look up a post by slug or ID
app.get("/v1.0/public/:eventIdOrSlug", (req, res) => {
  const { eventIdOrSlug } = req.params;
  const post = posts.find(
    (p) => p.slug === eventIdOrSlug || p.id === eventIdOrSlug
  );

  if (!post) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json(post);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Blog API server running on http://localhost:${PORT}`);
});
