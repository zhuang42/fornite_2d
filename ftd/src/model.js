/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Convert an vector to angle (raduis)*/
function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var rad = Math.atan2(dy, dx); // range (-PI, PI]
    return rad;
}

/**Get relative mouse position*/
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.x,
        y: evt.clientY - rect.y
    };
}

function getTouchPos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.x,
        y: evt.clientY - rect.y
    };
}


/** Two main shapes used in collision detection*/
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
    }

    set(x, y, /*optional*/ width, /*optional*/ height) {
        this.x = x;
        this.y = y;
        this.width = width || this.width;
        this.height = height || this.height;
        this.right = (this.x + this.width);
        this.bottom = (this.y + this.height);
    }

    within(r) {
        return (r.x <= this.x &&
            r.right >= this.right &&
            r.y <= this.y &&
            r.bottom >= this.bottom);
    }

    overlaps(r) {
        return (this.x < r.right &&
            r.x < this.right &&
            this.y < r.bottom &&
            r.y < this.bottom);
    }
}

class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    set(x, y, /*optional*/ radius) {

        this.x = x;
        this.y = y;
        this.radius = radius || this.radius;
    }

    //Not used
    within(r) {
        // let distance = Math.sqrt((this.x - r.x) * (this.x - r.x) +
        //     (this.y - r.y) * (this.y - r.y));
        //
        // throw 'Not implemented';
    }

    overlaps(r) {

        let distance = Math.sqrt((this.x - r.x) * (this.x - r.x) +
            (this.y - r.y) * (this.y - r.y));

        return r.radius + this.radius > distance;

    }

}

class collisionDetector {
    //This class provide convenient way to detect if two actor collision.
    //To substitute handy way detection implementation.
    //To use collision Detector, each Actor must have attribute shape.
    //Failed to have shape attr will throw error.


    broadDetection(act1, act2) {
        //TODO. To Speed up collision detection
    }

    narrowDetection(act1, act2) {
        let shape1 = act1.shape;
        let shape2 = act2.shape;

        shape1.set(act1.position.x, act1.position.y);
        shape2.set(act2.position.x, act2.position.y);

        if (shape1 instanceof Circle && shape2 instanceof Circle) {
            return shape1.overlaps(shape2);
        } else if (shape1 instanceof Rectangle && shape2 instanceof Rectangle) {
            return shape1.overlaps(shape2);
        }

        if (shape1 instanceof Circle && shape2 instanceof Rectangle) {
            return this.circleRectOverlaps(shape1, shape2);
        } else if (shape1 instanceof Rectangle && shape2 instanceof Circle) {
            return this.circleRectOverlaps(shape2, shape1);
        }
    }

    //https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    circleRectOverlaps(circle, rect) {
        let rect_x = rect.x + rect.width / 2;
        let rect_y = rect.y + rect.height / 2

        let circleDistance_x = Math.abs(circle.x - rect_x);
        let circleDistance_y = Math.abs(circle.y - rect_y);

        if (circleDistance_x > (rect.width / 2 + circle.radius)) {
            return false;
        }
        if (circleDistance_y > (rect.height / 2 + circle.radius)) {
            return false;
        }

        if (circleDistance_x < (rect.width / 2)) {
            return true;
        }
        if (circleDistance_y < (rect.height / 2)) {
            return true;
        }

        let cornerDistance_sq = Math.pow(circleDistance_x - rect.width / 2, 2) +
            Math.pow(circleDistance_y - rect.height / 2, 2);

        return (cornerDistance_sq < Math.pow(circle.radius, 2));
    }

}

class backGround {
    constructor(BGColour, width, height) {
        this.BGCorlor = BGColour;
        this.width = width;
        this.height = height;
        this.image = null;

    }

    generate(ctx) {
        let saved_width = ctx.canvas.width;
        let saved_height = ctx.canvas.height;
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;

        ctx.fillStyle = 'rgba(109,149,62, 0.5)';
        ctx.fillRect(0, 0, this.width, this.height);

        let blockSize = 400;
        var rows = ~~(this.width / blockSize) + 1;
        var columns = ~~(this.height / blockSize) + 1;
        var color = this.BGCorlor;

        ctx.fillStyle = color;
        for (let x = 0, i = 0; i < rows; x += blockSize, i++) {
            ctx.beginPath();
            for (let y = 0, j = 0; j < columns; y += blockSize, j++) {
                ctx.rect(x, y, blockSize * 0.99, blockSize * 0.99);
            }
            ctx.fill();
            ctx.closePath();
        }

        // store the generate map as this image texture
        this.image = new Image();
        this.image.src = ctx.canvas.toDataURL("image/png");
        // clear context

        ctx.canvas.width = saved_width;
        ctx.canvas.height = saved_height;
        ctx = null;

    }

    draw(ctx, x_off, y_off) {
        var dx, dy;
        var dWidth, dHeight;

        let sWidth = ctx.canvas.width;
        let sHeight = ctx.canvas.height;

        dx = 0;
        dy = 0;

        dWidth = sWidth;
        dHeight = sHeight;

        ctx.drawImage(this.image, x_off, y_off, sWidth, sHeight, dx, dy, dWidth, dHeight);

    }

}

