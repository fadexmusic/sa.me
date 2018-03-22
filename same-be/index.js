/* IMPORTS */
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var config = require('./config.js');
var async = require('async');
var nodemailer = require('nodemailer');

/* MODELS */
var User = require('./models/user');
var Post = require('./models/post');
var UPR = require('./models/userpostrelation');
var UUR = require('./models/useruserrelation');
var Feed = require('./models/feed');
var Notification = require('./models/notification');

/* INIT */
var app = express();
mongoose.Promise = global.Promise;
mongoose.connect(config.dburl, {
    useMongoClient: true
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sa.me.socialnetwork@gmail.com',
        pass: 'sameprojekt12345'
    }
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

function checkImage(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

/* REGISTER */
app.route('/register')
    .post((req, res) => {
        bcrypt.hash(req.body.password, config.saltRounds, (err, password) => {
            if (!err) {
                let newUser;
                let avatar = false;
                if (req.body.avatar == "" || req.body.avatar == null) {
                    avatar = true;
                    newUser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: password,
                    });
                }
                if (!checkImage(req.body.avatar) && !avatar) {
                    res.status(400).send('wrong image');
                } else {
                    if (avatar) {
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
                    var mailOptions = {
                        from: 'sa.me.socialnetwork@gmail.com',
                        to: req.body.email,
                        subject: 'Registration confirmation to sa.me',
                        html: 'You were successfully registered under the name <b>' + req.body.username + '</b>, thanks and enjoy!'
                    };
                    //res.sendStatus(200);
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            res.status(400).send('invalid email');
                        } else {
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

                        }
                    });
                }


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
app.route('/user/:user')
    .get((req, res) => {
        if (req.query.by == 'name') {
            User.findOne({
                username: req.params.user
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
        } else if (req.query.by == "id") {
            User.findById(req.params.user, (err, user) => {
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
        }

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
                            console.log(err);
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
                                console.log(err);
                            }
                        })
                    }, (user, callback) => {
                        if (req.query.action == "info") {
                            user.username = req.body.username;
                            user.bio = req.body.bio;
                            let av = null;
                            if (!req.body.avatar || req.body.avatar == "") {
                                av = "https://i.imgur.com/uOL5qdB.png";
                                user.avatar = "https://i.imgur.com/uOL5qdB.png";
                            }
                            if (!checkImage(req.body.avatar) && !av) {
                                res.status(400).send("wrong image");
                            } else {
                                if (!av) {
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
                            }

                        } else if (req.query.action == "password") {
                            bcrypt.hash(req.body.newpassword, config.saltRounds, (error, password) => {
                                if (error) {
                                    console.log(err);
                                } else {
                                    user.password = password;
                                    user.save((err) => {
                                        if (!err) {
                                            return callback(null, 'password saved');
                                        }
                                        console.log(err);
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
                                console.log(err);
                            }
                        })
                    },
                    (user, callback) => {
                        UUR.find({
                            followerID: user._id
                        }).remove((err, urd) => {
                            if (err) console.log(err);
                            callback(null, user);
                        });
                    },
                    (user, callback) => {
                        UPR.find({
                            userID: user._id
                        }).remove((err) => {
                            if (err) console.log(err);
                            callback(null, user);
                        });
                    },
                    (user, callback) => {
                        Post.find({
                            byID: user._id
                        }, (err, posts) => {
                            if (err) console.log(err);
                            if (posts.length > 0) {
                                async.map(posts, (post, cb) => {
                                    Feed.find({
                                        postID: post._id
                                    }).remove((err) => {
                                        if (err) console.log(err);
                                        cb(null);
                                    });
                                }, (err, cb) => {
                                    if (err) console.log(err);
                                    callback(null, user);
                                });
                            } else {
                                callback(null, user);
                            }
                        });
                    },
                    (user, callback) => {
                        Post.find({
                            byID: user._id
                        }).remove((err) => {
                            if (err) console.log(err);
                            callback(null, user);
                        });
                    },
                    (user, callback) => {
                        Notification.find({
                            userID: user._id
                        }).remove(err => {
                            if (err) console.log(err);
                            return callback(null, user);
                        })
                    },
                    (user, callback) => {
                        user.remove(err => {
                            if (err) console.log(err);
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
app.route('/reset')
    .put((req, res) => {
        User.find({ email: req.body.email }, (err, user) => {
            if (err) console.log(err);
            if (user.length != 1) {
                res.send('').status(404)
            }
            else {
                user = user[0];
                function makeid() {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    for (var i = 0; i < 8; i++)
                        text += possible.charAt(Math.floor(Math.random() * possible.length));

                    return text;
                }

                pwd = makeid();
                bcrypt.hash(pwd, config.saltRounds, (err, password) => {
                    if (err) console.log(err);
                    user.password = password;
                    var mailOptions = {
                        from: 'sa.me.socialnetwork@gmail.com',
                        to: user.email,
                        subject: 'Password reset',
                        html: 'Your password has been reset to <b>' + pwd + '</b>, please log in and change your password.'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            res.status(400).send('invalid email');
                        } else {
                            user.save((err) => {
                                if (err) console.log(err);

                                res.sendStatus(200);
                            });
                        }
                    });

                });
            }
        })
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
app.route('/followers/:userid/list')
    .get((req, res) => {
        UUR.find({
            followsID: req.params.userid
        }, (err, uurs) => {
            async.map(uurs, (uur, callback) => {
                User.findById(uur.followerID, (userfinderror, user) => {
                    if (userfinderror) console.log(err);
                    callback(null, user);
                })
            }, (err, followers) => {
                if (err) console.log(err);
                res.status(200).json(followers);
            })
        });
    });
app.route('/followers/:userid/count')
    .get((req, res) => {
        UUR.find({
            followsID: req.params.userid
        }).count((err, count) => {
            if (err) console.log(err);
            res.status(200).send(count.toString());
        });
    });
app.route('/following/:userid/count')
    .get((req, res) => {
        UUR.find({
            followerID: req.params.userid
        }).count((err, count) => {
            if (err) console.log(err);
            res.status(200).send(count.toString());
        });
    });
app.route('/following/:userid/list')
    .get((req, res) => {
        UUR.find({
            followerID: req.params.userid
        }, (err, uurs) => {
            async.map(uurs, (uur, callback) => {
                User.findById(uur.followsID, (userfinderror, user) => {
                    if (userfinderror) console.log(err);
                    callback(null, user);
                })
            }, (err, following) => {
                if (err) console.log(err);
                res.status(200).json(following);
            })
        });
    });



/* POSTS */
app.route('/posts/:userid')
    .get((req, res) => {
        Post.find({
            byID: req.params.userid
        }).skip(parseInt(req.query.offset)).limit(parseInt(req.query.limit)).sort({
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
                    newPost.save((err, post) => {
                        if (!err) {
                            async.waterfall([
                                (callback) => {
                                    UUR.find({
                                        followsID: user.id
                                    }, (err, uurs) => {
                                        if (err) console.log(err);
                                        if (uurs.length > 0) {
                                            return callback(null, uurs)
                                        } else {
                                            return callback(true, 'no followers, posted')
                                        }
                                    })
                                }, (uurs, callback) => {
                                    async.map(uurs, (uur, cb) => {
                                        let newFeed = new Feed({
                                            followerID: uur.followerID,
                                            postID: post._id
                                        });
                                        newFeed.save((err) => {
                                            if (err) console.log(err);
                                            return cb(null);
                                        });
                                    }, (err, cb) => {
                                        if (err) console.log(err);
                                        return callback(null, 'posted, feeds pushed')
                                    })
                                }
                            ], (err, callback) => {
                                if (err) {
                                    if (callback == "no followers, posted") {

                                        res.status(200).send(callback);
                                    } else {

                                        res.status(500).send(callback);
                                    }
                                } else {
                                    res.status(200).send(callback);
                                }
                            })

                        } else {
                            console.log(err);
                        }
                    });
                } else if (req.body.type == "image") {
                    if (!checkImage(req.body.content)) {
                        res.status(400).send('wrong image')
                    } else {
                        let newPost = new Post({
                            type: 'image',
                            byID: user.id,
                            content: req.body.content,
                            description: req.body.description
                        });
                        newPost.save((err, post) => {
                            if (!err) {
                                async.waterfall([
                                    (callback) => {
                                        UUR.find({
                                            followsID: user.id
                                        }, (err, uurs) => {
                                            if (err) console.log(err);
                                            if (uurs.length > 0) {
                                                return callback(null, uurs)
                                            } else {
                                                return callback(true, 'no followers, posted')
                                            }
                                        })
                                    }, (uurs, callback) => {
                                        async.map(uurs, (uur, cb) => {
                                            let newFeed = new Feed({
                                                followerID: uur.followerID,
                                                postID: post._id
                                            });
                                            newFeed.save((err) => {
                                                if (err) console.log(err);
                                                return cb(null);
                                            });
                                        }, (err, cb) => {
                                            if (err) console.log(err);
                                            return callback(null, 'posted, feeds pushed')
                                        })
                                    }
                                ], (err, callback) => {
                                    if (err) {
                                        if (callback == "no followers, posted") {

                                            res.status(200).send(callback);
                                        } else {

                                            console.log(err);
                                        }
                                    } else {
                                        res.status(200).send(callback);
                                    }
                                })
                            } else {
                                console.log(err);
                            }
                        });
                    }
                }
            }
        } else {
            res.sendStatus(401);
        }
    });
app.route('/samed/:postid')
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
    })
app.route('/post/:postid')
    .get((req, res) => {
        Post.findById(req.params.postid, (err, post) => {
            if (err) console.log(err);
            res.status(200).json(post);
        });
    })
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
                                if (UPRrelationError) console.log(err);
                                Post.findById(req.params.postid, (err, post) => {
                                    if (err) console.log(err);
                                    if (user.id == post.byID) {
                                        res.status(200).send('samed');
                                    } else {
                                        User.findById(post.byID, (err, u) => {
                                            if (err) console.log(err);
                                            let newNotif = new Notification({
                                                byID: user.id,
                                                userID: u._id,
                                                type: 'same',
                                                postID: req.params.postid
                                            });
                                            newNotif.save(err => {
                                                if (err) console.log(err);
                                                res.status(200).send('samed');
                                            })
                                        });

                                    }
                                });
                            });
                        } else {
                            uprelation.remove((err) => {
                                if (err) console.log(err);
                                Post.findById(req.params.postid, (err, post) => {
                                    if (err) console.log(err);
                                    if (post.byID == user.id) {
                                        res.status(200).send('unsamed');
                                    } else {
                                        Notification.find({
                                            postID: req.params.postid,
                                            byID: user.id
                                        }).remove(err => {
                                            if (err) console.log(err);
                                            res.status(200).send('unsamed');
                                        });
                                    }
                                });

                            });
                        }
                    } else {
                        res.sendStatus(500);
                    }
                })

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
                        Post.findById(req.params.postid, (err, post) => {
                            if (!err) {
                                if (post) {
                                    if (post.byID == user.id) {
                                        return callback(null, post);
                                    } else {
                                        return callback(true, 'not your post');
                                    }
                                } else {
                                    return callback(true, 'post not found');
                                }
                            } else {
                                console.log(err);
                            }
                        })
                    }, (post, callback) => {
                        UPR.find({
                            postID: post._id
                        }).remove((err) => {
                            if (err) console.log(err);
                            return callback(null, post);
                        })
                    }, (post, callback) => {
                        Feed.find({
                            postID: post._id
                        }).remove((err) => {
                            if (err) console.log(err);
                            return callback(null, post)
                        })
                    }, (post, callback) => {
                        Notification.find({
                            postID: post._id
                        }).remove((err) => {
                            if (err) console.log(err);
                            return callback(null, post);
                        });
                    }, (post, callback) => {
                        post.remove((err) => {
                            if (err) console.log(err);
                            return callback(null, 'post removed');
                        })
                    }
                ], (err, callback) => {
                    if (err) {
                        res.status(500).send(callback);
                    } else {
                        res.status(200).send(callback);
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
            if (err) console.log(err);
            res.status(200).send(count.toString());
        });
    });
