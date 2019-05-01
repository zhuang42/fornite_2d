var port = 10939;

if (process.argv[2]) {
    port = parseInt(process.argv[2], 10);
}
console.log("Port is " + port);

var gameModel = require('./modelServer');



var express = require('express');
var app = express();

var uuid = require('uuid');



// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
//import the sqlite3 module
const sqlite3 = require('sqlite3').verbose();

var bodyParser = require('body-parser');


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

let db = new sqlite3.Database('db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

var crypto;
try {
    crypto = require('crypto');
} catch (err) {
    console.log('crypto support is disabled!');
}


// https://expressjs.com/en/starter/static-files.html
// serve the files in a directory named static-content
// app.use(express.static('static-content'));
app.use(express.static('build'));
app.use('/icons', express.static('icons'));
app.use('/lib', express.static('lib'));


/**Generate salt and hashed value*/
var genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length); /** return required number of characters */
};

var sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

/**database class warped by promise*/
class UserManagement {

    constructor(database) {
        //Enable Delete cascade
        this.db = database;
        this.run('PRAGMA foreign_keys = ON', []).then(() => {}, (err) => {
            throw err.message;
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) {
                    console.log('Error running sql ' + sql);
                    console.log(err);
                    reject(err)
                } else {
                    console.log('Success running sql ' + sql);
                    resolve();
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.log('Error running sql: ' + sql);
                    console.log(err);
                    reject(err)
                } else {
                    resolve(row);
                }
            })

        })
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log('Error running sql: ' + sql);
                    console.log(err);
                    reject(err)
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getUserByid(userid) {
        let sql = "SELECT * FROM user WHERE userid=?;";
        return this.get(sql, [userid]);
    }

    verification(userid, password) {

        return this.getUserByid(userid).then(
            (row) => {
                if (row) {
                    //Compared with hashed password
                    let salt = row.salt;
                    let hashedPassword = sha512(password, salt).passwordHash;
                    let sql = "SELECT * FROM user WHERE userid=? and password=?;";
                    return this.get(sql, [userid, hashedPassword]);

                } else {

                    return new Promise((resolve, reject) => {
                        reject("User does not exist");
                    })
                }
            },

            (err) => {
                console.log(err);
                return new Promise((resolve, reject) => {
                    reject(err);
                });
            });
    }

    deleteUserByid(userid) {
        let sql = "DELETE FROM user WHERE userid = ?";
        return this.run(sql, [userid]);
    }

    insertUser(userid, username, password, salt, gender, birthday) {
        let sql = 'INSERT INTO user(userid, username, password, salt, gender, birthday) VALUES (?,?,?,?,?,?);';
        return this.run(sql, [userid, username, password, salt, gender, birthday]);
    }

    createUserAchievement(userid) {
        let sql = 'INSERT INTO achievement(userid) VALUES (?)';
        return this.run(sql, [userid]);
    }

    updateUser(userid, username, gender, birthday) {
        let sql = 'UPDATE user SET  username = ? , gender = ?, birthday = ? WHERE userid=?;';
        return this.run(sql, [username, gender, birthday, userid]);
    }

    updatePassword(userid, password, salt) {
        let sql = 'UPDATE user SET password = ?, salt = ? WHERE userid = ?;';
        return this.run(sql, [password, salt, userid]);
    }

    getAchievementByid(userid) {
        let sql = 'SELECT * FROM achievement WHERE userid = ?;';
        return this.get(sql, [userid]);
    }
    //Increment
    updateAchievement(userid, kill, damage) {
        let sql = 'UPDATE achievement SET kill = kill + ?, damage = damage + ? WHERE userid = ?;';

        return this.run(sql, [kill, damage, userid]);
    }

    getTop10Kill() {
        let sql = 'SELECT * FROM achievement ORDER BY kill DESC LIMIT 10;';

        return this.all(sql);

    }

}

module.exports = UserManagement;

var dbc = new UserManagement(db);

//Return top 10 kill
app.get('/api/achievement', function(req, res) {

    let result = {};

    dbc.getTop10Kill().then(
        (rows) => {
            //console.log(rows);
            let count = 1;
            rows.forEach((row) => {
                result[count.toString()] = [row["userid"], row["kill"]];
                count += 1;
            });
            res.json(result);
        },
        (err) => {
            res.stat(500);
            result['error'] = "Inter Server Error";
            result['err'] = err.message;
            res.json(result);
        })

});

//Return user achievement
app.get('/api/achievement/:userid', function(req, res) {
    var userid = req.params.userid;

    if (!userid) {
        console.log('GET /api/user/ missing requirement element');
        res.status(400).send();

    }

    let result = {};

    dbc.getAchievementByid(userid).then(
        (row) => {

            if (row) {
                result['kill'] = row['kill'];
                result['damage'] = row['damage'];
                console.log(result);
                res.json(result);
            } else {
                res.status(404);
                result["error"] = "User does not exist";
                res.json(result);
            }

        },
        (err) => {
            res.json(500);
            result['error'] = err.message;
            res.json(result);
        });

});

