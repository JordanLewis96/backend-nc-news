const { fetchArticleById } = require("../models/articles.model");
const { addCommentByArticleId, removeCommentById } = require("../models/comments.model");
const { fetchSingleUser } = require('../models/users.model')

function postCommentByArticleId(request, response, next) {
  const articleId = request.params.article_id;
  const comment_username = request.body.username;
  const validArticleId = fetchArticleById(articleId);
  const validUserName = fetchSingleUser(comment_username);
  const comment_body = request.body.body;

  return Promise.all([
    articleId,
    validArticleId,
    validUserName,
    comment_username,
    comment_body,
  ])
    .then(([articleId]) => {
      return addCommentByArticleId(comment_username, comment_body, articleId);
    })
    .then((new_comment) => {
      response.status(201).send({ new_comment });
    })
    .catch((error) => {
      next(error);
    });
}

function deleteCommentById(request, response, next) {
  const commentId = request.params.comment_id;
    return removeCommentById(commentId)
      .then((commentId) => {
        response.status(204).send({msg: `comment ${commentId} deleted`});
      })
      .catch((error) => {
        next(error);
      })
}

module.exports = { postCommentByArticleId, deleteCommentById };
