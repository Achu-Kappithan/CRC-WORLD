const { default: mongoose } = require("mongoose")

const dbconnect = ()=>{
    try {
       const conn = mongoose.connect('mongodb://127.0.0.1:27017/CRC_WORLD')
        console.log("db connnected sucessufully")
    } catch (error) {
        console.log(error+"SOMETHING RONG IN THE DB CONNECTION")
    }
}

module.exports= dbconnect
