var express = require('express')
const app = express()
const port = 3000

// First middleware before response is sent
app.use(function(req,res,next){
    console.log("Start");
    next();
});

// Router handler
app.get('/',function(req,res,next){
    res.send("Middle");
    next();
});

app.use("/",function(req,res,next){
    console.log("End");
});

app.listen(port, () => console.log(`Example app listening on port port!`))