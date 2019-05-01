/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */

count = 1;
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

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

function randint(n) {
    return Math.round(Math.random() * n);
}

function rand(n) {
    return Math.random() * n;
}

/** return random RGB color string*/
function getRandomRgb() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}
/** Convert an vector to angle (raduis)*/
function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var rad = Math.atan2(dy, dx); // range (-PI, PI]
    return rad;
}

/**Get relative mouse position*/

//TODO, CHANGE TO ADAPTED CANVAS
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.x,
        y: evt.clientY - rect.y
    };
}

class collisionDetector {
    //This class provide convenient way to detect if two actor collision.
    //To substitute handy way detection implementation.
    //To use collision Detector, each Actor must have attribute shape.
    //Failed to have shape attr will throw error.

    constructor() {}

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

    narrowDetectionShape(shape1, shape2) {
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
        let distance = Math.sqrt((this.x - r.x) * (this.x - r.x) +
            (this.y - r.y) * (this.y - r.y));

        throw 'Not implemented';
    }

    overlaps(r) {

        let distance = Math.sqrt((this.x - r.x) * (this.x - r.x) +
            (this.y - r.y) * (this.y - r.y));

        return r.radius + this.radius > distance;

    }

}



class remotePlayer {
    constructor(id, player) {

        this.player = player;
        player.id = id;
        //TODO, MODIFIED VIEWPORT THAT FOLLOW PLAYER WITH FAKE CANVAS. OPTIMIZATION NEEDED
        this.viewport = new Viewport(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }

}

//Since change to setImmediate. FPS does not used
var FPS = 100;
//The main game object, store who is main player, setting up view port
class Game {
    constructor(wss, dbc) {
        this.FPS = FPS;
        this.INTERVAL = 1000 / this.FPS; // milliseconds
        this.STEP = this.INTERVAL / 1000; // seconds
        this.world = new World(WORLD_WIDTH, WORLD_HEIGHT);
        this.world.dbc = dbc;
        this.gameMainLoopRequestid = null;
        this.wss = wss;

    }


    createRemotePalyer(userid) {
        // this.world.resetActorRandomPositionIfConflict(this.remotePlayerList[id].player);
        let p = new Player(this.world, new Pair(WORLD_WIDTH / 2, WORLD_HEIGHT / 2), 400, 20, 20, 'rgb(247,196,122)');
        p.id = userid;
        p.viewport = new Viewport(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        p.viewport.follow(p);
        p.viewport.update();
        return p;
    }

    findRemotePalyer(userid) {
        for (let i = 0; i < this.world.actors.Player.length; i++) {
            let p =  this.world.actors.Player[i];
            if (p.id === userid) {
                console.log(userid, " Reconnected");
                return p;
            }
        }

        return null;

    }

    addRemotePlayerToWorld(player) {
        this.world.resetActorRandomPositionIfConflict(player);
        this.world.addActor(player);
    }




    //The game takes one step, tell world take one stel
    step() {
        this.world.step(this.STEP);
        this.wss.broadcast(this.world.actors);

    }


    loop() {
        this.step();
    }

    start() {
        this.world.randomGenerateWorld();
        this.gameMainLoopRequestid =  setInterval(()=>{ this.loop(); },this.INTERVAL);
    }


    continue () {
        this.loop();
    }



}

class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        //The drawing sequence
        this.actors = {
            Floor: [],
            Projectile_556: [],
            Projectile_762: [],
            Projectile_shotGunShell: [],
            Ammo_556: [],
            Ammo_762: [],
            Ammo_shotGunShell: [],
            Weapon_AK47: [],
            Weapon_M416: [],
            Weapon_S686: [],
            Player: [],
            aimbotAI: [],
            randomAI: [],
            circleWall: [],
            rectWall: [],
            Crate: [],
            goldenCrate: [],
            Stone: [],
            Bed: [],
            Toilet: [],
            Tree: [],
            Bush: [],
            House: [],
            Mansion: []
        };

        this.collisionDetector = new collisionDetector();
        //All color used

    }

    generateDrawableActors(player) {

        function processAct(type, act) {
            let locala = {};

            for (var actkey in act) {
                if (clientAttributes.includes(actkey)) {
                    locala[actkey] = act[actkey];
                }

                if (type === "Player") {
                    if (act.curr_weapon) {
                        locala['curr_weapon'] = processAct('Weapon', act.curr_weapon);
                    }
                }
            }
            return locala;
        }

        let x_off = player.viewport.xView;
        let y_off = player.viewport.yView;

        let cwidth = player.viewport.viewportWidth;
        let cheight = player.viewport.viewportWidth;

        let boundary = 600;

        let re = {};
        for (var key in this.actors) {
            //console.log(key.prototype);
            //console.log(key.prototype instanceof Nonmovable);
            if (this.actors.hasOwnProperty(key)) {
                let acts = this.actors[key];
                for (var i = 0; i < acts.length; i++) {
                    let a = acts[i];
                    if (x_off - boundary < acts[i].position.x && acts[i].position.x < x_off + cwidth + boundary && y_off - boundary < acts[i].position.y && acts[i].position.y < boundary + y_off + cheight) {
                        let la = processAct(key, a);
                        if (!re[key]) {
                            re[key] = [la];
                        } else {
                            re[key].push(la);
                        }
                    }

                }
            }
        }
        return re;
    }

