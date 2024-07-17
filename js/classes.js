class Logo extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["assets/logo.png"].texture);
        this.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        this.x = x;
        this.y = y;
    }
}

class Cannon extends PIXI.Sprite {
    constructor(x = 0, y = 0, vx = 0, vy = 0) {
        super(app.loader.resources["assets/cannon.png"].texture);
        this.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isAlive = true;
        this.tint = 0x33FF00;
    }
}
class CannonHitbox extends PIXI.Graphics {
    constructor(x=0, y=0) {
        super();
        this.drawRect(-2,-3,2,10);
        this.x = x;
        this.y = y;
        this.isAlive = true;
    }
}

class Barrier extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["assets/barrier.png"].texture);
        this.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.tint = 0x33FF00;
    }
}

class Beam extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["assets/beam.png"].texture);
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.alpha = 1.0;
    }
}

class SnapEffect extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["assets/snapEffect.png"].texture);
        this.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.alpha = 1.0;
    }
}

class Laser extends PIXI.Graphics {
    constructor(color=0xFFFFFF, x=0, y=0) {
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,2,10);
        this.endFill();
        this.x = x;
        this.y = y;
        // variables
        this.fwd = {x:0,y:-1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}