const express = require("express")
const app = express();
const mongoose = require("mongoose");
const dbconnect = require("./config/db_connect");
const dotenv = require("dotenv").config()
const port = 7001;
dbconnect()


app.use(express.static('public'))

const user_router = require("./routers/user_router")
app.use('/',user_router)

app.listen(port,()=>console.log(`server is running at http://localhost:${port}`))