    randomGenerateWeapon(x, y) {
        let weaponList = [Weapon_S686, Weapon_AK47, Weapon_M416];
        let idx = getRandomInt(0, 2);

        return new weaponList[idx](this, new Pair(x, y));
    }

    randomGenerateWorld() {
        let width = this.width;
        let height = this.height;
      

        let h = new House(this, new Pair(width / 2 + 500, height / 2 + 500), 300, 450);
      
        let m1 = new Mansion(this, new Pair(width / 2 - 500, height / 2 - 500), 721, 654);


        

        // //Add weapon
        var total = 20;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Weapon_M416(this, new Pair(x, y));

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }
        //Add S686
        var total = 20;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Weapon_S686(this, new Pair(x, y));

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }

        var total = 20;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Weapon_AK47(this, new Pair(x, y));

            while (this.getActorAppro(s1).length !== 0) {
                var x = Math.floor((Math.random() * this.width));
                var y = Math.floor((Math.random() * this.height));
                s1.setPosition(x, y);
            }

            this.addActor(s1);
            total--;
        }

        //console.log(this.actors.rectWall);

    }

    randomGenerateWorld2() {
        let width = this.width;
        let height = this.height;


        let h = new House(this, new Pair(width / 2 + 500, height / 2 + 500), 300, 450);
        //
        let c1 = new Crate(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c1);
        h.moveAnRectToCorner(c1, 0);

        let c2 = new goldenCrate(this, new Pair(width / 2 + 600, height / 2 + 600), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c2);
        h.moveAnRectToCorner(c2, 1);

        let c3 = new Crate(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c3);
        h.moveAnRectToCorner(c3, 2);

        let c4 = new Crate(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c4);
        h.moveAnRectToCorner(c4, 3);

        this.addActor(h);
        //
        let m1 = new Mansion(this, new Pair(width / 2 - 500, height / 2 - 500), 721, 654);
        this.addActor(m1);

        let b1 = new Bed(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 120, 'rgb(0,0,0)', 100);
        this.addActor(b1);
        m1.moveAnRectToCorner(b1, 0);

        let t1 = new Toilet(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(t1);
        m1.moveAnRectToCorner(t1, 2);

        let m2 = new Mansion(this, new Pair(width / 2 + 1000, height / 2 - 2000), 721, 654);
        this.addActor(m2);

        let b2 = new Bed(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 120, 'rgb(0,0,0)', 100);
        this.addActor(b2);
        m2.moveAnRectToCorner(b2, 0);

        let t2 = new Toilet(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(t2);
        m2.moveAnRectToCorner(t2, 2);

        let h2 = new House(this, new Pair(width / 2 + -500, height / -500), 300, 450);

        let c5 = new Crate(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c5);
        h2.moveAnRectToCorner(c5, 0);

        let c6 = new goldenCrate(this, new Pair(width / 2 + 600, height / 2 + 600), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c6);
        h2.moveAnRectToCorner(c6, 1);

        let c7 = new Crate(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c7);
        h2.moveAnRectToCorner(c7, 2);

        let c8 = new Crate(this, new Pair(width / 2 + 500, height / 2 + 500), 100, 100, 'rgb(0,0,0)', 100);
        this.addActor(c8);
        h2.moveAnRectToCorner(c8, 3);

        this.addActor(h2);


        var total = 10;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Stone(this, new Pair(x, y), 50, 'rgb(0,0,0)', 500);

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }

        //Add Trees
        var total = 10;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Tree(this, new Pair(x, y), 80, 'rgb(0,0,0)', 500);

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }
        //Add Bushs
        var total = 10;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Bush(this, new Pair(x, y), 60, 'rgb(0,0,0)', 500);

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }

       

        // //Add weapon
        var total = 10;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Weapon_M416(this, new Pair(x, y));

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }
        //Add S686
        var total = 10;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Weapon_S686(this, new Pair(x, y));

            this.resetActorRandomPositionIfConflict(s1);

            this.addActor(s1);
            total--;
        }

        var total = 10;
        while (total > 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            let s1 = new Weapon_AK47(this, new Pair(x, y));

            while (this.getActorAppro(s1).length !== 0) {
                var x = Math.floor((Math.random() * this.width));
                var y = Math.floor((Math.random() * this.height));
                s1.setPosition(x, y);
            }

            this.addActor(s1);
            total--;
        }

        //console.log(this.actors.rectWall);

    }

    clearWorld() {
        for (var key in this.actors) {
            this.actors[key] = [];
        }
    }

    resetActorRandomPositionIfConflict(actor){
        while (this.getActorAppro(actor).length !== 0) {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));
            actor.setPosition(x, y);
        }
    };

    //Call it when player die, drop their inventory
    playerDie(player) {
        if (!(player instanceof Player)) {
            console.log("SERVER: MODEL ERROR");
            throw "player type wrong";
        }

        let px = player.position.x;
        let py = player.position.y;

        let dropRange = 40;

        if (player.weapon1) {
            let x = px + getRandomInt(-dropRange, dropRange);
            let y = py + getRandomInt(-dropRange, dropRange);
            let w = player.weapon1;
            player.weapon1 = null;

            w.position.x = x;
            w.position.y = y;
            this.addActor(w);
        }

        if (player.weapon2) {
            let x = px + getRandomInt(-dropRange, dropRange);
            let y = py + getRandomInt(-dropRange, dropRange);
            let w = player.weapon2;
            player.weapon2 = null;

            w.position.x = x;
            w.position.y = y;
            this.addActor(w);
        }

        for (var key in player.inventory) {
            let x = px + getRandomInt(-dropRange, dropRange);
            let y = py + getRandomInt(-dropRange, dropRange);
            if (player.inventory[key] !== 0) {
                let act = new classnameToConstructor[key](this, new Pair(x, y), player.inventory[key]);
                this.addActor(act);
            }
            player.inventory[key] = 0;
        }



        if (player.id) {
            //Upload Game stats
            console.log("updating record");
            //game.viewport.follow(player.stats.killed);

            this.dbc.updateAchievement(player.id, player.stats.kill, player.stats.damageDone);
            //updateUserAchievement(player.stats.kill, player.stats.damageDone);
        }

        this.removeActor(player);

    }


    removePlayer() {
        if (this.player) {
            this.removeActor(this.player);
            this.player = null;
        }
    }

    addActor(actor) {
        //console.log(actor.constructor.name);
        //console.log(this.actors[actor.constructor.name]);

        if (this.actors[actor.constructor.name] === undefined) {
            this.actors[actor.constructor.name] = [];
        }
        if (!this.actors[actor.constructor.name].includes(actor)) {
            this.actors[actor.constructor.name].push(actor);
            return true;
        }
        return false;
    }

    removeActor(actor) {
        var index = this.actors[actor.constructor.name].indexOf(actor);
        if (index != -1) {
            this.actors[actor.constructor.name].splice(index, 1);
        }
    }

    // return the first actor at coordinates (x,y) return null if there is no such actor
    getActor(x, y) {
        for (var key in this.actors) {
            //if (this.actors.hasOwnProperty(key)) {
            let acts = this.actors[key];
            for (var i = 0; i < acts.length; i++) {
                if (acts[i].position.x === x && acts[i].position.y === y) {
                    return acts[i];
                }

            }
        }

        return null;
    }

    //Collision detection
    getActorAppro(center_actor) {
        var a = [];
        for (var key in this.actors) {
            //console.log(key.prototype);
            //console.log(key.prototype instanceof Nonmovable);
            //if (this.actors.hasOwnProperty(key)) {

            let acts = this.actors[key];
            for (var i = 0; i < acts.length; i++) {
                if (this.collisionDetector.narrowDetection(center_actor, acts[i])) {
                    if (acts[i] !== center_actor) {
                        a.push(acts[i]);
                    }
                }
            }

        }
        return a;

    }

    //Get only one actor
    getActorApproByType(center_actor, actor_types) {
        var a = [];
        for (var key in this.actors) {
            //console.log(key.prototype);
            //console.log(key.prototype instanceof Nonmovable);
            if (actor_types.includes(key)) {
                let acts = this.actors[key];
                for (var i = 0; i < acts.length; i++) {
                    //console.log(this.collisionDetector.narrowDetection(acts[i], center_actor));
                    //console.log(acts[i]);
                    if (this.collisionDetector.narrowDetection(center_actor, acts[i])) {
                        if (acts[i] !== center_actor) {
                            a.push(acts[i]);
                            break;
                        }
                    }
                }
            }

        }
        return a;

    }

    getPlayerNum() {
        return this.actors.Player.length;
    }

    //User for aimbotAI
    getPlayerNearby(player, range) {
        let a = [];
        for (var key in this.actors) {
            //console.log(key.prototype);
            //console.log(key.prototype instanceof Nonmovable);
            if (key === 'Player' || key === 'AI') {
                let acts = this.actors[key];
                for (var i = 0; i < acts.length; i++) {
                    if (acts[i] !== player) {
                        if (player.position.distance(acts[i].position) < range) {
                            a.push(acts[i]);
                            break;
                        }
                    }
                }
            }
        }
        return a;
    }
    //Take one step for each actor
    step(steps) {
        for (var key in this.actors) {
            //if (this.actors.hasOwnProperty(key)) {
            let acts = this.actors[key];
            for (var i = 0; i < acts.length; i++) {
                acts[i].step(steps);
            }

        }


    }


}