app.route('/post/:postid/list')
    .get((req, res) => {
        UPR.find({
            postID: req.params.postid
        }, (err, uprs) => {
            if (err) console.log(err);
            async.map(uprs, (upr, callback) => {
                User.findById(upr.userID, (finderr, user) => {
                    if (finderr) console.log(finderr);
                    callback(null, user);
                });
            }, (err, users) => {
                if (err) console.log(err);
                res.status(200).json(users);
            });
        });
    });
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
                                    Post.find({
                                        byID: req.params.followid
                                    }, (err, posts) => {
                                        if (err) console.log(err);
                                        if (posts.length > 0) {
                                            async.map(posts, (post, callback) => {
                                                let newFeed = new Feed({
                                                    followerID: user.id,
                                                    postID: post._id,
                                                    date: post.posted
                                                });
                                                newFeed.save(err => {
                                                    if (err) console.log(err);
                                                    callback(null);
                                                })
                                            }, (err, callback) => {
                                                if (err) console.log(err);
                                                let newNotif = new Notification({
                                                    userID: req.params.followid,
                                                    type: 'follow',
                                                    byID: user.id
                                                });
                                                newNotif.save(nsaverr => {
                                                    if (nsaverr) console.log(err);
                                                    res.status(200).send('followed');
                                                });
                                            });
                                        } else {
                                            let newNotif = new Notification({
                                                userID: req.params.followid,
                                                type: 'follow',
                                                byID: user.id
                                            });
                                            newNotif.save(nsaverr => {
                                                if (nsaverr) console.log(err);
                                                res.status(200).send('followed');
                                            });
                                        }
                                    })
                                } else {
                                    console.log(err);
                                }
                            });
                        } else {
                            uur.remove((err, uurelation) => {
                                if (err) console.log(err);

                                Feed.find({
                                    followerID: user.id
                                }, (err, feeds) => {
                                    if (err) console.log(err);
                                    if (feeds.length > 0) {
                                        async.map(feeds, (feed, callback) => {
                                            Post.findById(feed.postID, (err, post) => {
                                                if (err) console.log(err);
                                                if (post) {
                                                    if (post.byID == uurelation.followsID) {
                                                        feed.remove(err => {
                                                            if (err) console.log(err);
                                                            return callback(null);
                                                        });
                                                    } else {
                                                        return callback(null);

                                                    }
                                                } else {
                                                    return callback(null);
                                                }
                                            });
                                        }, (err, callback) => {
                                            if (err) console.log(err);
                                            Notification.find({
                                                userID: req.params.followid
                                            }).remove(err => {
                                                if (err) console.log(err);
                                                res.status(200).send('unfollowed')
                                            });
                                        });
                                    } else {
                                        Notification.find({
                                            userID: req.params.followid
                                        }).remove(err => {
                                            if (err) console.log(err);
                                            res.status(200).send('unfollowed')
                                        });
                                    }
                                });
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


/* FEED */
app.route('/feed')
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                Feed.find({
                    followerID: user.id
                }).skip(parseInt(req.query.offset)).limit(parseInt(req.query.limit)).sort({
                    date: -1
                }).exec((err, feeds) => {
                    if (err) console.log(err);
                    if (feeds.length > 0) {
                        async.map(feeds, (feed, callback) => {
                            Post.findById(feed.postID, (err, post) => {
                                if (err) console.log(err);
                                if (post) {
                                    return callback(null, post);
                                } else {
                                    return callback(null);
                                }
                            })
                        }, (err, posts) => {
                            if (err) console.log(err);
                            res.status(200).json(posts);
                        });
                    } else {
                        res.status(404).send('there are no more posts');
                    }
                });
            }
        }
    })

