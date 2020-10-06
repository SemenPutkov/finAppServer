const GoogleStrategy = require('passport-google-oauth20').Strategy
const passport = require('passport')
const config = require('config')

const GOOGLE_CLIENT_ID = config.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = config.get('GOOGLE_CLIENT_SECRET')
const callbackURL =  process.env.NODE_ENV === 'production'? config.get('callbackURI') : 'http://localhost:3000/login/with-google'

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user)
    })
  }
))

module.exports = passport