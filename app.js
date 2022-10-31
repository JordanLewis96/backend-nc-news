const express = require("express");
const cors = require("cors");
const app = express();
const { getUsers } = require("./controllers/users.controller");
const {
  getArticleById,
  patchArticleById,
  getArticleCommentCount,
  getArticles,
  getCommentsByArticleId,
} = require("./controllers/articles.controller");
const { getTopics } = require("./controllers/topics.controller");
const {
  postCommentByArticleId,
  deleteCommentById,
} = require("./controllers/comments.controller");

app.use(cors());
app.use(express.json());

//topics
app.get("/api/topics", getTopics);
//articles
app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);
app.get("/api/articles/:article_id", getArticleCommentCount);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
// comments
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.delete("/api/comments/:comment_id", deleteCommentById);
//users
app.get("/api/users", getUsers);

//tests
app.all("/api/*", (request, response, next) => {
  response.status(400).send({ msg: "cannot find id - bad request" });
});

app.use((error, request, response, next) => {
  const { status, msg } = error;
  if (error.status) {
    response.status(error.status).send({ msg });
  } else next(error);
});

app.use((error, request, response, next) => {
  const { status, msg, code } = error;
  if (code === "23503") {
    response.status(400).send({ msg: "invalid username" });
  }

  if (code === "22P02") {
    response.status(400).send({ msg: "invalid id" });
  } else next(error);
});

app.use((error, request, response, next) => {
  response.status(500).send({ msg: "server error" });
});
//hello hello

module.exports = app;