//View port, follow player to adjust  view
class Viewport {
    constructor(x, y, wwidth, wheight) {
        // the world width and world height
        this.world_width = wwidth;
        this.world_height = wheight;
        this.xView = x;
        this.yView = y;
        this._followed = null;

        this.viewportWidth = 1500;

        this.shape = new Rectangle(this.xView, this.yView,  this.viewportWidth,  this.viewportWidth);
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

            let View_width = this.viewportWidth;
            let View_height = this.viewportWidth;

            this.xView = act_x - View_width / 2;
            this.yView = act_y - View_height / 2;

            this.shape.set(this.xView, this.yView, View_width, View_height);

            if (!this.shape.within(this.worldRect)) {
                if (this.shape.x < this.worldRect.x)
                    this.xView = this.worldRect.x;
                if (this.shape.y < this.worldRect.y)
                    this.yView = this.worldRect.y;
                if (this.shape.right > this.worldRect.right)
                    this.xView = this.worldRect.right - View_width;
                if (this.shape.bottom > this.worldRect.bottom)
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

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.shape.x = x;
        this.shape.y = y;
    }

}

//Control class to control Player
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

        //this.hud = new playerHUD(this);

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

    step(steps) {
        if (this.isDie()) {
            this.world.playerDie(this);
            return;
        }

        if (this.controls.left) {
            this.position.x -= this.speed * steps;

            if (this.world.getActorApproByType(this, nonmovables).length !== 0) {
                this.position.x += this.speed * steps;
            }
        }

        if (this.controls.up) {
            this.position.y -= this.speed * steps;
            if (this.world.getActorApproByType(this, nonmovables).length !== 0) {
                this.position.y += this.speed * steps;
            }
        }

        if (this.controls.right) {
            this.position.x += this.speed * steps;
            if (this.world.getActorApproByType(this, nonmovables).length !== 0) {
                this.position.x -= this.speed * steps;
            }
        }

        if (this.controls.down) {
            this.position.y += this.speed * steps;
            if (this.world.getActorApproByType(this, nonmovables).length !== 0) {
                this.position.y -= this.speed * steps;
            }
        }

        if (this.controls.fire) {
            this.shot();
        }

        // don't let player leaves the world's boundary
        if (this.position.x - this.width / 2 < 0) {
            this.position.x = this.width / 2;
        }
        if (this.position.y - this.height / 2 < 0) {
            this.position.y = this.height / 2;
        }

        if (this.position.x + this.width / 2 > this.world.width) {
            this.position.x = this.world.width - this.width / 2;
        }
        if (this.position.y + this.height / 2 > this.world.height) {
            this.position.y = this.world.height - this.height / 2;
        }
        this.shape.set(this.position.x, this.position.y, this.width, this.height);

        if (this.weapon1) {
            this.weapon1.position.x = this.position.x;
            this.weapon1.position.y = this.position.y;
        }
        if (this.weapon2) {
            this.weapon2.position.x = this.position.x;
            this.weapon2.position.y = this.position.y;
        }

        if (this.viewport) {
            this.viewport.update();
        }

    }

