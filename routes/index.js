//Requires
var express = require('express');
var cookieParser = require('cookie-parser');
var cookieSign = require('cookie-signature');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//instantiate the router
var router = express.Router();

//initialize database
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');

//Get db models
var User = require('../models/user');
var Chat = require('../models/chat');
var Review = require('../models/reviews');
var currentUser = null;

/* LOGOUT PAGE - DELETES THE COOKIE */
router.get('/logout', function(req, res, next) {
    res.clearCookie('tutorMeData');
    res.redirect('/homepage');
});

/* Inserts new basic user to the database - used by admin page */
router.post('/usernameTest', function(req, res, next){
  User.findOne({username: req.body.uname}, function(err, user) {
    if (!user) {//Username not taken
      var input_user = new User({name: req.body.realname, username: req.body.uname, password: req.body.pword});

      input_user.save(function(err, funct) {
        if(!err){
            console.dir("New User Saved.");
        } else {
            console.dir("Failed to save user: ");
            console.dir(err);
        }

      });
    }
      res.redirect('/admin/users');
  });
});

/* Login Authentication - logic for signing user in */
router.post('/LoginAuthentication', function(req, res, next){
  var log_username = req.body.username;
  var log_password = req.body.password;

  //Find user in user database
  User.findOne({username: log_username}, function(err, user) {
    //Password matches and go through
    if (user == null){ //user not found
      console.dir('user not found')
      res.redirect('/homepage');
    } else {
      //Password matches and go through
      if (user.password == log_password) {
        console.dir("User found and password matches.");
        //SAVE THE COOKIE
        var secret = 'tutorMeSecretString';
        var val = cookieSign.sign(user.username, secret);
        res.clearCookie('tutorMeData');
        res.cookie('tutorMeData' , val, {maxAge : 3600000}); //Cookie will delete himself within 1 hour.

        res.redirect('/homepage');
      } else {
        res.redirect('/');
      }
    }

  });

});

/* Facebook login - logic for signing in user through facebook */
router.post('/facebookLog', function(req, res, next){

  var log_username = req.body.username;

  var secret = 'tutorMeSecretString';
  var val = cookieSign.sign(log_username, secret);
  res.clearCookie('tutorMeData');
  res.cookie('tutorMeData' , val, {expire : new Date() + 9999});

  res.redirect('/homepage');

});

/* Facebook login - logic for signing up user through facebook */
router.post('/facebookSignUp',function (req, res, next){


  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  var email = req.body.email;
  var profile = req.body.profilePicture;

  console.log(username,password, name, email, profile) ;

  User.findOne({username: username}, function (err, user) {

    if (!user)
    {//Username not taken
      var input_user = new User({name:username, email:email, username: username, password: password, picture: profile});
      console.log("This is the input_user:");
      console.log(input_user);
      input_user.save(function(err, funct) {
          if(!err){
              console.dir("New User Saved.");
          } else {
              console.dir("Failed to save user: ");
              console.dir(err);
          }
      });
    }

  });

  res.redirect('/fbsignup&username=' + username);
});

/*code resposible for redirecting the user to the next step in the sign up using facebook*/
router.get('/fbsignup&username=*', function (req, res, next){

  var username = decodeURIComponent(req.url.substring(19));
  console.log(username);

  res.render('fbsignup.html', {username: username});

});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/homepage');
});

