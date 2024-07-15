const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Configure session middleware
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Set up your user serialization/deserialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure the Google strategy for use by Passport
passport.use(new GoogleStrategy({
    clientID: '81359009908-epbbmet2l9fcdos9r8cj6bosu01ue0ts.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (token, tokenSecret, profile, done) => {
    // Use the profile information (mainly profile id) to check if the user is registered in your db
    // For simplicity, we will just return the profile object
    return done(null, profile);
  }
));

// Define routes
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

// Route to trigger authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route for Google callback
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/profile');
  }
);

// Route to handle the profile page
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`Hello, ${req.user.displayName}`);
});

// Route to handle logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});