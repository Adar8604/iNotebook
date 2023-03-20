
const mongoose=require('mongoose');
const mongooseURI="mongodb://localhost:27017/inotebook?readPreference=primary&directConnection=true&tls=false";

const connectToMongo = ()=>{
    mongoose.connect(mongooseURI,()=>{
        console.log("Connected");
    })
}

module.exports=connectToMongo;