/* NOTIFICATIONS */
app.route('/notifications')
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                Notification.find({
                    userID: user.id
                }).limit(parseInt(req.query.limit)).sort({
                    date: -1
                }).lean().exec((err, notifications) => {
                    if (err) console.log(err);
                    if (notifications.length > 0) {
                        async.map(notifications, (notification, callback) => {
                            User.findById(notification.byID, (err, user) => {
                                if (err) console.log(err);
                                let n = notification;
                                n.byUsername = user.username;
                                n.byAvatar = user.avatar;
                                callback(null, n);
                            });
                        }, (err, notifs) => {
                            if (err) console.log(err);
                            res.status(200).json(notifs);
                        })
                    } else {
                        res.status(200).send('no notifs found');
                    }
                })
            }
        }
    });
app.route('/notifications/count')
    .get((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                Notification.find({
                    userID: user.id
                }, (err, notifications) => {
                    if (err) console.log(err);
                    if (notifications) {
                        let notifAmount = 0;
                        notifications.forEach(n => {
                            if (!n.read) {
                                notifAmount++;
                            }
                        })
                        res.status(200).send(notifAmount.toString());
                    } else {
                        res.status(200).send(toString(0));
                    }
                })
            }
        }
    });
app.route('/notifications/:notifid')
    .put((req, res) => {
        if (req.headers.authorization) {
            let auth = req.headers.authorization.split(' ');
            if (auth[0] == "Bearer") {
                let user = jwt.decode(auth[1], config.secret);
                Notification.findById(req.params.notifid, (err, notification) => {
                    if (err) console.log(err);
                    notification.read = true;
                    notification.save(err => {
                        if (err) console.log(err);
                        res.status(200).send('read');
                    })
                });
            }
        }
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