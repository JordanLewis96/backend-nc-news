const db = require('../db/connection');

const fetchUsers = () => {
    return db.query('SELECT * FROM users;').then(({rows}) => {
        return rows;
    });
};

const fetchSingleUser = (username) => {
    return db.query('SELECT username FROM users WHERE username = $1;', [username])
    .then(({ rows }) => {
        return rows;
    });
};

module.exports = { fetchUsers , fetchSingleUser };