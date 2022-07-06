// declare function require(path: string): any;
var mysql = require('mysql');
var conn2 = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'blog'
});
conn2.connect();
module.exports = conn2;