//Get user information
app.get('/api/user/:userid', function(req, res) {
    //URL Parameters are grabbed using req.param.variable_name
    var userid = req.params.userid;
    // http://www.sqlitetutorial.net/sqlite-nodejs/query/
    if (!userid) {
        console.log('GET /api/user/ missing requirement element');
        res.status(400).send();

    }

    let result = {};

    dbc.getUserByid(userid).then(
        (row) => {
            if (row) {

                result["userid"] = row["userid"];
                result["username"] = row["username"];
                result["gender"] = row["gender"];
                result["birthday"] = row["birthday"];

                console.log(result);
                res.json(result);
            } else {
                res.status(404);
                result["error"] = "User does not exist";
                res.json(result);
            }
        },
        (err) => {
            res.json(500);
            result['error'] = err.message;
            res.json(result);
        });
});

//Method use for user login
app.post('/api/user/login', function(req, res) {
    var userid = req.body.userid;
    var password = req.body.password;

    if (!userid || !password) {
        console.log('/api/user/login miss requirement element');
        res.status(400).send();
    }

    console.log("POST:" + userid + " " + password);

    var result = {};
    dbc.verification(userid, password).then(
        (row) => {
            if (row) {
                console.log(row);
                result['token'] = 200;
                res.json(result);

            } else {
                console.log(userid + ' Password Wrong');
                result['error'] = 'Password Wrong';
                res.status(401);
                res.json(result);
            }
        }, (err) => {
            console.log(err);
            result['error'] = err;
            res.status(401);
            res.json(result);
        });

});

//Method use to create a new user.
app.post('/api/user/create', function(req, res) {
    //POST Parameters are grabbed using req.body.variable_name
    var userid = req.body.userid;
    var password = req.body.password;
    var username = req.body.username;
    var gender = req.body.gender;
    var birthday = req.body.birthday;

    if (!userid || !password || !username || !gender || !birthday) {
        console.log('/api/user/create missing requirement element');
        res.status(400).send();
    }

    console.log("POST:" + userid + " " + password + " " + username + " " + gender + " " + birthday);

    let salt = genRandomString(16);
    let passwordData = sha512(password, salt);

    let result = {};
    dbc.insertUser(userid, username, passwordData.passwordHash, passwordData.salt, gender, birthday).then(() => {
        //TODO token
        return dbc.createUserAchievement(userid);
    }, (err) => {
        result["error"] = 'User Name Conflict';
        res.status(409);
        res.json(result);
        return new Promise((resolve, reject) => {
            reject('User Name Conflict')
        })
    }).then(
        () => {
            result['token'] = 200;
            res.json(result);
        },

        (err) => {
            result["error"] = err;
            res.status(409);
            res.json(result);
        });
});

//Update A user password, original password required
app.put('/api/user/password/:userid', function(req, res) {
    var userid = req.params.userid;
    var password = req.body.password;
    var newpassword = req.body.newpassword;

    console.log("PUT:" + userid + " " + password + " " + newpassword);

    if (!userid || !password) {
        console.log('PUT /api/user/password/: userid missing requirement element');
        res.status(400).send();
        return;
    }

    var result = {};

    dbc.verification(userid, password).then(
        (row) => {
            if (row) {
                let salt = genRandomString(16);
                let passwordData = sha512(newpassword, salt);
                return dbc.updatePassword(userid, passwordData.passwordHash, passwordData.salt);
            } else {
                return new Promise((res, rej) => {
                    rej("Verification failed")
                });
            }
        },
        (err) => {
            return new Promise((res, rej) => {
                rej("Verification failed")
            });
        }).then(() => {
            result['status'] = 'success';
            res.json(result);
        },

        (err) => {
            res.status(403);
            result['error'] = err;
            res.json(result);
        });

});

//Update user profile information
app.put('/api/user/:userid', function(req, res) {
    var userid = req.params.userid;
    var username = req.body.username;
    var password = req.body.password;
    var gender = req.body.gender;
    var birthday = req.body.birthday;

    console.log("PUT:" + userid + " " + username + " " + password + " " + gender + " " + birthday);

    if (!userid || !username || !password || !gender || !birthday) {
        console.log('PUT /api/user/:userid missing requirement element');
        res.status(400).send();
        return;
    }

    var result = {};

    dbc.verification(userid, password).then(
        (row) => {
            if (row) {
                return dbc.updateUser(userid, username, gender, birthday);
            } else {

                return new Promise((res, rej) => {
                    rej("Verification failed")
                });
            }
        },
        (err) => {
            return new Promise((res, rej) => {
                rej("Verification failed")
            });
        }).then(() => {
            result['status'] = 'success';
            res.json(result);
        },

        (err) => {
            res.status(403);
            result['error'] = err;
            res.json(result);
        });

});

