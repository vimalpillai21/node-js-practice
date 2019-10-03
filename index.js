var express = require('express');
var app = express();

app.get('/',function(req,res){
    res.contentType = "text/html";
    res.send("<h1 align='center'>Hello World</h1>");
});
app.post('/',function(req,res){
    res.send("You just called the post method at '/'!\n");
});



app.listen(3000,function(){
    console.log("Server is running at http://192.168.10.179:3000");
});

