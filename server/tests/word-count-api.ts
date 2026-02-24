import express from "express";

const app = express();
app.use(express.json());

app.post("/count", (req, res) => {
  const { text, word } = req.body;

  if (typeof text !== "string" || typeof word !== "string") {
    return res.status(400).json({ error: "Invalid input. Please provide 'text' and 'word' as strings." });
  }

  if (word.length === 0) {
    return res.json({ count: 0 });
  }

  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedWord, "g");
  const matches = text.match(regex);

  res.json({ count: matches ? matches.length : 0 });
});

export default app;
