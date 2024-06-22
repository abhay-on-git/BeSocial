const {Schema,model} = require('mongoose');

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username : String,
    email:String,
    password : String,
    confirmPassword :String,
    avatar: {
        type: String,
        default: "https://www.gravatar.com/avatar/",
    },
},{timestamps:true})

userSchema.plugin(passportLocalMongoose)

const userCollection = model('user',userSchema)

module.exports = userCollection;