/* GET admin page.
    result -> boolean responsible for granting access to the admin page
    info -> sensitive DB information to be displayed on the admin page
*/
router.get('/admin', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('admin.html', {result: false, info: null});
    }
    else
    {
        var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
        if(result)
        {
            User.findOne({username: result}, function(err, user) {

              if (user)
              {
                  if(user.admin)
                  {
                      res.render('admin.html', {result: true, info: null});
                  }
                  else
                  {
                      res.render('admin.html', {result: false, info: null});
                  }

              }
              else
              {
                  res.render('admin.html', {result: false, info: null});
              }
            });
        }
        else
        {
            res.render('admin.html', {result: false, info: null});
        }
    }
});
/* GET admin page.
    result -> boolean responsible for granting access to the admin page
    info -> sensitive DB information to be displayed on the admin page
*/
router.get('/admin/users', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('admin.html', {result: false, info: null});
    }
    else
    {

        var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
        if(result)
        {
            User.findOne({username: result}, function(err, user) {

              if (user)
              {
                  if(user.admin)
                  {
                      User.find({}, function(err, db_data) {
                          if (err) return console.error(err);
                          res.render('admin.html', {result: true, info: db_data});
                      });
                  }
                  else
                  {
                      res.render('admin.html', {result: false, info: null});
                  }

              }
              else
              {
                  res.render('admin.html', {result: false, info: null});
              }
            });
        }
        else
        {
            res.render('admin.html', {result: false, info: null});
        }
    }
});
/* GET admin page.
    result -> boolean responsible for granting access to the admin page
    info -> sensitive DB information to be displayed on the admin page
*/
router.get('/admin/chat', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('admin.html', {result: false, info: null});
    }
    else
    {

        var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
        if(result)
        {
            User.findOne({username: result}, function(err, user) {

              if (user)
              {
                  if(user.admin)
                  {
                      Chat.find({}, function(err, db_data) {
                          if (err) return console.error(err);
                          res.render('admin.html', {result: true, info: db_data});
                      });
                  }
                  else
                  {
                      res.render('admin.html', {result: false, info: null});
                  }

              }
              else
              {
                  res.render('admin.html', {result: false, info: null});
              }
            });
        }
        else
        {
            res.render('admin.html', {result: false, info: null});
        }
    }
});
/*DELETE USER FROM DB - verifies if is admin first*/
router.get('/admin/delete&username=*', function(req, res, next) {
    if(req.url <= 23)
    {
        res.redirect('/admin/users');
    }
    else
    {
        var secret = 'tutorMeSecretString';
        if(!req.cookies.tutorMeData)
        {
            res.render('admin.html', {result: false, info: null});
        }
        else
        {
            var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
            if(result)
            {
                User.findOne({username: result}, function(err, user) {

                  if (user)
                  {
                      if(user.admin)
                      {
                          var userToDelete = req.url.substring(23);
                          User.remove({ username: userToDelete }, function(err) {
                            res.redirect('/admin/users');
                          });
                      }
                      else
                      {
                          res.render('admin.html', {result: false, info: null});
                      }

                  }
                  else
                  {
                      res.render('admin.html', {result: false, info: null});
                  }
                });
            }
            else
            {
                res.render('admin.html', {result: false, info: null});
            }
        }
    }
});
/*DELETE CHATROOM FROM DB - verifies if it is admin first*/
router.get('/admin/delete&roomname=*', function(req, res, next) {
    console.log("Right where I should be");
    if(req.url <= 23)
    {
        res.redirect('/admin/chat');
    }
    else
    {
        var secret = 'tutorMeSecretString';
        if(!req.cookies.tutorMeData)
        {
            res.render('admin.html', {result: false, info: null});
        }
        else
        {
            var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
            if(result)
            {
                User.findOne({username: result}, function(err, user) {

                  if (user)
                  {
                      if(user.admin)
                      {
                          try
                          {
                                var chatToDelete = parseInt(req.url.substring(23));
                                Chat.remove({ roomName: chatToDelete }, function(err) {
                                  res.redirect('/admin/chat');
                                });
                          } catch (e)
                          {
                              res.redirect('/admin/chat');
                          }
                      }
                      else
                      {
                          res.render('admin.html', {result: false, info: null});
                      }

                  }
                  else
                  {
                      res.render('admin.html', {result: false, info: null});
                  }
                });
            }
            else
            {
                res.render('admin.html', {result: false, info: null});
            }
        }
    }
});

/* GET review page. */
router.get('/reviewuser=*', function(req, res, next) {
    if(req.url.length <= 12)
    {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("not found");
        res.end();
    }
    Review.find({reviewee: decodeURIComponent(req.url.substring(12))}, function(err, user) {
        if (err) return console.error(err);
        console.dir("Retrived file from db.");
        if(user[0])
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(JSON.stringify(user));
        }
        else
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write("not found");
        }
        res.end();
    });
});

/* GET signup page. */
router.get('/signup', function(req, res, next) {
    res.render('signup.html', {});
});