//Since change to requestAnimationFrame. FPS does not used
//The main game object, store who is main player, setting up view port
class Game {
    constructor(canvas, currentUser, clientGameSocket) {
        this.canvas = canvas;
        this.FPS = 60;
        this.INTERVAL = 1000 / this.FPS; // milliseconds
        this.STEP = this.INTERVAL / 1000; // seconds
        this.world = new World(WORLD_WIDTH, WORLD_HEIGHT);
        this.world.game = this;
        this.world.background.generate(this.canvas.getContext('2d'));
        this.viewport = new Viewport(canvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.gameMainLoopRequestid = null;
        this.mainPlayer = null;
        this.currentUser = currentUser;
        this.clientGameSocket = clientGameSocket;


        if (this.canvas.getContext) {
            window.addEventListener('resize', () => {
                this.resizeCanvas()
            }, false);
            window.addEventListener('orientationchange', () => {
                this.resizeCanvas()
            }, false);
        }
        this.resizeCanvas();
    }


    resizeCanvas() {
        this.canvas.width = window.innerWidth - 50;
        this.canvas.height = window.innerHeight - 70;
    }


    //Add main player int canvas
    //setting up viewport
    setMainPlayer(player) {
        this.world.addPlayer(player);
        this.viewport.follow(player);
        this.mainPlayer = player;
    }

    unsetMainPlayer() {
        this.viewport.follow(null);
        this.mainPlayer = null;
    }

    //The game takes one step, tell world take one step
    step() {
        this.resizeCanvas();
        this.viewport.update();
    }

    //pass context to world to draw
    draw() {
        let ctx = this.canvas.getContext('2d');
        this.world.draw(ctx, this.viewport.xView, this.viewport.yView);
    }

    loop() {
        this.step();
        this.draw();
        //New feature
        this.gameMainLoopRequestid = requestAnimationFrame(() => {
            this.loop()
        });
    }

    start() {
        this.loop();
    }


    //The end of game
    end() {
        cancelAnimationFrame(
            this.gameMainLoopRequestid);
        this.gameMainLoopRequestid = null;
        this.draw();
    }

    setPlayerEventListener() {
        window.addEventListener("keydown", (event) => {

            let id = this.currentUser.info.userid;

            let dummyevent = {};
            dummyevent.type = "keydown";
            dummyevent.keyCode = event.keyCode;

            if (id) {
                this.clientGameSocket.send("event", id, dummyevent);
            }

        });

        window.addEventListener("keyup", (event) => {

            let id = this.currentUser.info.userid;

            let dummyevent = {};
            dummyevent.type = "keyup";
            dummyevent.keyCode = event.keyCode;

            if (id) {
                this.clientGameSocket.send("event", id, dummyevent);
            }

        });

        this.canvas.addEventListener("mousemove", (event) => {

            let id = this.currentUser.info.userid;
            let player = this.mainPlayer;

            if (!id || !player) {
                return;
            }
            let c = getMousePos(this.canvas, event);

            let player_x = this.mainPlayer.position.x;
            let player_y = this.mainPlayer.position.y;

            let abs_x = c.x + this.viewport.xView;
            let abs_y = c.y + this.viewport.yView;

            let direction = new Pair(abs_x - player_x, abs_y - player_y);


            let dummyevent = {};
            dummyevent.type = "mousemove";
            dummyevent.direction = direction;

            this.clientGameSocket.send("event", id, dummyevent);
            //console.log(player.direction);
        });


        this.canvas.addEventListener("touchmove", (event) => {
            event.preventDefault();

            let id = this.currentUser.info.userid;
            let player = this.mainPlayer;

            if (!id || !player) {
                return;
            }

            let touch = event.touches[0];

            let c = getTouchPos(this.canvas, touch);

            let player_x = this.mainPlayer.position.x;
            let player_y = this.mainPlayer.position.y;

            let abs_x = c.x + this.viewport.xView;
            let abs_y = c.y + this.viewport.yView;

            let direction = new Pair(abs_x - player_x, abs_y - player_y);


            let dummyevent = {};
            dummyevent.type = "mousemove";
            dummyevent.direction = direction;

            this.clientGameSocket.send("event", id, dummyevent);
        });

        this.canvas.addEventListener("mousedown", (event) => {


            let id = this.currentUser.info.userid;

            let dummyevent = {};
            dummyevent.type = "mousedown";

            if (id) {
                this.clientGameSocket.send("event", id, dummyevent);
            }
        });

        this.canvas.addEventListener("mouseup", (event) => {
            let id = this.currentUser.info.userid;

            let dummyevent = {};
            dummyevent.type = "mouseup";

            if (id) {
                this.clientGameSocket.send("event", id, dummyevent);
            }
        });


        let tapedTwice = false;

        const tapHandler = (event) => {
            if (!tapedTwice) {
                tapedTwice = true;
                setTimeout(function () {
                    tapedTwice = false;
                }, 300);
                return false;
            }
            event.preventDefault();
            //action on double tap goes below

            let id = this.currentUser.info.userid;

            let dummyevent = {};
            dummyevent.type = "keydown";
            dummyevent.keyCode = 82;
            if (id) {
                this.clientGameSocket.send("event", id, dummyevent);
            }
            return true;

        };

        this.canvas.addEventListener("touchstart", (event) => {
            event.preventDefault();
            let id = this.currentUser.info.userid;

            if (id) {

                if (tapHandler(event)) {
                    return;
                }


                if (event.touches.length === 2) {
                    let dummyevent2 = {};
                    dummyevent2.type = "keydown";
                    dummyevent2.keyCode = 70;
                    this.clientGameSocket.send("event", id, dummyevent2);
                    return;
                }


                let dummyevent = {};
                dummyevent.type = "mousedown";

                let touch = event.touches[0];

                let c = getTouchPos(this.canvas, touch);

                let player_x = this.mainPlayer.position.x;
                let player_y = this.mainPlayer.position.y;

                let abs_x = c.x + this.viewport.xView;
                let abs_y = c.y + this.viewport.yView;

                let direction = new Pair(abs_x - player_x, abs_y - player_y);
                dummyevent.direction = direction;

                this.clientGameSocket.send("event", id, dummyevent);
            }
        });


        this.canvas.addEventListener("touchend", (event) => {
            event.preventDefault();

            let dummyevent = {};
            dummyevent.type = "mouseup";


            let id = this.currentUser.info.userid;
            if (id) {
                this.clientGameSocket.send("event", id, dummyevent);
            }
        });


        function round(a) {
            // return Math.round(100*a)/100;
            return Math.round(a);
        }


        if (window.DeviceMotionEvent) {
            let left = false;
            let right = false;
            let up = false;
            let down = false;
            let sens = 2;


            console.log("DeviceMotionEvent supported");
            window.ondevicemotion = (event) => {
                event.preventDefault();

                let id = this.currentUser.info.userid;
                let player = this.mainPlayer;
                if (!id) {
                    return;
                }
                let dummyevent = {};

                let agx = round(event.accelerationIncludingGravity.x);
                let agy = round(event.accelerationIncludingGravity.y);


                if (agx <= -sens) {
                    //SEND LEFT
                    if (!left) {
                        dummyevent.type = "keydown";
                        dummyevent.keyCode = 65;
                        this.clientGameSocket.send("event", id, dummyevent);
                        left = true;
                    }
                } else {
                    if (left) {
                        dummyevent.type = "keyup";
                        dummyevent.keyCode = 65;
                        this.clientGameSocket.send("event", id, dummyevent);
                        left = false;
                    }
                }


                if (agx >= sens) {
                    //SEND LEFT
                    if (!right) {
                        dummyevent.type = "keydown";
                        dummyevent.keyCode = 68;
                        this.clientGameSocket.send("event", id, dummyevent);
                        right = true;
                    }
                } else {
                    if (right) {
                        dummyevent.type = "keyup";
                        dummyevent.keyCode = 68;
                        this.clientGameSocket.send("event", id, dummyevent);
                        right = false;
                    }
                }


                if (agy <= -sens) {
                    //SEND DOWN
                    if (!down) {
                        dummyevent.type = "keydown";
                        dummyevent.keyCode = 83;
                        this.clientGameSocket.send("event", id, dummyevent);
                        down = true;
                    }
                } else {
                    if (down) {
                        dummyevent.type = "keyup";
                        dummyevent.keyCode = 83;
                        this.clientGameSocket.send("event", id, dummyevent);
                        down = false;
                    }
                }


                if (agy >= sens) {
                    //SEND TOP
                    if (!up) {
                        dummyevent.type = "keydown";
                        dummyevent.keyCode = 87;
                        this.clientGameSocket.send("event", id, dummyevent);
                        up = true;
                    }
                } else {
                    if (up) {
                        dummyevent.type = "keyup";
                        dummyevent.keyCode = 87;
                        this.clientGameSocket.send("event", id, dummyevent);
                        up = false;
                    }
                }

                if (!player) {
                    let threshold = 14;
                    let ax = round(event.acceleration.x);
                    let ay = round(event.acceleration.y);
                    let az = round(event.acceleration.z);

                    if (ax > threshold || ay > threshold || az > threshold) {
                        this.clientGameSocket.send("start", id);

                    }
                }
            }
        }
    }
}

class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        //The drawing sequence
        this.actors = {};
        this.background = new backGround('rgb(128, 175, 71)', this.width, this.height);
        this.collisionDetector = new collisionDetector();
        //All color used
        this.images = {
            crate: document.getElementById('crate'),
            goldenCrate: document.getElementById('goldenCrate'),
            house: document.getElementById('house1'),
            mansion: document.getElementById('mansion'),
            stone1: document.getElementById('stone1'),
            stone2: document.getElementById('stone2'),
            bed: document.getElementById('bed1'),
            tree1: document.getElementById('tree1'),
            bush1: document.getElementById('bush1'),
            toilet: document.getElementById('toilet')
        };
        this.playerCount = 0;
    }


    clearWorld() {
        this.actors = {};
        this.playerCount = 0;
    }


    addServerActors(serverActors, username) {
        if (!this.game.currentUser.info.userid) {
            return;
        }

        this.game.unsetMainPlayer();

        for (var key in serverActors) {
            //if (this.actors.hasOwnProperty(key)) {
            let acts = serverActors[key];
            for (var i = 0; i < acts.length; i++) {
                let server_actor = acts[i];
                let position = new Pair(server_actor.position.x, server_actor.position.y);

                let a = null;

                //let position = new Pair(30, 30);
                switch (key) {
                    case "Floor":
                        a = new Floor(this, position, server_actor.shape.height, server_actor.shape.width, server_actor.colour);
                        this.addActor(a);
                        break;
                    case "Projectile_556":
                        a = new Projectile_556(this, position);
                        this.addActor(a);
                        break;

                    case "Projectile_762":
                        a = new Projectile_762(this, position);
                        this.addActor(a);
                        break;

                    case "Projectile_shotGunShell":
                        a = new Projectile_shotGunShell(this, position);
                        this.addActor(a);
                        break;
                    case "Ammo_556":
                        a = new Ammo_556(this, position);
                        this.addActor(a);
                        break;
                    case "Ammo_762":
                        a = new Ammo_762(this, position);
                        this.addActor(a);
                        break;
                    case "Ammo_shotGunShell":
                        a = new Ammo_shotGunShell(this, position);
                        this.addActor(a);
                        break;
                    case "Weapon_AK47":
                        a = new Weapon_AK47(this, position);
                        this.addActor(a);
                        break;
                    case "Weapon_M416":
                        a = new Weapon_M416(this, position);
                        this.addActor(a);
                        break;

                    case "Weapon_S686":
                        a = new Weapon_S686(this, position);
                        this.addActor(a);
                        break;
                    case "Player":
                        this.playerCount += 1;
                        a = new Player(this, position, server_actor.speed, server_actor.width, server_actor.height, server_actor.color);
                        a.changeDirection(server_actor.direction);
                        a.inventory = server_actor.inventory;
                        a.healthPoint = server_actor.healthPoint;
                        a.id = server_actor.id;

                        if (server_actor.curr_weapon) {
                            let w = new Weapon(this, server_actor.curr_weapon.position, server_actor.curr_weapon.shape,
                                server_actor.curr_weapon.ammo, server_actor.curr_weapon.max_ammo, null, null, null, null, server_actor.curr_weapon.colour);
                            w.name = server_actor.curr_weapon.name;
                            a.curr_weapon = w;

                        }

                        if (server_actor.id === this.game.currentUser.info.userid) {
                            this.game.setMainPlayer(a);
                            break;
                        }

                        this.addActor(a);
                        break;
                    case "aimbotAI":
                        break;

                    case "randomAI":
                        break;
                    case "circleWall":
                        a = new circleWall(this, position, server_actor.shape.radius);
                        this.addActor(a);
                        break;
                    case "rectWall":
                        a = new rectWall(this, position, server_actor.shape.height, server_actor.shape.width);
                        this.addActor(a);
                        break;

                    case "Crate":
                        a = new Crate(this, position, server_actor.shape.height, server_actor.shape.width);
                        this.addActor(a);
                        break;
                    case "goldenCrate":
                        a = new goldenCrate(this, position, server_actor.shape.height, server_actor.shape.width);
                        this.addActor(a);
                        break;

                    case "Stone":
                        a = new Stone(this, position, server_actor.shape.radius);
                        this.addActor(a);
                        break;

                    case "Tree":
                        a = new Tree(this, position, server_actor.shape.radius);
                        this.addActor(a);
                        break;

                    case "Bush":
                        a = new Bush(this, position, server_actor.shape.radius);
                        this.addActor(a);
                        break;

                    case "Bed":
                        a = new Bed(this, position, server_actor.shape.height, server_actor.shape.width);
                        this.addActor(a);

                        break;
                    case "Toilet":
                        a = new Toilet(this, position, server_actor.shape.height, server_actor.shape.width);
                        this.addActor(a);
                        break;
                    case "House":
                        a = new House(this, position, server_actor.shape.height, server_actor.shape.width);
                        if (this.game.mainPlayer) {
                            a.detectPlayer(this.game.mainPlayer);
                        }
                        this.addActor(a);
                        break;

                    case "Mansion":
                        a = new Mansion(this, position, server_actor.shape.height, server_actor.shape.width);
                        if (this.game.mainPlayer) {
                            a.detectPlayer(this.game.mainPlayer);
                        }
                        this.addActor(a);
                        break;

                    default:
                        break;
                }
            }
        }
    }


    addPlayer(player) {
        this.addActor(player);
        this.player = player;
    }

    removePlayer() {
        if (this.player) {
            this.removeActor(this.player);
            this.player = null;
        }
    }

    addActor(actor) {
        //console.log(actor.constructor.name);
        if (this.actors[actor.constructor.name] === undefined) {
            this.actors[actor.constructor.name] = [];
        }

        this.actors[actor.constructor.name].push(actor);
    }

    removeActor(actor) {
        var index = this.actors[actor.constructor.name].indexOf(actor);
        if (index !== -1) {
            this.actors[actor.constructor.name].splice(index, 1);
        }
    }

    // return the first actor at coordinates (x,y) return null if there is no such actor

    step(steps) {

    }

    //Draw whole world
    draw(ctx, x_off, y_off) {

        let cwidth = ctx.canvas.width;
        let cheight = ctx.canvas.height;

        //console.log(cwidth, cheight);
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.save();
        //Draw background
        this.background.draw(ctx, x_off, y_off);
        ctx.restore();

        let boundary = 500;
        //console.log(this.actors);
        for (var key in this.actors) {


            let acts = this.actors[key];
            for (var i = 0; i < acts.length; i++) {
                if (x_off - boundary < acts[i].position.x && acts[i].position.x < x_off + cwidth + boundary && y_off - boundary < acts[i].position.y && acts[i].position.y < boundary + y_off + cheight) {
                    ctx.save();
                    acts[i].draw(ctx, x_off, y_off);
                    ctx.restore();
                }
            }


        }
        //Draw player HUD
        if (this.game.mainPlayer) {
            this.game.mainPlayer.hud.draw(ctx, x_off, y_off);
        }

    }


    getPlayerNum() {
        return this.playerCount;
    }


}

