const { default: mongoose } = require("mongoose")

const dbconnect = async ()=>{
    const uri = process.env.DATABASE_CONFIG
    try {
       await  mongoose.connect(uri);
        console.log("db connnected sucessufully")
    } catch (error) {
        console.log(error+"SOMETHING RONG IN THE DB CONNECTION")
    }
}

module.exports= dbconnect
