/* IMPORTS */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var config = require('./config.js');
var async = require('async');

/* MODELS */
var User = require('./models/user');
var Post = require('./models/post');
var UPR = require('./models/userpostrelation');
var UUR = require('./models/useruserrelation');

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
app.get('/', (req, res) => {
    res.send('app works');
});


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
                        switch (err.errmsg.split(' ')[7].split('_')[0]) {
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
            } else {
                res.status(401).send('');
            }

        });
    });
app.route('/user')
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                User.findById(user.id, (err, user) => {
                    if (!err) {
                        if (user) {
                            res.json(user);
                        } else {
                            res.status(404).send('not found');
                        }
                    } else {
                        res.status(401).send('');
                    }
                });
            }
        }
    })
    .put((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                async.waterfall([
                    (callback) => {
                        User.findById(user.id, (err, user) => {
                            if (!err) {
                                return callback(null, user);
                            }
                            throw err;
                        });
                    }, (user, callback) => {
                        bcrypt.compare(req.body.password, user.password, (err, same) => {
                            if (!err) {
                                if (same) {
                                    callback(null, user)
                                } else {
                                    return callback(true, 'wrong password');
                                }
                            } else {
                                throw err;
                            }
                        })
                    }, (user, callback) => {
                        if (req.query.action == "info") {
                            user.username = req.body.username;
                            user.bio = req.body.bio;
                            if (!req.body.avatar || req.body.avatar == "") {
                                user.avatar = "https://betruewebdesign.com/img/avatar-300x300.png";
                            } else {
                                user.avatar = req.body.avatar;
                            }
                            user.email = req.body.email;
                            user.save((err) => {
                                if (!err) {
                                    let token = jwt.encode({
                                        username: req.body.username,
                                        id: user.id
                                    }, config.secret);
                                    return callback(null, token)
                                } else {
                                    switch (err.errmsg.split(' ')[7].split('_')[0]) {
                                        case 'username':
                                            callback(true, 'username taken');
                                            break;
                                        case 'email':
                                            callback(true, 'email taken');
                                            break;
                                        default:
                                            callback(true, 'unknown error')
                                            break;
                                    }
                                }

                            });
                        } else if (req.query.action == "password") {
                            bcrypt.hash(req.body.newpassword, config.saltRounds, (error, password) => {
                                if (error) {
                                    throw err;
                                } else {
                                    user.password = password;
                                    user.save((err) => {
                                        if (!err) {
                                            return callback(null, 'password saved');
                                        }
                                        throw err;
                                    })
                                }
                            });
                        }
                    }
                ], (err, callback) => {
                    if (err) {
                        res.status(401).send(callback);
                    } else {

                        res.status(200).send(callback);
                    }
                });
            }
        }
    })
    .delete((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                async.waterfall([
                    (callback) => {
                        User.findById(user.id, (err, user) => {
                            if (!err) {
                                return callback(null, user);
                            }
                            return callback(err, 'user not found');
                        })
                    },
                    (user, callback) => {
                        bcrypt.compare(req.body.password, user.password, (err, same) => {
                            if (!err) {
                                if (same) {
                                    return callback(null, user)
                                } else {
                                    return callback(true, 'wrong password')
                                }
                            } else {
                                throw err;
                            }
                        })
                    },
                    (user, callback) => {
                        UUR.find({
                            followerID: user._id
                        }).remove((err) => {
                            if (err) throw err;
                            callback(null, user);
                        });
                    },
                    (user, callback) => {
                        UPR.find({
                            userID: user._id
                        }).remove((err) => {
                            if (err) throw err;
                            callback(null, user);
                        });
                    },
                    (user, callback) => {
                        Post.find({
                            byID: user._id
                        }).remove((err) => {
                            if (err) throw err;
                            callback(null, user);
                        });
                    },
                    (user, callback) => {
                        user.remove(err => {
                            if (err) throw err;
                            callback(null, 'done');
                        });
                    }
                ], (err, callback) => {
                    if (err) {
                        res.status(401).send(callback);
                    } else {
                        res.status(200).send('user deleted');
                    }
                });
            }
        }
    });
app.route('/follows')
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                UUR.find({
                    followerID: user.id
                }, (uurfinderr, uurs) => {
                    if (!uurfinderr) {
                        async.map(uurs, (uur, callback) => {
                            User.findById(uur.followsID, (err, res) => {
                                if (err) {
                                    return callback(err);
                                }
                                return callback(null, res);
                            })
                        }, (err, follows) => {
                            if (!err) {
                                res.json(follows);
                            } else {
                                res.status(500).send('error finding users')
                            }
                        });
                    } else {
                        res.status(500).send('error finding uurs');
                    }
                });
            }
        }
    });
app.route('/followers/:userid/count')
    .get((req, res) => {
        UUR.find({
            followsID: req.params.userid
        }).count((err, count) => {
            if (err) throw err;
            res.status(200).send(count.toString());
        });
    });
app.route('/following/:userid/count')
    .get((req, res) => {
        UUR.find({
            followerID: req.params.userid
        }).count((err, count) => {
            if (err) throw err;
            res.status(200).send(count.toString());
        });
    });
/* POSTS */
app.route('/posts/:userid')
    .get((req, res) => {
        Post.find({
            byID: req.params.userid
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
app.route('/follow/:followid')
    .put((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                UUR.findOne({
                    followerID: user.id,
                    followsID: req.params.followid
                }, (uurfinderror, uur) => {
                    if (!uurfinderror) {
                        if (uur == null) {
                            let newuur = new UUR({
                                followerID: user.id,
                                followsID: req.params.followid
                            });
                            newuur.save((err) => {
                                if (!err) {
                                    res.status(200).send('followed');
                                } else {
                                    throw err;
                                }
                            });
                        } else {
                            uur.remove((err) => {
                                if (err) throw err;
                                res.status(200).send('unfollowed');
                            })
                        }
                    } else {
                        res.sendStatus(500);
                    }
                });
            }
        }
    })
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                UUR.findOne({
                    followerID: user.id,
                    followsID: req.params.followid
                }, (uurfinderr, uur) => {
                    if (!uurfinderr) {
                        if (uur != null) {
                            res.json({
                                follows: true
                            });
                        } else {
                            res.json({
                                follows: false
                            });
                        }
                    } else {
                        res.status(500).send('error finding uur');
                    }
                });
            }
        }
    });

/* SAME */
app.route('/post/:postid')
    .put((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
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
                                if (UPRrelationError) throw err;
                                res.status(200).send('samed');
                            });
                        } else {
                            uprelation.remove((err) => {
                                if (err) throw err;
                                res.status(200).send('unsamed');
                            });
                        }
                    } else {
                        res.sendStatus(500);
                    }
                })

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
                            res.send(false);
                        } else {
                            res.send(true);
                        }
                    } else {
                        res.sendStatus(500);
                    }
                });
            }
        }
    });
app.route('/post/:postid/count')
    .get((req, res) => {
        UPR.find({
            postID: req.params.postid
        }).count((err, count) => {
            if (err) throw err;
            res.status(200).send(count.toString());
        });
    });
/* SEARCH */
app.route('/search')
    .get((req, res) => {
        if (req.query.query != "" && req.query.query != null && req.query.query != undefined) {
            User.find({
                "username": {
                    $regex: ".*" + req.query.query + ".*"
                }
            }, (searcherr, searchResults) => {
                if (!searcherr) {
                    res.json(searchResults);
                } else {
                    res.status(500).send('error searching');
                }
            })
        } else {
            res.status(401).send('empty search');
        }
    });


/* START SERVER */
app.listen(config.port, () => {
    console.log('listening on ' + config.port)
})