//View port, follow player to adjust  view
class Viewport {
    constructor(canvas, x, y, wwidth, wheight) {
        this.canvas = canvas;
        // the world width and world height
        this.world_width = wwidth;
        this.world_height = wheight;
        this.xView = x;
        this.yView = y;
        this._followed = null;

        this.vpRect = new Rectangle(this.xView, this.yView, this.canvas.width, this.canvas.height);
        this.worldRect = new Rectangle(0, 0, this.world_width, this.world_height);

    }

    get followed() {
        return this._followed;
    }

    set followed(actor) {
        this._followed = actor;
    }

    follow(actor) {
        this.followed = actor;
    }

    update() {
        if (this.followed) {
            //update x and y
            let act_x = this.followed.position.x;
            let act_y = this.followed.position.y;
            let View_width = this.canvas.width;
            let View_height = this.canvas.height;

            this.xView = act_x - View_width / 2;
            this.yView = act_y - View_height / 2;

            this.vpRect.set(this.xView, this.yView, View_width, View_height);

            if (!this.vpRect.within(this.worldRect)) {
                if (this.vpRect.x < this.worldRect.x)
                    this.xView = this.worldRect.x;
                if (this.vpRect.y < this.worldRect.y)
                    this.yView = this.worldRect.y;
                if (this.vpRect.right > this.worldRect.right)
                    this.xView = this.worldRect.right - View_width;
                if (this.vpRect.bottom > this.worldRect.bottom)
                    this.yView = this.worldRect.bottom - View_height;
            }

        }

    }

}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "(" + this.x + "," + this.y + ")";
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    normalize(m) {
        let magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x = (this.x / magnitude) * m;
        this.y = (this.y / magnitude) * m;

    }

    distance(p) {
        let x = p.x - this.x;
        let y = p.y - this.y;
        return Math.sqrt(x * x + y * y);
    }

    directionOf(p) {
        return new Pair(p.x - this.x, p.y - this.y);
    }
}