    handleEvent(event) {

        if (event.direction) {
            this.changeDirection(event.direction);
        }

        if (event.type === "keydown"){
            switch (event.keyCode) {
                case 65: // left
                    this.controls.left = true;
                    break;
                case 87: // up
                    this.controls.up = true;
                    break;
                case 68: // right
                    this.controls.right = true;
                    break;
                case 83: // down
                    this.controls.down = true;
                    break;
                case 70:
                    this.pickup();
                    break;

                case 49: //1
                    this.switchWeapon(1);
                    break;
                case 50: //2
                    this.switchWeapon(2);
                    break;
                case 82: //r
                    this.reload();
                    break;
            }
        }

        if (event.type === "keyup") {
            switch (event.keyCode) {
                case 65: // left
                    this.controls.left = false;
                    break;
                case 87: // upr
                    this.controls.up = false;
                    break;
                case 68: // right
                    this.controls.right = false;
                    break;
                case 83: // down
                    this.controls.down = false;
                    break;
            }
        }

        if (event.type === "mousemove") {
        }


        if (event.type === "mousedown") {
            this.controls.fire = true;
        }


        if (event.type === "mouseup") {
            this.controls.fire = false;
        }


    };



    toStringHealthPoint() {
        return this.healthPoint + "/" + this.maxHealthPoint;
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

    recordKilled(player)  {
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
    constructor(player, controls, reactionTime, stepsBeforeChangeDirection) {
        super(player, controls, reactionTime, stepsBeforeChangeDirection);
    }
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
    constructor(player, controls, reactionTime, stepsBeforeChangeDirection) {
        super(player, controls, reactionTime, stepsBeforeChangeDirection);
    }
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
    constructor(world, position, shape) {
        super(world, position, shape);
    }
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

    }

    //fire at a direction
    fire(position) {
        if (!this.readytofire) {
            return;
        }

        if (this.ammo <= 0) {
            return;
        }
        this.ammo--;
        //Magic number
        let mn = 25;
        //Recoil
        let x_fluctuate = (Math.random() * 2 - 1) / 10;
        let y_fluctuate = (Math.random() * 2 - 1) / 10;

        let b = new this.ammo_type(this.world, new Pair(this.position.x + mn * position.x, this.position.y + mn * position.y), new Pair(mn * (2 * position.x + x_fluctuate) + this.position.x, mn * (2 * position.y + y_fluctuate) + this.position.y), this.speed, this.owner, this.damage, this.range);
        this.world.addActor(b);
        this.readytofire = false;

        setTimeout(() => {
            this.readytofire = true;
        }, this.firerate);
    }

    //Self reload based on how many ammo provied, return remaining ammo
    reload(ammo_num) {
        if (ammo_num <= this.max_ammo) {
            this.ammo = ammo_num;
            return 0;
        }

        let filled = this.max_ammo - this.ammo;
        this.ammo = this.max_ammo;
        return ammo_num - filled;

    }

    magzineEmpty() {

        return this.ammo === 0;
    }

    //Weapon can not taks move
    step(steps) {

    }

    toString() {
        return classnameToName[this.constructor.name];
    }

    toAmmo() {
        return this.ammo + "/" + this.max_ammo;
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
        this.name = "M416";

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
        this.name = "AK47";

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
        this.name = "S686";

    }
    //overwrite basic fire
    fire(position) {
        if (!this.readytofire) {
            return;
        }

        if (this.ammo <= 0) {
            return;
        }
        this.ammo--;

        let mn = 25;

        let total = 6;

        //Fire 6 projectile at a time
        while (total > 0) {
            let x_fluctuate = (Math.random() * 2 - 1) / 10;
            let y_fluctuate = (Math.random() * 2 - 1) / 10;
            let b = new this.ammo_type(this.world, new Pair(this.position.x + mn * position.x, this.position.y + mn * position.y), new Pair(mn * (2 * position.x + x_fluctuate) + this.position.x, mn * (2 * position.y + y_fluctuate) + this.position.y), this.speed, this.owner, this.damage, this.range);
            this.world.addActor(b);
            total--;
        }
        this.readytofire = false;

        setTimeout(() => {
            this.readytofire = true;
        }, this.firerate);
    }

}

//Abstract Projectile class
class Projectile extends Nonitem {
    constructor(world, position, shape, direction_position, speed, colour, owner, dmg, range) {
        super(world, position, shape);

        this.speed = speed;
        this.velocity = this.headTo(direction_position);
        this.velocity.normalize(this.speed);
        this.colour = colour;
        this.owner = owner;
        this.damage = dmg;
        this.range = range;
    }

