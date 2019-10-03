var bodyParser = require("body-parser")
var cookieParser = require('cookie-parser')
var express = require('express')
var app = express();

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json())
app.use(cookieParser);