//actor class, it is abstract
class Actor {
    constructor(world, position, shape) {
        this.world = world;
        this.position = position;
        this.shape = shape;
    }

    toString() {

    }

    step(steps) {
        throw "Not Implemented Yet";
    }

    draw(ctx, x, y) {

        if (this.shape instanceof Rectangle) {
            ctx.translate(-x, -y);
            ctx.fillRect(this.position.x, this.position.y, this.shape.width, this.shape.height);
        } else if (this.shape instanceof Circle) {
            ctx.beginPath();
            ctx.arc(this.position.x - x, this.position.y - y, this.shape.radius, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.shape.x = x;
        this.shape.y = y;
    }

}

//TODO, SEND MESSAGE TO SERVER
class Control {
    constructor() {
        this._left = false;
        this._up = false;
        this._right = false;
        this._down = false;
        this._fire = false;
    }

    get fire() {
        return this._fire;
    }

    set fire(value) {
        this._fire = value;
    }

    get left() {
        return this._left;
    }

    set left(value) {
        this._left = value;
    }

    get up() {
        return this._up;
    }

    set up(value) {
        this._up = value;
    }

    get right() {
        return this._right;
    }

    set right(value) {
        this._right = value;
    }

    get down() {
        return this._down;
    }

    set down(value) {
        this._down = value;
    }

}

//Player, user control it
class Player extends Actor {
    constructor(world, position, speed, width, height, color) {

        let shape = new Circle(position.x, position.y, width);

        super(world, position, shape);

        //Num of pixels per second
        this.speed = speed;
        this.controls = new Control();
        this.width = width;
        this.height = height;
        this.color = color;

        this.inventory = {
            Projectile_556: 100,
            Projectile_762: 100,
            Projectile_shotGunShell: 100

        };

        //it is relative positions
        this.direction = new Pair(position.x, position.y);

        this.weapon1 = null;
        this.weapon2 = null;
        this.curr_weapon = null;

        this.healthPoint = 100;
        this.maxHealthPoint = 100;

        this.hud = new playerHUD(this);

        this.stats = new playerGameStats(this);

    }

    resetPlayer() {
        this.weapon1 = null;
        this.weapon2 = null;
        this.curr_weapon = null;

        this.healthPoint = 100;
        this.inventory = {
            Projectile_556: 100,
            Projectile_762: 100,
            Projectile_shotGunShell: 100

        };

    }

    //If event happen, pick the nearest one thing
    pickup() {

        let ams = this.world.getActorApproByType(this, ammos);
        for (let i = 0; i < ams.length; i++) {
            this.addAmmo(ams[i]);
            return;
        }

        let ws = this.world.getActorApproByType(this, weapons);
        for (let i = 0; i < ws.length; i++) {
            this.assignWeapon(ws[i]);
            return;
        }

    }

    // Add ammo into self inventory
    addAmmo(ammo_ojb) {
        this.world.removeActor(ammo_ojb);

        if (this.inventory[ammo_ojb.ammo_type.name]) {
            this.inventory[ammo_ojb.ammo_type.name] += ammo_ojb.ammo;
        } else {
            this.inventory[ammo_ojb.ammo_type.name] = ammo_ojb.ammo;
        }

    }

    switchWeapon(int) {
        if (int === 1) {
            this.curr_weapon = this.weapon1;
            return;
        }
        if (int === 2) {
            this.curr_weapon = this.weapon2;
        }

    }

    //assign a weapon to player from ground
    assignWeapon(weapon) {

        weapon.owner = this;

        this.world.removeActor(weapon);
        if (!this.weapon1) {
            this.weapon1 = weapon;
            this.curr_weapon = this.weapon1;
            return;
        }

        if (!this.weapon2) {
            this.weapon2 = weapon;
            this.curr_weapon = this.weapon2;
            return;
        }

        if (this.curr_weapon === this.weapon1) {
            //TODO DROP WEAPON
            this.world.addActor(this.weapon1);
            this.weapon1.owner = null;

            this.weapon1 = weapon;
            this.curr_weapon = this.weapon1;

            return;
        }

        if (this.curr_weapon === this.weapon2) {
            this.world.addActor(this.weapon2);
            this.weapon2.owner = null;

            this.weapon2 = weapon;
            this.curr_weapon = this.weapon2;
            return;
        }

        throw "assign weapon error";

    }

    reload() {
        if (!this.curr_weapon) {
            return;
        }
        if (this.inventory[this.curr_weapon.ammo_type.name]) {
            //console.log(this.curr_weapon.ammo);
            let ammo_num = this.inventory[this.curr_weapon.ammo_type.name];
            this.inventory[this.curr_weapon.ammo_type.name] = this.curr_weapon.reload(ammo_num);
        }

    }

    //Shot at current direction
    shot() {
        if (!this.curr_weapon) {
            return;
        }
        this.curr_weapon.fire(this.direction);
    }

    changeDirection(position) {
        this.direction.x = position.x;
        this.direction.y = position.y;
        this.direction.normalize(1);

    }

    takeDamage(dmg) {
        if (this.healthPoint == 0) {
            return;
        }
        this.healthPoint = ((this.healthPoint - dmg) < 0 ? 0 : (this.healthPoint - dmg));

    }

    isDie() {
        return this.healthPoint <= 0;
    }


    draw(ctx, x_off, y_off) {


        let a = angle(this.position.x, this.position.y, this.position.x + this.direction.x, this.position.y + this.direction.y);

        ctx.translate(this.position.x - x_off, this.position.y - y_off);
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.font = "15px Arial";
        ctx.fillText(this.id, -10, 40);


        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 4;
        ctx.rotate(a);

        ctx.beginPath();
        ctx.arc(0, 0, this.shape.radius, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        this.drawWeapon(ctx, this.position.x - 25, this.position.y);

    }

    drawWeapon(ctx, x_off, y_off) {
        if (this.curr_weapon) {
            //draw hands
            ctx.beginPath();
            ctx.arc(this.width + 3, -3, 5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(this.width + 23, 10, 5, 0, 2 * Math.PI, false);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            this.curr_weapon.draw(ctx, x_off, y_off);

        } else {
            //draw hands
            ctx.beginPath();
            ctx.arc(this.width, this.height, 5, 0, 2 * Math.PI, false);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(this.width, -this.height, 5, 0, 2 * Math.PI, false);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    }

    toStringHealthPoint() {
        return this.healthPoint + "/" + this.maxHealthPoint;
    }

}

//Player HUD
class playerHUD {
    constructor(player) {
        this.player = player;

    }

    draw(ctx, x, y) {
        ctx.save();
        this.drawAmmoHud(ctx, x, y);
        ctx.restore();
        ctx.save();
        this.drawHeathBarHud(ctx, x, y);
        ctx.restore();
        ctx.save();
        this.drawInventoryHud(ctx, x, y);
        ctx.restore();
        ctx.save();
        this.drawMiniMap(ctx, x, y);
        ctx.restore();
    }

    drawInventoryHud(ctx, x, y) {
        let canvas_width = ctx.canvas.width;
        let width = 150;
        var num_item = 0;
        let col_height = 20;
        for (let key in this.player.inventory) {
            num_item++;
        }

        ctx.strokeStyle = 'rgb(0,0,0)'
        ctx.fillStyle = 'rgba(255,255,255,0.3)';

        ctx.beginPath();
        ctx.rect(canvas_width - width, 0, width, (num_item + 1) * col_height);
        ctx.stroke();
        ctx.closePath();

        ctx.fillRect(canvas_width - width, 0, width, (num_item + 1) * col_height);

        num_item = 0;
        ctx.font = "15px Arial";
        ctx.fillStyle = 'rgb(0,0,0)';
        for (let key in this.player.inventory) {
            //console.log(classnameToName[key] + " -> " + this.player.inventory[key]);
            ctx.fillText(classnameToName[key] + " -> " + this.player.inventory[key], canvas_width - width + 5, (num_item + 1) * col_height);
            num_item++;
        }

    }

    drawHeathBarHud(ctx, x, y) {
        let canvas_height = ctx.canvas.height;

        let width = 200;
        let height = 30;

        let healthBarwidth = (this.player.healthPoint / this.player.maxHealthPoint) * width;
        ctx.fillStyle = 'rgb(0,255,0)';
        ctx.fillRect(0, canvas_height - height, healthBarwidth, height);

        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.font = "30px Arial";
        ctx.fillText(this.player.toStringHealthPoint(), 0, canvas_height - height + 25);

        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        ctx.rect(0, canvas_height - height, width, height);
        ctx.stroke();
    }

    drawAmmoHud(ctx, x, y) {

        let canvas_width = ctx.canvas.width;
        let canvas_height = ctx.canvas.height;
        let width = 200;
        let height = 100;
        ctx.fillStyle = 'rgbA(255,255,255, 0.1)';
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        ctx.rect(canvas_width - width, canvas_height - height, width, height);
        ctx.stroke();
        ctx.fill();
        //Draw ammo

        ctx.font = "30px Arial";
        ctx.fillStyle = 'rgb(0,0,0)';
        if (this.player.curr_weapon) {
            ctx.fillText(this.player.curr_weapon.toString(), canvas_width - width + 5, canvas_height - height + 30);
            ctx.fillText("" + this.player.curr_weapon.toAmmo(), canvas_width - width + 5, canvas_height - height + 2 * 30);
        }

    }

    drawMiniMap(ctx, x, y) {

        let canvas_width = ctx.canvas.width;
        let canvas_height = ctx.canvas.height;
        let width = 200;
        let height = 50;
        ctx.fillStyle = 'rgbA(255,255,255, 0.1)';
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.stroke();
        ctx.fill();

        ctx.font = "20px Arial";
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fillText("Player Nearby: " + (this.player.world.getPlayerNum() - 1), 5, 30);

    }
}

//Player stats
class playerGameStats {
    constructor(player) {
        this.damageTaken = 0;
        this.damageDone = 0;
        this.kill = 0;
        this.killList = [];
        this.killed = null;
    }

    recordDamageTaken(dmg) {
        this.damageTaken += dmg;
    }

    recordDamageDone(dmg) {
        this.damageDone += dmg;
    }

    recordKill(player) {
        this.kill += 1;
        this.killList.push(player);
    }

    recordKilled(player) {
        this.killed = player;

    }

}

//AI, use a state machine to control itself
class aimbotAI extends Player {
    constructor(world, position, speed, width, height, color, reactionTime, stepsBeforeChangeDirection) {
        super(world, position, speed, width, height, color);

        this.controls = new Control();

        this.stateMachine = new aimbotStateMachine(this, this.controls, reactionTime, stepsBeforeChangeDirection);

        this.stateMachine.start();

        this.inventory = {
            Projectile_556: 1000,
            Projectile_762: 1000,
            Projectile_shotGunShell: 1000

        };

        let w = this.world.randomGenerateWeapon(this.position.x, this.position.y);
        w.owner = this;
        this.weapon1 = w;
        this.curr_weapon = this.weapon1;
    }

    step(steps) {
        if (this.isDie()) {
            this.stateMachine.stop();
        }
        super.step(steps);
    }
}

class randomAI extends Player {
    constructor(world, position, speed, width, height, color, reactionTime, stepsBeforeChangeDirection) {
        super(world, position, speed, width, height, color);

        this.controls = new Control();

        this.stateMachine = new randomStateMachine(this, this.controls, reactionTime, stepsBeforeChangeDirection);

        this.stateMachine.start();

        this.inventory = {
            Projectile_556: 1000,
            Projectile_762: 1000,
            Projectile_shotGunShell: 1000

        };

        let w = this.world.randomGenerateWeapon(this.position.x, this.position.y);
        w.owner = this;
        this.weapon1 = w;
        this.curr_weapon = this.weapon1;
    }

    step(steps) {
        if (this.isDie()) {
            this.stateMachine.stop();
        }
        super.step(steps);
    }
}

//Abstract CSM
class controlStateMachine {
    constructor(player, controls, reactionTime, stepsBeforeChangeDirection) {
        this.controls = controls;
        this.reactionTime = reactionTime;
        this.state = 'move';
        this.reactionTimerId = null;
        this.player = player;
        this.stepsBeforeChangeDirection = stepsBeforeChangeDirection;
        this.steps = this.stepsBeforeChangeDirection;
    }

    randomChangeMovingDirection() {
        let d = getRandomInt(1, 4);

        this.stopMove();
        switch (d) {
            case 1:
                this.controls.left = true;
                break;
            case 2:
                this.controls.right = true;
                break;
            case 3:
                this.controls.up = true;
                break;
            case 4:
                this.controls.down = true;
                break;
            default:
                break;
        }
    }

    stopMove() {
        this.controls.left = false;
        this.controls.right = false;
        this.controls.up = false;
        this.controls.down = false;

    }

    fire() {
        this.controls.fire = true;
    }

    stopFire() {

        this.controls.fire = false;
    }

    action() {

    }

    start() {
        this.reactionTimerId = setInterval(() => this.action(), this.reactionTime);
    }

    stop() {
        clearInterval(this.reactionTimerId);
    }

}

//Implement action, to let AI start moving and firing
class aimbotStateMachine extends controlStateMachine {
    action() {

        //State: move
        let playerNear = this.player.world.getPlayerNearby(this.player, 600);

        switch (this.state) {
            case "move":
                this.steps--;
                if (playerNear.length === 0) {
                    //continue moving
                    if (this.steps <= 0) {
                        this.randomChangeMovingDirection();
                        this.steps = this.stepsBeforeChangeDirection;
                    }
                } else {
                    this.state = 'fire';
                }
                break;
            case 'fire':
                this.steps--;
                if (this.steps <= 0) {
                    this.randomChangeMovingDirection();
                    this.steps = this.stepsBeforeChangeDirection;
                }

                if (playerNear.length === 0) {
                    this.state = 'move';
                    this.stopFire();
                } else if (this.player.curr_weapon.magzineEmpty()) {
                    this.state = 'reload';
                    this.stopFire();
                } else {
                    this.player.changeDirection(this.player.position.directionOf(playerNear[0].position));
                    this.fire();
                }
                break;
            case 'reload':
                this.player.reload();
                this.state = 'fire';
                break;

            default:
        }
    }

}

class randomStateMachine extends controlStateMachine {

    action() {

        switch (this.state) {
            case "move":
                this.steps--;
                if (this.steps <= 0) {
                    this.randomChangeMovingDirection();
                    this.steps = this.stepsBeforeChangeDirection;
                } else {
                    this.state = 'fire';
                }
                break;
            case 'fire':
                this.steps--;
                if (this.steps <= 0) {
                    this.randomChangeMovingDirection();
                    this.player.changeDirection(new Pair(getRandomInt(-255, 255), getRandomInt(-255, 255)));
                    this.steps = this.stepsBeforeChangeDirection;
                } else if (this.player.curr_weapon.magzineEmpty()) {
                    this.state = 'reload';
                    this.stopFire();
                } else {
                    this.fire();
                }
                break;
            case 'reload':
                this.player.reload();
                this.state = 'move';
                break;

            default:
        }
    }

}

class Nonitem extends Actor {

}

class Item extends Actor {
    constructor(world, position, shape) {
        super(world, position, shape);
        this.player = null;
    }

    assignPlayer(player) {
        this.player = player;
    }
}

//Weapon class, abstract
class Weapon extends Item {
    constructor(world, position, shape, ammo, max_ammo, damage, speed, firerate, ammo_type, colour, owner, range) {
        super(world, position, shape);
        this.ammo = ammo;
        this.max_ammo = max_ammo;
        this.damage = damage;
        this.speed = speed;
        this.firerate = firerate; //millsecond
        this.readytofire = true;
        this.ammo_type = ammo_type; //class construcor
        this.colour = colour;
        this.range = range;
        this.owner = owner;
        this.name = null;

    }


    toString() {
        return this.name;
    }

    toAmmo() {
        return this.ammo + "/" + this.max_ammo;
    }

    draw(ctx, x, y) {
        ctx.translate(-x, -y);
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.position.x, this.position.y, this.shape.width, this.shape.height);

        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.shape.width, this.shape.height);
        ctx.closePath();
        ctx.stroke();
    }

}

//Concrete Weapon class, have differentpropertyy
class Weapon_M416 extends Weapon {

    constructor(world, position, owner) {

        let shape = new Rectangle(position.x, position.y, 30, 6);
        let ammo = 30;
        let max_ammo = 30;
        let damage = 20;
        let speed = 1800;
        let firerate = 50;
        let ammo_type = Projectile_556;
        let colour = 'rgb(255,0,0)';
        let range = 2000;

        super(world, position, shape, ammo, max_ammo, damage, speed, firerate, ammo_type, colour, owner, range);

    }

}

class Weapon_AK47 extends Weapon {

    constructor(world, position, owner) {

        let shape = new Rectangle(position.x, position.y, 30, 6);
        let ammo = 30;
        let max_ammo = 30;
        let damage = 20;
        let speed = 1400;
        let firerate = 30;
        let ammo_type = Projectile_762;
        let colour = 'rgb(0,255,0)';
        let range = 1000;

        super(world, position, shape, ammo, max_ammo, damage, speed, firerate, ammo_type, colour, owner, range);

    }

}

class Weapon_S686 extends Weapon {
    constructor(world, position, owner) {

        let shape = new Rectangle(position.x, position.y, 30, 6);
        let ammo = 5;
        let max_ammo = 5;
        let damage = 40;
        let speed = 800;
        let firerate = 500;
        let ammo_type = Projectile_shotGunShell;
        let colour = 'rgb(0,0,255)';
        let range = 800;

        super(world, position, shape, ammo, max_ammo, damage, speed, firerate, ammo_type, colour, owner, range);

    }


}

//Abstract Projectile class
class Projectile extends Nonitem {
    constructor(world, position, shape, direction_position, speed, colour, owner, dmg, range) {
        super(world, position, shape);

        this.speed = speed;

        this.colour = colour;
        this.owner = owner;
        this.damage = dmg;
        this.range = range;
    }


    draw(ctx, x_off, y_off) {
        ctx.fillStyle = this.colour;
        // ctx.fillRect(this.x, this.y, this.radius,this.radius);
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.shape.width, this.shape.height);
        ctx.closePath();
        ctx.stroke();
        super.draw(ctx, x_off, y_off);

    }
}

//Three class of Projectile
class Projectile_shotGunShell extends Projectile {
    constructor(world, position, direction_position, speed, owner, dmg, range) {
        let shape = new Circle(position.x, position.y, 5);
        let colour = 'rgb(0,0,255)';
        super(world, position, shape, direction_position, speed, colour, owner, dmg, range);
    }

}

class Projectile_556 extends Projectile {
    constructor(world, position, direction_position, speed, owner, dmg, range) {

        let shape = new Circle(position.x, position.y, 5);
        let colour = 'rgb(255,0,0)';
        super(world, position, shape, direction_position, speed, colour, owner, dmg, range);
    }
}

class Projectile_762 extends Projectile {
    constructor(world, position, direction_position, speed, owner, dmg, range) {

        let shape = new Circle(position.x, position.y, 5);
        let colour = 'rgb(0,255,0)';
        super(world, position, shape, direction_position, speed, colour, owner, dmg, range);
    }
}

//Abstract ammo class, can be pick up
class Ammo extends Item {
    constructor(world, position, shape, ammo_type, ammo, colour) {
        super(world, position, shape);
        this.ammo_type = ammo_type;
        this.ammo = ammo;
        this.colour = colour;
    }

    step(s) {

    }

    draw(ctx, x, y) {

        ctx.fillStyle = this.colour;
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x - x, this.position.y - y, this.shape.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.position.x - x, this.position.y - y, this.shape.radius / 2, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.closePath();
    }
}

//Three type of Ammo class
class Ammo_556 extends Ammo {
    constructor(world, position, ammo) {
        let shape = new Circle(position.x, position.y, 10);
        let ammo_type = Projectile_556;
        let colour = 'rgb(255,0,0)';
        super(world, position, shape, ammo_type, ammo, colour);
    }

    draw(ctx, x, y) {
        super.draw(ctx, x, y);
    }

}

class Ammo_762 extends Ammo {
    constructor(world, position, ammo) {
        let shape = new Circle(position.x, position.y, 10);
        let ammo_type = Projectile_762;
        let colour = 'rgb(0,255,0)';
        super(world, position, shape, ammo_type, ammo, colour);
    }

    draw(ctx, x, y) {
        super.draw(ctx, x, y);
    }

}

class Ammo_shotGunShell extends Ammo {
    constructor(world, position, ammo) {
        let shape = new Circle(position.x, position.y, 10);
        let ammo_type = Projectile_shotGunShell;
        let colour = 'rgb(0,0,255)';
        super(world, position, shape, ammo_type, ammo, colour);
    }

    draw(ctx, x, y) {
        super.draw(ctx, x, y);
    }

}

//Abstract class
class Nonmovable extends Nonitem {

    step(steps) {
    }
}

class Wall extends Nonmovable {
    constructor(world, position, shape, colour) {
        super(world, position, shape);
        this.colour = colour;
    }

    step(steps) {

    }

}

//A wall shaped as circle
class circleWall extends Wall {
    constructor(world, position, radius) {
        let shape = new Circle(position.x, position.y, radius);
        super(world, position, shape);
        this.colour = 'rgb(153, 102, 0)';
    }

    draw(ctx, x, y) {
        ctx.fillStyle = this.colour;
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 4;
        ctx.translate(-x, -y);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.shape.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.shape.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();

    }

}

//A wall shaped as Rect
class rectWall extends Wall {
    constructor(world, position, height, width) {
        let shape = new Rectangle(position.x, position.y, width, height);
        super(world, position, shape);
        this.colour = 'rgb(153, 102, 0)';
    }

    draw(ctx, x, y) {
        ctx.translate(-x, -y);
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.lineWidth = 4;

        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.shape.width, this.shape.height);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.shape.width, this.shape.height);
        ctx.closePath();
        ctx.stroke();

    }
}