    headTo(position) {
        let x = (position.x - this.position.x);
        let y = (position.y - this.position.y);
        return new Pair(x, y)
    }

    toString() {
        return this.position.toString() + " " + this.velocity.toString();
    }

    updateProjectileRange(s) {
        this.range -= s * this.speed;

    }

    projectileOutofRange() {
        return this.range < 0;
    }

    step(steps) {
        this.position.x = this.position.x + this.velocity.x * steps;
        this.position.y = this.position.y + this.velocity.y * steps;

        this.updateProjectileRange(steps);

        if (this.projectileOutofRange()) {
            this.world.removeActor(this);
            return;
        }

        let players = this.world.getActorApproByType(this, playerTypes);
        for (let i = 0; i < players.length; i++) {
            //Record damage and kill when touch a player
            this.world.removeActor(this);
            players[i].takeDamage(this.damage);
            this.owner.stats.recordDamageDone(this.damage);
            players[i].stats.recordDamageTaken(this.damage);
            if (players[i].isDie()) {
                this.owner.stats.recordKill(players[i]);
                players[i].stats.recordKilled(this.owner);
            }

            break;
        }

        let damageables = this.world.getActorApproByType(this, damageable);
        for (let i = 0; i < damageables.length; i++) {
            //Make damage to touched object
            this.world.removeActor(this);
            damageables[i].takeDamage(this.damage);
            break;
        }

        let nonmoves = this.world.getActorApproByType(this, nonmovables);
        for (let i = 0; i < nonmoves.length; i++) {
            //just remove it self since it is invincible
            this.world.removeActor(this);
            break;
        }

        // bounce off the walls
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = Math.abs(this.velocity.x);
        }
        if (this.position.x > this.world.width) {
            this.position.x = this.world.width;
            this.velocity.x = -Math.abs(this.velocity.x);
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = Math.abs(this.velocity.y);
        }
        if (this.position.y > this.world.height) {
            this.position.y = this.world.height;
            this.velocity.y = -Math.abs(this.velocity.y);
        }

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

}

//Three type of Ammo class
class Ammo_556 extends Ammo {
    constructor(world, position, ammo) {
        let shape = new Circle(position.x, position.y, 10);
        let ammo_type = Projectile_556;
        let colour = 'rgb(255,0,0)';
        super(world, position, shape, ammo_type, ammo, colour);
    }
    // DEPRECIATED METHOD
    // draw(ctx, x, y) {
    //     super.draw(ctx, x, y);
    // }

}

class Ammo_762 extends Ammo {
    constructor(world, position, ammo) {
        let shape = new Circle(position.x, position.y, 10);
        let ammo_type = Projectile_762;
        let colour = 'rgb(0,255,0)';
        super(world, position, shape, ammo_type, ammo, colour);
    }

}

class Ammo_shotGunShell extends Ammo {
    constructor(world, position, ammo) {
        let shape = new Circle(position.x, position.y, 10);
        let ammo_type = Projectile_shotGunShell;
        let colour = 'rgb(0,0,255)';
        super(world, position, shape, ammo_type, ammo, colour);
    }



}

//Abstract class
class Nonmovable extends Nonitem {
    constructor(world, position, shape) {
        super(world, position, shape)
    }
    step(steps) {

    }
}

class Wall extends Nonmovable {
    constructor(world, position, shape, colour) {
        super(world, position, shape);
    }

