const { fetchArticleById, updateArticleById, fetchCommentCountByArticleId, fetchArticles, fetchCommentsByArticleId } = require("../models/articles.model");

function getArticleById(request, response, next) {
  const articleId = request.params.article_id;

  fetchArticleById(articleId)
    .then((article) => {
      response.status(200).send({article});
    })
    .catch((error) => {
      next(error)
    })
};

function patchArticleById(request, response, next) {
  const articleId = request.params.article_id;
  const updateArticle = request.body;

  updateArticleById(articleId, updateArticle)
  .then((article) => {
    response.status(200).send({article});
  })
  .catch((error) => {
    next(error);
  })
};

function getArticleCommentCount(request, response, next) {
  const articleId = request.params.article_id;

  fetchCommentCountByArticleId(articleId)
  .then((article) => {
    response.status(200).send({article});
  })
  .catch((error) => {
    next(error);
  })
}

function getArticles(request, response, next) {
  const { query : queryContent } = request;
   fetchArticles(queryContent)
  .then((articles) => {
    response.status(200).send({articles});
  })
  .catch((err) => {
    next(err);
  })
};

function getCommentsByArticleId(request, response, next) {
  const articleId = request.params.article_id;

  fetchCommentsByArticleId(articleId)
  .then((comments) => {
    response.status(200).send({comments})
  })
  .catch((error) => {
    next(error)
  })
}

module.exports = { getArticleById, patchArticleById, getArticleCommentCount, getArticles, getCommentsByArticleId };
