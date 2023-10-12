const express=require("express");
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const PORT=process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true})
const db=mongoose.connection;
db.on('error',(err)=> console.log(e));
db.once('open',()=> console.log("connected to database!"))


//middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({
    secret:'my sec',
    resave: false, 
    saveUninitialized : true
})
);
app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next();
})

app.use(express.static('uploads'));
//set template engine 
app.set('view engine',"ejs");


//router prefix
app.use("",require("./routes/routes"));
// app.get('/',(req,res)=>{
//     res.send('hello world');
// })

app.listen(PORT,()=>{
    console.log(`listening on port  at http://localhost:${PORT}`);
})