//A wall can be damaged
class damageableCircle extends circleWall {
    constructor(world, position, radius, colour, max_hp) {
        super(world, position, radius, colour);
        this.maxHealthPoint = max_hp;
        this.healthPoint = this.maxHealthPoint;

        this.original_shape = new Circle(position.x, position.y, radius);
    }


    draw(ctx, x, y) {
        ctx.translate(-x, -y);
        if (this.image) {
            let radius = this.shape.radius;
            ctx.drawImage(this.image, this.position.x - radius, this.position.y - radius, this.shape.radius * 2, this.shape.radius * 2);
        } else {
            ctx.fillStyle = this.colour;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.shape.radius, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }
    }

    setPosition(x, y) {
        this.original_shape.set(x, y, undefined);
        super.setPosition(x, y);
    }

}

//A stone, circle damageable wall
class Stone extends damageableCircle {
    constructor(world, position, radius, colour, max_hp) {
        super(world, position, radius, colour, max_hp);
        this.image = this.world.images.stone1;


    }


}

//A Tree, circle damageable wall
class Tree extends damageableCircle {
    constructor(world, position, radius, colour, max_hp) {
        super(world, position, radius, colour, max_hp);
        this.image = this.world.images.tree1;
    }

}

//A Bush, circle damageable wall
class Bush extends damageableCircle {
    constructor(world, position, radius, colour, max_hp) {
        super(world, position, radius, colour, max_hp);
        this.image = this.world.images.bush1;

    }


}