//POST for edit profile
router.post('/editingProfile', function(req, res, next){
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('admin.html', {result: false, info: null});
    }
    var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
    if(result)
    {

  if (req.body.name != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{name:req.body.name}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.number != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{phone:req.body.number}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.email != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{email:req.body.email}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.rate != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{rate:req.body.rate}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.occupation != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{occupation:req.body.occupation}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.education != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{education:req.body.education}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.experience != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{experience:req.body.experience}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.about != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{about:req.body.about}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.city != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{city:req.body.city}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.country != '') {
    console.dir("in if");
    User.update({username:result}, {$set:{country:req.body.country}}, function(err, result) {
      console.dir("update");
    });
  }

  var subject_update = []
if (req.body.none == undefined){
  if (req.body.math != undefined) {
    subject_update.push(req.body.math);
  }

  if (req.body.biology != undefined) {
    subject_update.push(req.body.biology);
  }

  if (req.body.chemistry != undefined) {
    subject_update.push(req.body.chemistry);
  }

  if (req.body.physics != undefined) {
    subject_update.push(req.body.physics);
  }

  if (req.body.geography != undefined) {
    subject_update.push(req.body.geography);
  }

  if (req.body.english != undefined) {
    subject_update.push(req.body.english);
  }

  if (req.body.hist != undefined) {
    subject_update.push(req.body.hist);
  }
}

  if (subject_update.length > 0) {
    User.update({username:result}, {$set:{subjects:subject_update, tutor: true}}, function(err, result) {
      console.dir("update");
    });
  }

  if (req.body.none != undefined) {
    User.update({username:result}, {$set:{subjects:[], tutor :false}}, function(err, result) {
      console.dir("update");
    });
  }

  res.redirect("/profile&username=" + result);
  }
});

/* GET edit profile page. */
router.get('/editProfile', function(req, res, next) {
  var secret = 'tutorMeSecretString';
  var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
    if(result)
    {
      User.findOne({username: result}, function(err, user) {
        res.render('editprofile.html', {userinfo: user});
      });
    }
});

/* GET user homepage page. */
router.get('/homepage', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('homepage_inital.html', {});
    }
    var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
    if(result)
    {
        res.render('homepage_user.html', {current: result});
    }
    else
    {
        res.render('homepage_inital.html', {});
    }
});




/* GET links page. */
router.get('/links', function(req, res, next) {
    res.render('links.html', {});
});

/* Alternate path for message */
router.get('/inbox', function(req, res, next) {
    res.redirect('/message');
});
/* GET message page. - all users recently messaged by the current user
    userNameReceived -> current user
    allTalks -> users recently messaged, with the last message sent in this chat
*/
router.get('/message', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('homepage_inital.html', {});
    }
    else
    {
        var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
        if(result)
        {
            User.findOne({username: result}, function(err, user) {
                if (err) return console.error(err);
                if(user)
                {
                    var chats = user.chats;
                    var allTalks = {};
                    var listOfTalks = [];

                    if(chats.length == 0)
                    {
                        res.render('inbox.html', {userNameReceived: result, allTalks: null});
                    }

                    for(var i = 0; i < chats.length; i++)
                    {
                        var found = 0;
                        var userTalkingTo = chats[i].user;
                        Chat.findOne({roomName: chats[i].room}, function(err, chatFound) {
                            found++;
                            if(chatFound)
                            {
                                var lastMsg = "";
                                if(chatFound.messages.length != 0)
                                {
                                    lastMsg = chatFound.messages[chatFound.messages.length - 1].msg;
                                }
                                var read = 0; //FUTURE IMPLEMENTATION - THIS WOULD JUST MAKE THE COLOR VARY TO READ OR UNREAD MESSAGES
                                var talk = {name: userTalkingTo, message: lastMsg, read: read};
                                listOfTalks.push(talk);
                            }
                            if(found == chats.length)
                            {
                                allTalks.results = listOfTalks;
                                res.render('inbox.html', {userNameReceived: result, allTalks: JSON.stringify(allTalks)});
                            }
                        });
                    }
                }
                else
                {
                    res.writeHead(404, {"Content-Type": "text/html"});
                    res.write("not found");
                    res.end();
                }
            });
        }
        else
        {
            res.render('homepage_inital.html', {});
        }
    }
});

/*Get message page from the logged user and the user required. Creates a
  chat between them if no chat between them is found.
  logged -> user that is logged
  received -> user on the other end, to receive the messages.
  */
