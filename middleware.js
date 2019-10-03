var express = require('express');
var app = express();

// Simple request time logger
app.use(function(req,res,next){
    console.log("A new request received at " + Date.now());
    next();
});

app.get('/',function(req,res){
    res.send("<h1 align='center'>Hello World</h1>");
});

app.listen(3000);