    step(steps) {

    }

}

//A wall shaped as circle
class circleWall extends Wall {
    constructor(world, position, radius) {
        let shape = new Circle(position.x, position.y, radius);
        let colour = 'rgb(153, 102, 0)';
        super(world, position, shape, colour);
    }


}
//A wall shaped as Rect
class rectWall extends Wall {
    constructor(world, position, height, width) {
        let shape = new Rectangle(position.x, position.y, width, height);
        let colour = 'rgb(153, 102, 0)';
        super(world, position, shape, colour);
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

    takeDamage(dmg) {
        if (this.healthPoint === 0) {
            return;
        }

        this.healthPoint = ((this.healthPoint - dmg) < 0 ? 0 : (this.healthPoint - dmg));

        //shrink size depends on damage

        let shrink_ratio = this.healthPoint / this.maxHealthPoint;
        let new_radius = this.original_shape.radius * shrink_ratio;

        this.shape.set(this.shape.x, this.shape.y, new_radius);
        this.position.set(this.shape.x, this.shape.y);

        if (this.healthPoint === 0) {
            this.world.removeActor(this);
            if (this.rewards) {
                this.rewards.dropReward();
            }
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
        //TODO, BUG
        //this.image = this.world.images.stone1;
        this.rewards = null;

        let a = new Ammo_762(this.world, new Pair(position.x / 2 + 300, position.y / 2 + 300), 300);
        let r1 = new Reward(this);

        r1.addReward(a);
        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }

}

//A Tree, circle damageable wall
class Tree extends damageableCircle {
    constructor(world, position, radius, colour, max_hp) {
        super(world, position, radius, colour, max_hp);
        //TODO, BUG
        //this.image = this.world.images.tree1;
        this.rewards = null;

        let r1 = new Reward(this);

        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }

}

//A Bush, circle damageable wall
class Bush extends damageableCircle {
    constructor(world, position, radius, colour, max_hp) {
        super(world, position, radius, colour, max_hp);

        //TODO.
        //this.image = this.world.images.bush1;
        this.rewards = null;

        let r1 = new Reward(this);

        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }

}

class damageableRect extends rectWall {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour);
        this.maxHealthPoint = max_hp;
        this.healthPoint = this.maxHealthPoint;

        this.original_shape = new Rectangle(position.x, position.y, width, height);
    }

