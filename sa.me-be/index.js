/* IMPORTS */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var config = require('./config.js');

/* MODELS */
var User = require('./models/user');
var Post = require('./models/post');
var UPR = require('./models/userpostrelation');

/* INIT */
var app = express();
mongoose.Promise = global.Promise;
mongoose.connect(config.dburl, {
    useMongoClient: true
});

/* USE */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

/* ROUTING */


/* REGISTER */
app.route('/register')
    .post((req, res) => {
        bcrypt.hash(req.body.password, config.saltRounds, (err, password) => {
            if (!err) {
                let newUser;
                console.log(req.body.avatar)
                if (req.body.avatar == "" || req.body.avatar == null) {
                    newUser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: password
                    });
                } else {
                    newUser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        avatar: req.body.avatar,
                        password: password
                    });

                }
                newUser.save((err) => {
                    if (err) {
                        switch (err.toJSON().errmsg.split(' ')[7].split('_')[0]) {
                            case 'username':
                                res.status(400).send('username taken');
                                break;
                            case 'email':
                                res.status(400).send('email taken');
                                break;
                            default:
                                res.status(400).send('unknown error')
                                break;
                        }
                    } else {
                        res.sendStatus(200);
                    }
                });
            } else {
                res.status(500).send('error registering');
            }
        })
    });

/* LOGIN */
app.route('/login')
    .post((req, res) => {
        User.findOne({
            username: req.body.username
        }, (err, user) => {
            if (user != null) {
                bcrypt.compare(req.body.password, user.password, (err, same) => {
                    if (!err) {
                        if (same) {
                            let token = jwt.encode({
                                username: req.body.username,
                                id: user._id
                            }, config.secret);
                            res.send(token);
                        } else {
                            res.status(400).send('invalid password');
                        }
                    }
                });
            } else {
                res.status(400).send('invalid username');
            }
        });
    });

/* USER */
app.route('/user/:username')
    .get((req, res) => {
        User.findOne({
            username: req.params.username
        }, (err, user) => {
            if (!err) {
                if (user != null) {
                    res.json(user);
                } else {

                    res.status(404).send('user not found');
                }
            } else {}

        });
    });


/* POSTS */
app.route('/posts/:username')
    .get((req, res) => {
        Post.find({
            by: req.params.username
        }).sort({
            posted: -1
        }).exec((err, posts) => {
            if (!err) {
                res.status(200).send(posts);
            } else {
                res.status(500).send('error getting posts');
            }
        })
    });

app.route('/post')
    .post((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                if (req.body.type == "text") {
                    let newPost = new Post({
                        type: 'text',
                        by: user.username,
                        byID: user.id,
                        content: req.body.content
                    });
                    newPost.save((err) => {
                        if (err) {
                            res.status(500).send('error posting');
                        } else {
                            res.status(200).send('posted');
                        }
                    });
                } else if (req.body.type == "image") {
                    let newPost = new Post({
                        type: 'image',
                        by: user.username,
                        byID: user.id,
                        content: req.body.content,
                        description: req.body.description
                    });
                    newPost.save((err) => {
                        if (err) {
                            res.status(500).send('error posting');
                        } else {
                            res.status(200).send('posted');
                        }
                    });
                }
            }
        } else {
            res.sendStatus(401);
        }
    })

/* SAME */
app.route('/post/:postid')
    .put((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);

                if (req.body.same == 1) {
                    UPR.findOne({
                        userID: user.id,
                        postID: req.params.postid
                    }, (UPRrelationError, uprelation) => {
                        if (!UPRrelationError) {
                            if (uprelation == null) {
                                let newUPR = new UPR({
                                    userID: user.id,
                                    postID: req.params.postid
                                });
                                newUPR.save((UPRrelationSaveError) => {
                                    if (!UPRrelationSaveError) {
                                        Post.findById(req.params.postid, (AddSameError, post) => {
                                            if (!AddSameError) {
                                                post.sames++;
                                                post.save(AddSameSaveError => {
                                                    if (!AddSameSaveError) {
                                                        res.status(200).send('post updated');
                                                    } else {
                                                        res.sendStatus(500);
                                                    }
                                                });
                                            } else {
                                                res.status(500).send('error getting posts');
                                            }
                                        });
                                    } else {
                                        res.sendStatus(500);
                                    }
                                });
                            } else {
                                res.status(400).send('already samed');
                            }
                        } else {
                            res.sendStatus(500);
                        }
                    })
                } else if (req.body.same == -1) {
                    UPR.findOne({
                        userID: user.id,
                        postID: req.params.postid
                    }).remove(uprfinderror => {
                        if (!uprfinderror) {
                            Post.findById(req.params.postid, (postfinderror, post) => {
                                if (!postfinderror) {
                                    if (post == null) {
                                        res.status(404).send('post not found')
                                    } else {
                                        post.sames--;
                                        post.save((err) => {
                                            if (err) {
                                                res.status(500).send('error updating post')
                                            } else {
                                                res.status(200).send('post updated');
                                            }
                                        });
                                    }

                                } else {
                                    res.status(500).send();
                                }
                            });
                        } else {
                            res.status(404).send('upr not found');
                        }
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        }
    })
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                UPR.findOne({
                    userID: user.id,
                    postID: req.params.postid
                }, (err, uprelation) => {
                    if (!err) {
                        if (uprelation == null) {
                            res.json({
                                samed: false
                            });
                        } else {
                            res.json({
                                samed: true
                            });
                        }
                    } else {
                        res.sendStatus(500);
                    }
                });
            }
        }
    });
/* START SERVER */
app.listen(config.port, () => {
    console.log('listening on ' + config.port)
})