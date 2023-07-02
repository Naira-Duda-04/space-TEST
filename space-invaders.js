    //------Variables------//
    const canvas = document.createElement("canvas");
    const WIDTH = 500, HEIGHT = 500;
    const ctx = canvas.getContext("2d");

    const bW = 5, bH = 6, bS = 7.5;

    const KEYS = {

        LEFT: 65,

        RIGHT: 68

    }

    var stopped = false;

    var input = new inputHandeler();

    var player = new Player((WIDTH-32)/2, HEIGHT - 2*32, 32, 32, 6);
    var bullets = [], enemies = [];

    //------Starting Functions------//
    function init(){
        alert("GOAL: Shoot every green cube!\nMade with <3 by GGC_")

        let eR = 5;
        let eC = 8;

        let posX = 15;
        let posY = 10;

        for (var i = 0; i < eR; i++) {
            for (var k = 0; k < eC; k++) {

                enemies.push( new Enemy(posX, posY, 32, 32, 20, "green") )

                posX += 48;
            }

            posY += 48;
            posX = 15;
        }

        canvas.addEventListener('mousedown', function() {
            player.shoot();
        })

        var loop = setInterval(function() {

            if(!stopped) {

                ctx.clearRect(0, 0, WIDTH, HEIGHT);

                update();
                draw();

            }

        }, 1000/30);
    }

    function config(){
        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        document.body.appendChild(canvas);

        init();
    }


    function draw(){
        player.draw();
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].draw();
        }
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].draw();
        }
    }

    function update(){

        if(Win()) {

            stopped = true;

            $('canvas').css({"opacity":0.5})
            $('.win').css({"display":"block"})

        }

        if(GameOver()) {

            stopped = true;

            $('canvas').css({"opacity":0.5})
            $('.gameOver').css({"display":"block"})

        }


        player.update();
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].update();
        }
    }


    //-----Classes-----//
    function Player(x, y, w, h, s) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.speed = s;
        this.lifes = 3;
    }
    Player.prototype.draw = function () {
        ctx.beginPath()
        ctx.fillStyle = "white"
        ctx.fillRect(this.x, this.y, this.width, this.height)
    };
    Player.prototype.update = function () {
        if(input.isDown(KEYS.RIGHT)) this.x += this.speed;
        if(input.isDown(KEYS.LEFT)) this.x -= this.speed;
    };
    Player.prototype.shoot = function () {
        bullets.push( new Bullet(this.x + (this.width/2-5), this.y - 7, bW, bH, bS, "pink") );
    };


    function Bullet(x, y, w, h, s, c, t = "") {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.speed = s;
        this.color = c;

        this.type = t;
    }
    Bullet.prototype.draw = function () {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    };
    Bullet.prototype.update = function () {
        this.y -= this.speed;

        if(AABB(this.x, this.y, this.width, this.height, player.x, player.y, player.width, player.height)) {

            this.width = null;
            this.x = -10;

            player.lifes--;

            player.width -= 6;
            player.height -= 6;

        }

        for (var i = 0; i < enemies.length; i++) {
            if(AABB(this.x, this.y, this.width, this.height, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height) && this.type != "e") {

                this.width = null;
                this.x = -10;

                enemies.splice(i, 1)

            }
        }
    };


    function Enemy(x, y, w, h, v, c) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.vel = v;
        this.color = c;
        this.mTick = 1;
    }

    Enemy.prototype.draw = function () {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };

    Enemy.prototype.shoot = function() {

        bullets.push( new Bullet(this.x + (this.width-bW)/2, this.y + this.height + 1, bW, bH, -bS, "pink", "e") );

    }

    Enemy.prototype.moveE = function() {

        if(this.mTick % 7 == 0) {

            this.y += this.height;

            this.vel *= -1;

        }

        this.x += this.vel;

        this.mTick++;

    }

    var shootInterval = setInterval(function() {

        enemies[random(0, enemies.length-1)].shoot();

    }, 450);

    var moveInterval = setInterval(function() {

        for (var j = 0; j < enemies.length; j++) {
            enemies[j].moveE();
        }

    }, 1200);


    //----Event Handlers----//
    function random(min, max) {
        return (Math.floor(Math.random() * max) + min) > max ? max : Math.floor(Math.random() * max) + min;
    }

    function AABB(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax<bx+bw && ay<by+bh && bx<ax+aw && by<ay+ah;
    }

    function inputHandeler() {
        this.down = {};
        this.pressed = {};

        var _this = this;
        document.addEventListener("keydown", function (evt) {
            _this.down[evt.keyCode] = true;
        });
        document.addEventListener("keyup", function (evt) {
            delete _this.down[evt.keyCode];
            delete _this.pressed[evt.keyCode];
        });
    };

    inputHandeler.prototype.isDown = function(code) {
        return this.down[code];
    };

    inputHandeler.prototype.isPressed = function(code) {
        if(this.pressed[code]) {
            return false;
        } else if(this.down[code]) {
            return this.pressed[code] = true;
        }
        return false;
    };



    function GameOver() {

        return player.lifes <= 0 || enemies[0].y >= player.y;

    }

    function Win() {

        return enemies.length == 0;

    }



    config();