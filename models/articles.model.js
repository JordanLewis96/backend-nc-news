const db = require("../db/connection");
const articles = require("../db/data/test-data/articles");
const comments = require("../db/data/test-data/comments");

const fetchArticleById = (articleId) => {
    return db.query(`SELECT articles.*, (COUNT(comments.article_id) :: INTEGER) AS comment_count
    FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1 GROUP BY articles.article_id;`, [articleId])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'id not found - does not exist'});
        }
        return rows[0];
    })
}

const updateArticleById = (articleId, updateArticle) => {
    const { inc_votes : newVote } = updateArticle;
    return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`, [newVote, articleId]).then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'id not found - does not exist'});
        }
        return rows[0];
    })
}

const fetchCommentCountByArticleId = (articleId) => {
    return db.query(`SELECT articles.*, (COUNT(comments.article_id) :: INTEGER) AS comment_count 
    FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id 
    WHERE articles.article_id = $1 GROUP BY articles.article_id;`, [articleId])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'id not found - does not exist'})
        }
        return rows[0];
    })
}

const fetchArticles = (queryContent) => {
    let sqlString = '';
const queryValues = [];

const {sort_by, order, topic} = queryContent;
 
const default_sort_by = 'created_at';
const default_order = 'DESC';
const default_topic = ``;
const queryPart1 = `SELECT articles.*, ( COUNT(comments.article_id) :: INTEGER) AS comment_count 
                                        FROM articles 
                                        LEFT JOIN comments ON comments.article_id =articles.article_id `;
let queryPart2 = ``;
const queryPart3 = `GROUP BY articles.article_id `;
let queryPart4 = `ORDER BY articles.`;
let sortBy = default_sort_by;
let orderBy = default_order;
let filterBy = default_topic;

const sort_by_greenList = [ 'article_id', 
                            'title', 
                            'topic', 
                            'author', 
                            'body', 
                            'created_at', 
                            'votes', 
                            'comment_count'];

const key_greenList = ['sort_by', 'order', 'topic'];
const order_greenList = ['desc', 'DESC', 'asc', 'ASC'];
const keys = Object.keys(queryContent);
let invalidKey = false;
    if (keys.length > 0){
        if(keys.length > 3) {
            return Promise.reject({ status: 400, msg: 'Too many query keys' });
        }
        keys.forEach( (key,i) => {if (!key_greenList.includes(key)) invalidKey = true; });
        if(invalidKey){
            return Promise.reject({ status: 400, msg: 'Attempt to query on Invalid key' });
        }
        if (!sort_by_greenList.includes(sort_by) && sort_by !== undefined) {
            return Promise.reject({ status: 400, msg: 'Invalid sort query' });
        }
        if (!order_greenList.includes(order) && order != undefined) {
            return Promise.reject({ status: 400, msg: 'Invalid order query' });
        }
        if (topic === undefined) {
            queryPart2 = ``;
            filterBy = default_topic;
        }
        else {
            queryValues.push(topic);
            queryPart2 += ` WHERE articles.topic = $1`;
            filterBy = topic;
        }

        if (sort_by === undefined)
            sortBy = default_sort_by;
        else
            sortBy = sort_by;

        if(order === undefined)
            orderBy = default_order;
        else
            orderBy = order;
    }else {
      sortBy = default_sort_by;
      orderBy = default_order;
    }

    queryPart4 = `ORDER BY articles.${sortBy} ${orderBy};`;
    sqlString = queryPart1 + queryPart2 + queryPart3 + queryPart4;

    return db
        .query( sqlString, queryValues)
        .then (({rows}) => {
            if (rows.length === 0) {
                return Promise.reject({status: 404, msg: 'No results found for that query'});
            }
            return rows;
        })

}

const fetchCommentsByArticleId = (articleId) => {
    return db.query(`SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body, users.name AS author FROM comments LEFT JOIN users ON users.username = comments.author 
                     WHERE comments.article_id = $1;`, [articleId])
                     .then(({ rows }) => {
                        if (rows.length === 0) {
                            return Promise.reject({ status: 404, msg: 'id not found - does not exist'})
                        }
                        return rows;
                     })
}

module.exports = { fetchArticleById, updateArticleById, fetchCommentCountByArticleId, fetchArticles, fetchCommentsByArticleId };