router.get('/message&username=*', function(req, res, next) {

    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('homepage_inital.html', {});
    }
    else
    {
        var uname_logged = cookieSign.unsign(req.cookies.tutorMeData, secret);
        if(uname_logged)
        {
            if(req.url.length <= 18)
            {
                res.writeHead(404, {"Content-Type": "text/html"});
                res.write("not found");
                res.end();
            }
            else
            {
                var uname = req.url.substring(18);
                User.findOne({username: uname}, function(err, user) {
                    if (err) return console.error(err);
                    if(user)
                    {
                        res.render('message.html', {logged: uname_logged, receiver: uname});
                    }
                    else
                    {
                        res.writeHead(404, {"Content-Type": "text/html"});
                        res.write("not found");
                        res.end();
                    }
                });
            }
        }
        else
        {
            res.redirect('/');
        }
    }

});

/* POST store review data. */
router.post('/addReview', function(req, res, next){
  console.dir(req.body.tutName);
  console.dir(req.body.comment);
  var secret = 'tutorMeSecretString';
  if(!req.cookies.tutorMeData)
    {
        res.redirect('/');
    }
  var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
  console.dir(result);
  if(result)
    {

  var rating_var = 0;

  if (req.body.star1 != undefined){
    console.dir(req.body.star1);
    rating_var = 1;
  };

    if (req.body.star2 != undefined){
    console.dir(req.body.star2);
    rating_var = 2;
  };
    if (req.body.star3 != undefined){
    console.dir(req.body.star3);
    rating_var = 3;
  };
    if (req.body.star4 != undefined){
    console.dir(req.body.star4);
    rating_var = 4;
  };
    if (req.body.star5 != undefined){
    console.dir(req.body.star5);
    rating_var = 5;
  };

  var pic = "";
  User.findOne({username: result}, function(err, user) {
    if (err) return console.error(err);
    pic = user["picture"];
    var comment = new Review({reviewee: req.body.tutName, reviewer: result,
      rating: rating_var, commented: req.body.comment, picture: pic});

    comment.save(function(err, funct) {
      if(!err){
        console.dir("New comment.");

        User.update({username:req.body.tutName}, {$inc:{sum_rating: rating_var}}, function(err, up) {
        });

        User.update({username:req.body.tutName}, {$inc:{rating_count: 1}}, function(err, up) {
        });

        res.redirect("/profile&username=" + req.body.tutName);
      } else {
        console.dir("Failed to save comment ");
        console.dir(err);
      }
    });
  });
  }
});

/* POST edit store review data. */
router.post('/likeReview=*', function(req, res, next){
  var username = req.url.substring(12);
    Review.findOne({reviewer: username}, function(err, review) {
        var likelist = review["likelist"];
        res.writeHead(200, {"Content-Type": "text/html"});
        if (likelist.indexOf(username)<0){
          likelist.push(username);
          review["likelist"] = likelist;
          review["likes"] += 1;
          review.save(function(err, funct) {
            if(!err){
                console.dir("Review Updated.");
            } else {
                console.dir("Failed to update Review");
                console.dir(err);
            }
          });
        }
      res.write(review["likes"].toString());
      res.end();
    });
});

/* POST edit store review data. */
router.post('/dislikeReview=*', function(req, res, next){
  var username = req.url.substring(15);
    Review.findOne({reviewer: username}, function(err, review) {
        var likelist = review["likelist"];
        res.writeHead(200, {"Content-Type": "text/html"});
        if (likelist.indexOf(username)>=0){
          likelist.splice(likelist.indexOf(username), 1);
          review["likelist"] = likelist;
          review["likes"] -= 1;
          review.save(function(err, funct) {
            if(!err){
                console.dir("Review Updated.");
            } else {
                console.dir("Failed to update Review");
                console.dir(err);
            }
          });
        }
      res.write(review["likes"].toString());
      res.end();
    });
});

/* GET review page. */
router.get('/review', function(req, res, next) {
    res.render('review.html', {});
});

/* POST search page */
var searchedTerm = null;
var resultUsername = null;
var resultNames = null;
var resultPrice = null;
var resultSubject = null;
var reccommened = null;
var sameLocation = null;

