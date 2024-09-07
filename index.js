const express = require("express")
const app = express();
const mongoose = require("mongoose");
const dbconnect = require("./config/db_connect");
const session_config = require("./config/session_config");
const path = require("path")

require("dotenv").config()
app.use(session_config)


const port = 7001;
dbconnect()
const flash = require("connect-flash")

app.use(flash());

// Middleware to make flash messages available to all views
app.use((req, res, next) => {
    res.locals.errorMessage = req.flash('error');
    res.locals.successMessage = req.flash('success');
    next();
});

// user releted
app.use('/assets', express.static(path.join(__dirname, 'public/users/assets')));
const user_router = require("./routers/user_router");
app.use('/',user_router)

// admin related
app.use('/assets', express.static(path.join(__dirname, 'public/admin/assets')));

// app.use( express.static(path.join(__dirname, 'public/admin/assets')));
const admin_route = require("./routers/admin_router");
app.use('/',admin_route);

app.listen(port,()=>console.log(`server is running at http://localhost:${port}/login`))