var express = require('express');
var app = express();

var things = require('./things.js');

app.use('/',things);

app.listen(3000,function(){
    console.log("Server is running at http://localhost:3000");
});

