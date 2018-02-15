const express = require('express');
const session = require('express-session');
const { secret }= require('./config');
const strategy= require('./strategy');
const passport= require('passport');
const request= require('request');

const app = express();
const port = 3000;

app.use( session({
  secret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(strategy);

passport.serializeUser((user, done)=> {
  done(null, user);
});

passport.deserializeUser((obj, done)=> {
  done(null, obj);
});

//ENDPOINT
app.get('/login', passport.authenticate('auth0', { 
  successRedirect: '/followers', 
  failureRedirect: '/login', 
  failureFlash: true, 
  connection: 'github' 
  })
);

// app.get('/followers',(req, res, next)=> {
//   if(req.user){
//     // res.json(req.user._json.followers_url);
//     res.json(req.user)
//   }else{
//     res.redirect('/login');
//   }
// });

app.get('/followers', (req, res, next)=> {
  if(req.user){
    const FollowersRequest= {
      url: req.user._json.followers_url,
      headers: {
        'User-Agent': req.user._json.clientID
      }
    };
    request(FollowersRequest, (error, response, body)=> {
      res.status(200).send(body);
    });
  } else{
    res.redirect('/login');
  }
});


app.listen( port, () => { console.log(`WE LIVE BABY! on port ${port}`); } );