    takeDamage(dmg) {
        if (this.healthPoint === 0) {
            return;
        }

        this.healthPoint = ((this.healthPoint - dmg) < 0 ? 0 : (this.healthPoint - dmg));

        //shrink size depends on damage

        let shrink_ratio = this.healthPoint / this.maxHealthPoint;
        let new_x = this.original_shape.x + 0.5 * (1 - shrink_ratio) * this.original_shape.width;
        let new_y = this.original_shape.y + 0.5 * (1 - shrink_ratio) * this.original_shape.height;
        let new_width = this.original_shape.width * shrink_ratio;
        let new_height = this.original_shape.height * shrink_ratio;

        this.shape.set(new_x, new_y, new_width, new_height);
        this.position.set(new_x, new_y);

        //let resize = this.healthPoint/this.maxHealthPoint;
        //this.shape.set()

        if (this.healthPoint === 0) {
            this.world.removeActor(this);
            if (this.rewards) {
                this.rewards.dropReward();
            }
        }
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

    setPosition(x, y) {
        this.original_shape.set(x, y, undefined, undefined);
        super.setPosition(x, y);
    }
}

//A Crate, Rect damageable wall
class Crate extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);


        // TODO
        // this.image = this.world.images.crate;
        this.rewards = null;

        let w1 = this.world.randomGenerateWeapon(position.x, position.y);

        let r1 = new Reward(this);
        r1.addReward(w1);
        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }

}

//A Bed, Rect damageable wall
class Bed extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);
        //TODO
        //this.image = this.world.images.bed;
        this.rewards = null;

        let w1 = new Weapon_AK47(this.world, new Pair(width / 2, height / 2));
        let a1 = new Ammo_762(this.world, new Pair(width / 2 + 300, height / 2 + 300), 30);

        let r1 = new Reward(this);
        r1.addReward(w1);
        r1.addReward(a1);
        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }
}

//A Toilet, Rect damageable wall
class Toilet extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);

        //TODO
        //this.image = this.world.images.toilet;
        this.rewards = null;

        let w1 = new Weapon_S686(this.world, new Pair(width / 2, height / 2));
        let a1 = new Ammo_shotGunShell(this.world, new Pair(width / 2 + 300, height / 2 + 300), 300);

        let r1 = new Reward(this);
        r1.addReward(w1);
        r1.addReward(a1);
        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }

}

//A golden Crate, Rect damageable wall
class goldenCrate extends damageableRect {
    constructor(world, position, height, width, colour, max_hp) {
        super(world, position, height, width, colour, max_hp);

        //TODO
        //this.image = this.world.images.goldenCrate;
        this.rewards = null;

        let w1 = new Weapon_M416(this.world, new Pair(width / 2, height / 2));
        let w2 = new Weapon_AK47(this.world, new Pair(width / 2, height / 2));
        let w3 = new Weapon_S686(this.world, new Pair(width / 2, height / 2));
        let a1 = new Ammo_556(this.world, new Pair(width / 2 + 300, height / 2 + 300), 300);
        let a2 = new Ammo_762(this.world, new Pair(width / 2 + 300, height / 2 + 300), 300);
        let a3 = new Ammo_shotGunShell(this.world, new Pair(width / 2 + 300, height / 2 + 300), 300);

        let r1 = new Reward(this);
        r1.addReward(w1);
        r1.addReward(w2);
        r1.addReward(w3);

        r1.addReward(a1);
        r1.addReward(a2);
        r1.addReward(a3);
        this.setReward(r1);

    }
    setReward(r) {
        this.rewards = r;
    }
}
//Reward class record what is inside a create etc.
class Reward {
    constructor(owner) {
        this.rewards = [];
        this.owner = owner;

    }

    dropReward() {

        let dropRange = 40;

        for (let i = 0; i < this.rewards.length; i++) {
            let act = this.rewards[i];
            let x = this.owner.position.x + getRandomInt(-dropRange, dropRange);
            let y = this.owner.position.y + getRandomInt(-dropRange, dropRange);

            act.position.x = x;
            act.position.y = y;
            this.owner.world.addActor(act);
        }

    }

    addReward(act) {
        this.rewards.push(act);
    }

}

//Building, show differently when player comes inside
class Building extends Nonitem {
    constructor(world, position, height, width) {
        let shape = new Rectangle(position.x, position.y, width, height);
        super(world, position, shape);
        //this.image = null;
        this.colour = 'rgb(0,0,0)';
        this.show = true;
        this.wall_width = 15;
    }

    step(steps) {


    }
    moveAnRectToCorner(act, corner_int) {
        switch (corner_int) {
            case 0:
                act.setPosition(this.position.x + this.wall_width, this.position.y + this.wall_width);
                break;
            case 1:
                act.setPosition(this.position.x + this.shape.width - act.shape.width - this.wall_width, this.position.y + this.wall_width);
                break;
            case 2:
                act.setPosition(this.position.x + this.shape.width - act.shape.width - this.wall_width, this.position.y + this.shape.height - act.shape.height - this.wall_width);
                break;
            case 3:
                act.setPosition(this.position.x + this.wall_width, this.position.y + this.shape.height - act.shape.height - this.wall_width);
                break;

        }

    }

}

