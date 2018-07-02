var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt
var jwt = require('jsonwebtoken');

var config = require('./config');
// make passport use the static authentication fn of passport-local-mongoose
exports.local = passport.use(new LocalStrategy(User.authenticate()));
// make passport use the static  of serializeUser and deserializeUser passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user, config.secretKey,
    {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
(jwt_paylord, done) =>{
    console.log("JWT payload: ", jwt_paylord);
    User.findOne({_id: jwt_paylord._id}, (err,user) =>{
        if(err){
            return done(err, false);
        }
        else if(user){
            return done(null,user);
        }else{
            return done(null,false);
        }
    })
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = function(req, res, next){
    if(req.user.admin)
    {
        next();
        return;
    }else{
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}