router.post('/searchFind', function(req, res, next){
  searchedTerm = req.body.search;
  //console.dir(searchedTerm);

  /* Find username */
  User.findOne({username: searchedTerm, tutor: true}, function(err, user) {
    resultUsername = user;
    //console.dir(resultUsername);
    return;
  });


  User.find({name: searchedTerm, tutor: true}).sort({sum_rating: -1}).exec(function(err, name) {
    resultNames = name;
    return;
  });

  User.find({rate: searchedTerm, tutor: true}).sort({sum_rating: -1}).exec(function(err, rate) {
    resultPrice = rate;
    return;
  });

  User.find({subjects: { $in: [searchedTerm] } , tutor: true}).sort({sum_rating: -1}).exec(function(err, sub) {
    resultSubject = sub;
    return;
  });

  /* Recommended feature */
  var secret = 'tutorMeSecretString';
  if(!req.cookies.tutorMeData)
    {
        res.redirect('/');
    }
  var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
  console.dir(result);
  if(result)
    {
    //Find current user location
    User.find({username: result}, function(err, user) {
      console.dir(user[0].city);
      User.find({city: user[0].city, country: user[0].country, tutor: true}).sort({sum_rating: -1, rate: 1}).exec(function(err, location) {
        sameLocation = location;
        return;
      });
    });

    res.redirect('/search');
  }
});

//Subject Searchs
 router.post('/searchSubject', function(req, res, next){
  User.find({subjects: { $in: [req.body.subject] } , tutor: true}).sort({sum_rating: -1}).exec(function(err, sub) {
    resultSubject = sub;
    return;
  });

  var secret = 'tutorMeSecretString';
  if(!req.cookies.tutorMeData)
    {
        res.redirect('/');
    }
  var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
  console.dir(result);
  if(result)
    {
    //Find current user location
    User.find({username: result}, function(err, user) {
      console.dir(user[0].city);
      User.find({city: user[0].city, country: user[0].country, tutor: true}).sort({sum_rating: -1, rate: 1}).exec(function(err, location) {
        sameLocation = location;
        return;
      });
    });

    res.render('search.html', {search: req.body.subject, subject: resultSubject, location: sameLocation, uname: null, names: [], price: []});
 }
 });

/* GET search page. */
router.get('/search', function(req, res, next) {
  //console.dir(searchedTerm);
  //console.dir(resultUsername);
  //console.dir(resultNames);
  console.dir(resultPrice);
  //console.dir(resultSubject);

  res.render('search.html', {search: searchedTerm, uname: resultUsername, names: resultNames,
    price: resultPrice, subject: resultSubject, location: sameLocation});
});

/* POST add picture page. */
router.post('/addingPicture', function(req, res, next) {

  var secret = 'tutorMeSecretString';
  if(!req.cookies.tutorMeData)
    {
        res.redirect('/');
    }
  var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
  console.dir(result);
  if(result)
    {
    User.update({username:result}, {$set:{picture:"/images/"+req.body.profPic+".jpg"}}, function(err, result) {
      console.dir(req.body.profPic);
    });
    res.redirect("/profile&username=" + result);
  }
});

/* GET add picture page. */
router.get('/addPicture', function(req, res, next) {
  res.render('add_pic.html', {});
});

/* GET weekview page. - gets the schedule of the user that is logged in */
router.get('/weekView', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.redirect('/');
    }
    var result = cookieSign.unsign(req.cookies.tutorMeData, secret);
    console.dir(result);
    if(result)
    {
        res.redirect('/weekView&username=' + result);
    }
    else
    {
        res.redirect('/');
    }
});
/* GET weekview page. - gets the schedule of the user that is asked for */
router.get('/weekView&username=*', function(req, res, next) {

    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.redirect('/');
    }
    var uname_logged = cookieSign.unsign(req.cookies.tutorMeData, secret);
    if(uname_logged)
    {
        if(req.url.length <= 19)
        {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.write("not found");
            res.end();
        }
        else
        {
            var uname = req.url.substring(19);
            User.findOne({username: uname}, function(err, user) {
                if (err) return console.error(err);
                if(user)
                {
                    var user_events = user.events;
                    res.render('weekview.html', {events: JSON.stringify(user_events), uname: uname, uname_logged: uname_logged});
                }
                else
                {
                    res.writeHead(404, {"Content-Type": "text/html"});
                    res.write("not found");
                    res.end();
                }
            });
        }
    }
    else
    {
        res.redirect('/');
    }

});

