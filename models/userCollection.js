    const {Schema,model} = require('mongoose');

    const passportLocalMongoose = require('passport-local-mongoose');

    const userSchema = new Schema({
        username : String,
        email:String,
        password : String,
        confirmPassword :String,
        bio:{
            type:String,
            default:"Social Activist & Community Builder",
        },
        location :{
            type:String,
            default:null
        },
        interests : {
            type:String,
            default:null
        },
        website:{
            type:String,
            default:null
        },

        avatar: {
            type: String,
            default: "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg",
        },
        otp:{
            type:Number,
            default:0,
        }
    },{timestamps:true})

    userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })


    const userCollection = model('user',userSchema)

    module.exports = userCollection;