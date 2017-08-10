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
var Feed = require('./models/feed');

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
                        }).remove((err, urd) => {
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
                        }, (err, posts) => {
                            if (err) throw err;
                            if (posts.length > 0) {
                                async.map(posts, (post, cb) => {
                                    Feed.find({
                                        postID: post._id
                                    }).remove((err) => {
                                        if (err) throw err;
                                        cb(null);
                                    });
                                }, (err, cb) => {
                                    if (err) throw err;
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
app.route('/followers/:userid/list')
    .get((req, res) => {
        UUR.find({
            followsID: req.params.userid
        }, (err, uurs) => {
            async.map(uurs, (uur, callback) => {
                User.findById(uur.followerID, (userfinderror, user) => {
                    if (userfinderror) throw err;
                    callback(null, user);
                })
            }, (err, followers) => {
                if (err) throw err;
                res.status(200).json(followers);
            })
        });
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
app.route('/following/:userid/list')
    .get((req, res) => {
        UUR.find({
            followerID: req.params.userid
        }, (err, uurs) => {
            async.map(uurs, (uur, callback) => {
                User.findById(uur.followsID, (userfinderror, user) => {
                    if (userfinderror) throw err;
                    callback(null, user);
                })
            }, (err, following) => {
                if (err) throw err;
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
                                        if (err) throw err;
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
                                            if (err) throw err;
                                            return cb(null);
                                        });
                                    }, (err, cb) => {
                                        if (err) throw err;
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
                            throw err;
                        }
                    });
                } else if (req.body.type == "image") {
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
                                        if (err) throw err;
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
                                            if (err) throw err;
                                            return cb(null);
                                        });
                                    }, (err, cb) => {
                                        if (err) throw err;
                                        return callback(null, 'posted, feeds pushed')
                                    })
                                }
                            ], (err, callback) => {
                                if (err) {
                                    if (callback == "no followers, posted") {

                                        res.status(200).send(callback);
                                    } else {

                                        throw err;
                                    }
                                } else {
                                    res.status(200).send(callback);
                                }
                            })
                        } else {
                            throw err;
                        }
                    });
                }
            }
        } else {
            res.sendStatus(401);
        }
    });

app.route('/post/:postid')
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
                                throw err;
                            }
                        })
                    }, (post, callback) => {
                        UPR.find({
                            postID: post._id
                        }).remove((err) => {
                            if (err) throw err;
                            return callback(null, post);
                        })
                    }, (post, callback) => {
                        Feed.find({
                            postID: post._id
                        }).remove((err) => {
                            if (err) throw err;
                            return callback(null, post)
                        })
                    }, (post, callback) => {
                        post.remove((err) => {
                            if (err) throw err;
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
            if (err) throw err;
            res.status(200).send(count.toString());
        });
    });
app.route('/post/:postid/list')
    .get((req, res) => {
       UPR.find({postID: req.params.postid}, (err, uprs) => {
         if(err) throw err;
         async.map(uprs, (upr, callback) => {
            User.findById(upr.userID, (finderr, user) => {
                if (finderr) throw finderr;
                callback(null, user);
            });
         }, (err, users) => {
            if(err) throw err;
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
                                        if (err) throw err;
                                        if (posts.length > 0) {
                                            async.map(posts, (post, callback) => {
                                                let newFeed = new Feed({
                                                    followerID: user.id,
                                                    postID: post._id,
                                                    date: post.posted
                                                });
                                                newFeed.save(err => {
                                                    if (err) throw err;
                                                    callback(null);
                                                })
                                            }, (err, callback) => {
                                                if (err) throw err;
                                                res.status(200).send('followed');
                                            });
                                        } else {
                                            res.status(200).send('followed');
                                        }
                                    })
                                } else {
                                    throw err;
                                }
                            });
                        } else {
                            uur.remove((err, uurelation) => {
                                if (err) throw err;

                                Feed.find({
                                    followerID: user.id
                                }, (err, feeds) => {
                                    if (err) throw err;
                                    if (feeds.length > 0) {
                                        async.map(feeds, (feed, callback) => {
                                            Post.findById(feed.postID, (err, post) => {
                                                if (err) throw err;
                                                if (post) {
                                                    if (post.byID == uurelation.followsID) {
                                                        feed.remove(err => {
                                                            if (err) throw err;
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
                                            if (err) throw err;
                                            res.status(200).send('unfollowed');
                                        });
                                    } else {
                                        res.status(200).send('unfollowed')
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
                    if (err) throw err;
                    if (feeds.length > 0) {
                        async.map(feeds, (feed, callback) => {
                            Post.findById(feed.postID, (err, post) => {
                                if (err) throw err;
                                if (post) {
                                    return callback(null, post);
                                } else {
                                    return callback(null);
                                }
                            })
                        }, (err, posts) => {
                            if (err) throw err;
                            res.status(200).json(posts);
                        });
                    } else {
                        res.status(404).send('there are no more posts');
                    }
                });
            }
        }
    })
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