class damageableRect extends rectWall {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour);
        this.maxHealthPoint = max_hp;
        this.healthPoint = this.maxHealthPoint;

        this.original_shape = new Rectangle(position.x, position.y, width, height);
    }


    draw(ctx, x, y) {
        ctx.translate(-x, -y);
        if (this.image) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.shape.width, this.shape.height);
        } else {
            ctx.fillStyle = this.colour;
            ctx.fillRect(this.position.x, this.position.y, this.shape.width, this.shape.height);
        }
    }


}

//A Crate, Rect damageable wall
class Crate extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);
        this.image = this.world.images.crate;


    }

}

//A Bed, Rect damageable wall
class Bed extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);
        this.image = this.world.images.bed;

    }

}

//A Toilet, Rect damageable wall
class Toilet extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);
        this.image = this.world.images.toilet;


    }


}

//A golden Crate, Rect damageable wall
class goldenCrate extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);
        this.image = this.world.images.goldenCrate;


    }

}


//Building, show differently when player comes inside
class Building extends Nonitem {
    constructor(world, position, height, width) {
        let shape = new Rectangle(position.x, position.y, width, height);
        super(world, position, shape);
        this.image = null;
        this.colour = 'rgb(0,0,0)';
        this.show = true;
        this.wall_width = 15;
    }

