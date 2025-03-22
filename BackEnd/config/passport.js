const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs'); // Changé de 'bcrypt' à 'bcryptjs'
const User = require('../models/User');

// Configuration de la stratégie locale (utilisateur/mot de passe)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Rechercher l'utilisateur par email
      const user = await User.findOne({ email });
      
      if (!user) {
        return done(null, false, { message: 'Email ou mot de passe incorrect' });
      }
      
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Email ou mot de passe incorrect' });
      }
      
      // Succès - retourner l'utilisateur sans le mot de passe
      const userObject = user.toObject();
      delete userObject.password;
      
      return done(null, userObject);
    } catch (error) {
      return done(error);
    }
  }
));

// Configuration de la stratégie JWT pour l'authentification par token
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'votre_clé_secrète_jwt'
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    // Vérifier si l'utilisateur existe toujours dans la base de données
    const user = await User.findById(jwtPayload.id, { password: 0 });
    
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

// Sérialisation et désérialisation pour les sessions
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id, { password: 0 });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