/* GET profile page for the username requested */
router.get('/profile&username=*', function(req, res, next) {
    var secret = 'tutorMeSecretString';
    if(!req.cookies.tutorMeData)
    {
        res.render('homepage_inital.html', {});
    }
    var uname_logged = cookieSign.unsign(req.cookies.tutorMeData, secret);
    if(uname_logged)
    {
        if(req.url.length <= 18)
        {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.write("not found");
            res.end();
        }
        else
        {
            var uname = decodeURIComponent(req.url.substring(18));
            User.findOne({username: uname}, function(err, user) {
                if (err) return console.error(err);
                if(user)
                {
                    console.log(uname);
                    res.render('profile.html', {uname:uname});
                }
                else
                {
                    res.writeHead(404, {"Content-Type": "text/html"});
                    res.write("not found");
                    res.end();
                }
            });
        }
    }
    else
    {
        res.render('homepage_inital.html', {});
    }
});

// Getting json object by username
router.get('/username=*', function(req, res, next) {

    console.log(req.url.substring(10));
    if(req.url.length <= 10)
    {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("not found");
        res.end();
    }
    User.findOne({username: decodeURIComponent(req.url.substring(10))}, function(err, user) {
        if (err) return console.error(err);
        console.dir("Retrived file from db.");
        if(user)
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write(JSON.stringify(user));
        }
        else
        {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.write("not found");
        }
        res.end();
    });

});

