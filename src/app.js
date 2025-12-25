const express = require('express');
const mysql2 = require('mysql2');
const fileUploader = require('express-fileupload')
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = mysql2.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'do_do'
});

app.use(fileUploader({
    userTempFiles: true,
    preserveExtension: true,
    parseNested: true
}));

app.use(express.static('./assests'))
app.set('view engine','ejs');
app.set('views', './src/views');

module.exports = {app, db};