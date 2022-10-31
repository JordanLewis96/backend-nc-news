const db = require('../db/connection')

const addCommentByArticleId = (comment_username, comment_body, articleId) => {
    return db.query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3)
        RETURNING *;`, [comment_username, comment_body, articleId])
        .then (({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({status:404, msg: 'id not found - does not exist'})
            }
            return rows[0]
        })
}

const removeCommentById = (commentId) => {
      return db
      .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING body AS deleted_entry;`,[commentId])
      .then (({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'comment does not exist'});
        }
        return rows[0];
    })
}

module.exports = { addCommentByArticleId, removeCommentById }