//Concrete implementation of building, add wall around it
class House extends Building {
    constructor(world, position, height, width) {
        super(world, position, height, width);


        let x = position.x;
        let y = position.y;

        this.wall_width = 15;
        let wall_width = this.wall_width;

        let w1 = new rectWall(world, new Pair(x, y), wall_width, width);
        this.world.addActor(w1);
        let w2 = new rectWall(world, new Pair(x + width - wall_width, y), height, wall_width);
        this.world.addActor(w2);
        let w3 = new rectWall(world, new Pair(x, y + height - wall_width), wall_width, width);
        this.world.addActor(w3);

        let w4 = new rectWall(world, new Pair(x, y), height / 4, wall_width);
        let w5 = new rectWall(world, new Pair(x, y + 3 * height / 4), height / 4, wall_width);
        this.world.addActor(w4);
        this.world.addActor(w5);

        let floor = new Floor(world, new Pair(x, y), height, width, 'rgb(102, 68, 0)');
        this.world.addActor(floor);
    }

}

//Concrete implementation of building, add wall around it
//And bed and toliet
class Mansion extends Building {
    constructor(world, position, height, width) {
        super(world, position, height, width);

        let x = position.x;
        let y = position.y;

        this.wall_width = 10;
        let wall_width = this.wall_width;

        let w1 = new rectWall(world, new Pair(x, y), wall_width, width);
        this.world.addActor(w1);
        let w2 = new rectWall(world, new Pair(x, y + height - wall_width), wall_width, width);
        this.world.addActor(w2);

        let w3 = new rectWall(world, new Pair(x, y), 2 * height / 4, wall_width);
        let w4 = new rectWall(world, new Pair(x, y + 3 * height / 4), height / 4, wall_width);
        this.world.addActor(w3);
        this.world.addActor(w4);

        let w5 = new rectWall(world, new Pair(x + width - wall_width, y), height / 4, wall_width);
        let w6 = new rectWall(world, new Pair(x + width - wall_width, y + 2 * height / 4), 2 * height / 4, wall_width);
        this.world.addActor(w5);
        this.world.addActor(w6);

        let w7 = new rectWall(world, new Pair(x + width / 3, y), height / 4, wall_width);
        this.world.addActor(w7);
        let w9 = new rectWall(world, new Pair(x, y + height / 4), wall_width, width / 5);
        this.world.addActor(w9);

        let w8 = new rectWall(world, new Pair(x + 2 * width / 3, y + 3 * height / 4), height / 4, wall_width);
        this.world.addActor(w8);
        //TODO
        let floor = new Floor(world, new Pair(x, y), height, width, 'rgb(89, 89, 89)');
        this.world.addActor(floor);

    }

}

//Floor of a building, always draw first
class Floor extends Nonitem {
    constructor(world, position, height, width, colour) {
        let shape = new Rectangle(position.x, position.y, width, height);
        super(world, position, shape);
        //this.image = null;
        this.colour = colour;
        //this.generateImage(document.getElementById('stage').getContext('2d'));
    }
    step(steps) {

    }

}

//MAP SIZE
var WORLD_HEIGHT = 3000;
var WORLD_WIDTH = 3000;

//Differnt type of object
var nonmovables = ['Wall', 'circleWall', 'rectWall', 'Crate', 'goldenCrate', 'Stone', 'Player', 'aimbotAI', 'randomAI', 'Bed', 'Toilet'];
var weapons = ['Weapon_M416', 'Weapon_AK47', 'Weapon_S686'];
var ammos = ['Ammo_556', 'Ammo_762', 'Ammo_shotGunShell'];
var playerTypes = ['Player', 'aimbotAI', 'randomAI'];
var damageable = ['Crate', 'goldenCrate', 'Stone', 'Bed', 'Tree', 'Bush', 'aimbotAI', 'randomAI', 'Toilet'];

var clientAttributes = ['position', 'shape', 'color', 'colour', 'height', 'width', 'speed', 'direction', 'id', 'healthPoint', 'inventory', 'ammo', 'max_ammo', 'name'];

//Helper method
let classnameToName = {
    Projectile_556: "Ammo 556",
    Projectile_762: "Ammo 762",
    Projectile_shotGunShell: "ShotGun Shell",
    Projectile_shotGunShell: "ShotGun Shell",
    Weapon_AK47: "AK47",
    Weapon_M416: "M416",
    Weapon_S686: "S686"
};

let classnameToConstructor = {
    Projectile_556: Ammo_556,
    Projectile_762: Ammo_762,
    Projectile_shotGunShell: Ammo_shotGunShell,

};


exports.Game = Game;
exports.clientAttributes  = clientAttributes;