/* Helper function to see if the data of a user that is trying to sign up is valid*/
function checkNewUserData(data)
{
    var toTest = [];
    toTest.push(data["username"]);
    toTest.push(data["password"]);
    for (var i = 0; i < toTest.length; i++)
    {
        if(toTest[i])
        {
            if(toTest[i] == "")
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
    return true;
}

/* Socket.io connection on port 4200. This is used to exchange chat messages
   and to transfer complex JSON objects from pages to the server and vice-versa.
*/
io.on('connection', function(client){
  console.log('a user connected');

  //when the user finishes the last step in creating the account using facebook
  //the page sends to the server the new information and the server updates the
  //the user information
  client.on('fb', function(data){

    data = JSON.parse(data);
    console.log("THE DATA IS EQUAL TO: ");
    console.log(data);

    User.findOne({username: data["username"]}, function(err, user) {

      if (user)
      {
        console.log("it is in ");
        var tutorB = data["type_of_user"] == "Yes" ? true : false;
        var adminB = false;
        var eventsJSON = JSON.stringify(data["events"]);

        user.tutor = tutorB;
        user.admin = adminB;
        user.subjects = data["subjects"];
        user.events = eventsJSON;

        console.log("This is the user:");
        console.log(user);
        user.save(function(err, funct) {
            if(!err){
                console.dir("New User Saved.");
                client.emit('success', "0");
            } else {
                console.dir("Failed to save user: ");
                console.dir(err);
                client.emit('failedDB', "-1");
            }
        });
      }
      else
      {
          client.emit('user not find', "-1");
      }
    });

  });

  //Action to take place when admin page tries to update a entry on the
  //user table of the database.
  client.on('updateDBEntryUser', function(data) {
        data = JSON.parse(data);

        //TODO CHECK FOR VALID USER MAKING MODIFICATIONS - NO SECURITY HERE FOR NOW

        User.findOne({_id: data["_id"]}, function(err, user) {

          if (user)
          {
                for(var propertyName in data) {
                   user[propertyName] = data[propertyName];
                }
                console.dir(user);
                user.save(function(err, funct) {
                    if(!err){
                        console.dir("User Updated.");
                        client.emit('success', "0");
                    } else {
                        console.dir("Failed to update user");
                        console.dir(err);
                        client.emit('failedDB', "-1");
                    }
                });
          }
          else
          {
              console.dir("User not found.");
              client.emit('failedDB', "-1");
          }
        });
    });

    //Action to take place when a calendar event is changed. This could be due
    //to a time-slot reservation or cancellation on the /weekview page.
    client.on('updateEvs', function(data) {
        data = JSON.parse(data);

        //TODO: CHECK FOR VALID USER MAKING MODIFICATIONS - NO SECURITY HERE FOR NOW

        User.findOne({username: data["uname"]}, function(err, user) {

          if (user)
          {

            user.events = JSON.stringify(data['events']);
            user.save(function(err, funct) {
                if(!err){
                    console.dir("User Events Updated.");
                } else {
                    console.dir("Failed to save new user events: ");
                    console.dir(err);
                    client.emit('failedDB', "-1");
                }
            });
          }
          else
          {
              console.dir("User not found.");
              client.emit('failedDB', "-1");
          }
        });
    });

    //Action to take place when the regular sign up is used.
    client.on('register', function(data) {
        data = JSON.parse(data);
        console.log("THE DATA IS EQUAL TO: ");
        console.log(data);

        if(!checkNewUserData(data))
        {
            console.log("Invalid user data");
            client.emit('invalidData', "-1");
            return;
        }

        User.findOne({username: data["username"]}, function(err, user) {

          if (!user)
          {//Username not taken
            var tutorB = data["type_of_user"] == "Yes" ? true : false;
            var adminB = false;
            var eventsJSON = JSON.stringify(data["events"]);
            var input_user = new User({name: data["name"], email: data["email"], username: data["username"], password: data["password"], tutor: tutorB, admin: adminB, subjects: data["subjects"], events: eventsJSON});
            console.log("This is the input_user:");
            console.log(input_user);
            input_user.save(function(err, funct) {
                if(!err){
                    console.dir("New User Saved.");
                    client.emit('success', "0");
                } else {
                    console.dir("Failed to save user: ");
                    console.dir(err);
                    client.emit('failedDB', "-1");
                }
            });
          }
          else
          {
              client.emit('duplicatedUsername', "-1");
          }
        });
    });

  //when the user wants to send a message to another user it sends to the server
  //a message asking for the room that the message will be sent. If this user never
  //sent a message to the receiver, a new room is alocated and saved for both users.
  client.on('subscribe', function(data){

    User.findOne({username: data.user}, function(err, user) {

      if (!user) {//Username not taken

        console.log("no user with that name", err);

      }else{

        var room = 0;

        var chats = user.chats;

        var index = -1;

        for (var i = 0; i < chats.length; i++){
          if(chats[i].user == data.receiver){
            index = i;
          }
        }

        console.log("index",index)

        //checking to see if a chat room for both users already exists
        if(index < 0){

          Chat.count({},function(err, c){

            room = c;
            var messages = [];

            //creates a new room for the conversation
            var chatRoom = new Chat({roomName: room, messages:messages});
            chatRoom.save(function(err, funct) {
              console.dir("New room Saved.");
            });

            var userChats = chats.slice(0);
            var chatUser = {room:room, user: data.receiver};

            userChats.push(chatUser);

            user.chats = userChats;

            user.save();

            User.findOne({username: data.receiver}, function(err, receiver){

              var reChats = receiver.chats.slice(0);

              var chatReceiver = {room:room, user: data.user};

              reChats.push(chatReceiver);

              receiver.chats = reChats;

              receiver.save();

            });

            console.log(data.user, ' logging into room ', room);
            client.join(room);

            Chat.findOne({roomName: room}, function(err, chatRoom){

              if(chatRoom){

                var log = {room: room, log:chatRoom.messages};

                client.emit('message log', log);
              }

            });

          });


        }else{
          room = chats[index].room;

          console.log(data.user, ' logging into room ', room);
          client.join(room);

          Chat.findOne({roomName: room}, function(err, chatRoom){

            if(chatRoom){

              var log = {room: room, log:chatRoom.messages};

              client.emit('message log', log);
            }

          });

        }

      }
    });

  });

  //message received by server containing the message contents and the sender.
  //Everyone that is subscribed to the room will receive the message.
  client.on('message', function(data){
        console.log(data);
        io.sockets.in(data.room).emit('message', data);

        Chat.findOne({roomName: data.room}, function(err, chat){

          //saving the message to the database
          var addmsg = [];
          if(chat.messages){
            var addMsg = chat.messages.slice(0);
          }
          var newMessage = {msg:data.msg, sender:data.sender}
          addMsg.push(newMessage);
          chat.messages = addMsg;
          chat.save();

        })
  });


});

router.get('/*', function(req, res, next) {
  res.redirect('/homepage');
});

//Intializing Socket.io server on port 4200
http.listen(4200, function(){
  console.log('listening SOCKET on *:4200');
});

module.exports = router;
