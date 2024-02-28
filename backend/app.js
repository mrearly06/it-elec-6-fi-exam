const express = require('express');
const bodyParser = require ('body-parser');
const cors = require('cors');


const app = express();

app.use(cors()); // Use the cors middleware


app.use(bodyParser.json());
app.use (bodyParser.urlencoded({extended: false}));


app.use((req,res, next) =>{
        res.setHeader("Acess-Control-Allow-Origin","*");
        res.setHeader("Access-Control-Allow-Headers","Origin, x-Requested-with, Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        next();

})

app.post("/api/posts", (req,res, next)=> {const posts= req.body;
console.log(post);
res.status(201).json({
    message: 'post added succesfully'
    });
})

app.use('/api/posts' , (req, res, next)=>{
    const posts = [
    {
            id:'1',
            title: 'from server-side post',
            content: 'coming from the server side'
    },
            {
                id:'2',
                title: 'second from server-side post',
                content: 'second coming from server side'
            }
    ];
                res.status(200).json({
                    message: 'Posts fetched succesfully',
                    posts: posts
                });

});

module.exports = app;