    detectPlayer(player) {

        this.show = !this.world.collisionDetector.narrowDetection(player, this);
    }

    draw(ctx, x, y) {
        ctx.translate(-x, -y);
        if (this.show) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.shape.width, this.shape.height);

        }

    }

}

//Concrete implementation of building, add wall around it
class House extends Building {
    constructor(world, position, height, width) {
        super(world, position, height, width);
        this.image = this.world.images.house;

    }

}

//Concrete implementation of building, add wall around it
//And bed and toliet
class Mansion extends Building {
    constructor(world, position, height, width) {
        super(world, position, height, width);

        this.image = this.world.images.mansion;

    }

}

//Floor of a building, always draw first
class Floor extends Nonitem {
    constructor(world, position, height, width, colour) {
        let shape = new Rectangle(position.x, position.y, width, height);
        super(world, position, shape);
        this.colour = colour;
    }


    draw(ctx, x, y) {
        ctx.translate(-x, -y);
        var color = this.colour;

        ctx.fillStyle = color;
        ctx.fillRect(this.position.x, this.position.y, this.shape.width, this.shape.height);


    }

    step(steps) {

    }

}

//MAP SIZE
var WORLD_HEIGHT = 3000;
var WORLD_WIDTH = 3000;

var weapons = ['Weapon_M416', 'Weapon_AK47', 'Weapon_S686'];
var ammos = ['Ammo_556', 'Ammo_762', 'Ammo_shotGunShell'];

//Helper method
let classnameToName = {
    Projectile_556: "Ammo 556",
    Projectile_762: "Ammo 762",
    Projectile_shotGunShell: "ShotGun Shell",
    Weapon_AK47: "AK47",
    Weapon_M416: "M416",
    Weapon_S686: "S686"
};

export default Game;