//Upload user achievement
app.put('/api/achievement/:userid', function(req, res) {
    var userid = req.params.userid;
    var password = req.body.password;
    var kill = req.body.kill;
    var damage = req.body.damage;

    if (!userid || !kill || !damage || !password) {
        console.log('/api/achievement/:userid missing requirement element');
        res.status(400).send();
        return;
    }

    console.log("PUT " + userid + " " + kill + " " + damage);

    var result = {};

    dbc.verification(userid, password).then(
        (row) => {
            if (row) {

                console.log('verification done');

                return dbc.updateAchievement(userid, kill, damage)
            } else {
                return new Promise((res, rej) => {
                    rej("Verification failed")
                });
            }
        },
        (err) => {
            return new Promise((res, rej) => {
                rej("Verification failed")
            });
        }).then(() => {

            console.log("upadte done");
            result['status'] = 'success';
            res.json(result);
        },
        (err) => {
            res.status(403);
            result['error'] = err;
            res.json(result);
        });
});

//Delete user, password required.
app.delete('/api/user/:userid', function(req, res) {
    var userid = req.params.userid;
    var password = req.body.password;

    if (!userid || !password) {
        console.log('DELETE /api/user/:userid:  missing requirement element');
        console.log(userid, req.body);
        res.status(400).send();
        return;
    }

    var result = {};

    dbc.verification(userid, password).then(

        (row) => {
            if (row) {
                return dbc.deleteUserByid(userid);
            } else {
                return new Promise((res, rej) => {
                    rej("Verification failed")
                });
            }

        },

        (err) => {
            return new Promise((res, rej) => {
                rej("Verification failed")
            });
        }).then(
        () => {
            result['status'] = 'success';
            res.json(result);

        },
        (err) => {
            res.status(403);
            result['error'] = err;
            res.json(result);
        });

});




//Socket things
const WebSocketServer = require('ws');
const wss = new WebSocketServer.Server({ port: port + 1 });

console.log("Websocket server established on port " + (port+1));

wss.on('open', function open() {
    console.log('Web socket server open');

});


wss.on('close', function close() {
    console.log('Web socket server closed');

});

wss.on('listen', function () {
    console.log('Web socket server listen');
});

wss.on('error', function (err) {
    console.log(err);
});





//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};



const generateGameData = (actors) => {
    let dataloader = {};
    dataloader['actors'] = actors;
    //console.log(dataloader['actors']);
    return JSON.stringify(dataloader);
};


var operations = ["login", "logout", "start", "event"];

function validateClientGameSocketMessage(json) {
    if (!json.operation || !json.userid) {
        console.log("Invalid User socket message");
        return false;
    }

    if (!(operations.includes(json.operation))) {
        console.log("Invalid User socket operation");
        return false;
    }


    if (json.operation === "event" && (!json.event)) {
        console.log("Invalid User socket event");
        return false;
    }

    return true;

}



function handleOperation(ws, data) {
    switch (ws.userState) {
        case "login":
            if (data.operation === "login") {
                console.log(data.userid + " login by socket");
                ws.userid = data.userid;
                let p = mainGame.findRemotePalyer(ws.userid);
                if (p) {
                    ws.player = p;
                }else {
                    console.log("create player for socket");
                    ws.player = mainGame.createRemotePalyer(ws.userid);
                }
            }

            ws.userState = "game";


            break;
        case "game":
            if (data.operation === "logout") {
                console.log(data.userid + " logout by socket");
                ws.userid = null;
                ws.player = null;
                ws.userState = 'login';
            }


            if (data.operation === "start") {
                console.log(data.userid + " start by socket");
                let p = mainGame.findRemotePalyer(ws.userid);
                if (!p) {
                    ws.player = mainGame.createRemotePalyer(ws.userid);
                    mainGame.addRemotePlayerToWorld(ws.player);
                }
            }

            if (data.operation === "event") {
                //console.log(data.userid +" send event");
                if (ws.player) {
                    ws.player.handleEvent(data.event);
                }
            }
            break;

    }



}
wss.on('connection', function connection(ws, req) {
    const ip = req.connection.remoteAddress;
    ws.wsid = uuid.v4();
    ws.userid = null;
    ws.userState = "login";


    console.log("Cline ip " + ip + "Client id "+ ws.wsid + " connected");


    ws.on('message', function incoming(message) {
        var data = {};
        try {
            data = JSON.parse(message);
            if (!validateClientGameSocketMessage(data)) {
                return;
            }
        }catch (e) {
            console.log("Invalid user message");
        }

        handleOperation(ws, data);
    });

});

wss.broadcast = function (actors){
    for(let ws of this.clients){
        if (ws.userState === 'game') {
            if (ws.player === null) {
                throw "what the failure";
            }
            try {
                ws.send(generateGameData(mainGame.world.generateDrawableActors(ws.player)));
            }catch (e) {

            }
        }

    }
};


var mainGame = new gameModel.Game(wss, dbc);
mainGame.start();

console.log('Main game created');





app.listen(port, function() {
    console.log('FTD starting listening on port ' + port);
});

