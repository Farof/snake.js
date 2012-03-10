"use strict";

(function (exports) {

  Math.randomInt = function (a, b) {
    a = a || 0;
    b = b || 100;
    return Math.floor(Math.random() * (b - a)) + a;
  };

  // Function.prototype.bind support for Safari
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (context) {
      var func = this;
      return function () {
        return func.apply(context, arguments);
      };
    };
  }

  var Snake = exports.Snake = function (options) {
    var ln, onKeydown = this.onKeydown, loop = this.loop;

    options = options || {};
    this.width = options.width || Snake.width;
    this.height = options.height || Snake.height;
    this.snakeWidth = options.snakeWidth || Snake.snakeWidth;
    this.snakeLength = options.snakeLength || Snake.snakeLength;
    this.speed = options.speed || Snake.speed;

    this.body = [{ x: Math.round(this.width / 2), y: Math.round(this.height / 2) }];
    this.direction = (this.width > this.height) ? Snake.direction.left : Snake.direction.top;

    ln = this.snakeLength;
    while (--ln) {
      this.grow();
    }

    this.popApple();

    this.onKeydownWrapper = function () {
      onKeydown.apply(this, arguments);
    }.bind(this);

    this.loopWrapper = function () {
      loop.apply(this, arguments);
    }.bind(this);
  };

  Object.defineProperties(Snake, {
    debug: { value: false, writable: true },

    moved: { value: false, writable: true },

    init: {
      value: function (root, options) {
        var snake = new Snake(options);
        while (root.childNodes[0]) {
          root.removeChild(root.childNodes[0]);
        }
        root.appendChild(snake.build());
        return snake;
      }
    },

    width: { value: 24 },
    height: { value: 16 },
    snakeWidth: { value: 20 },
    snakeLength: { value: 3 },
    speed: { value: 300 },

    direction: {
      value: {
        top: { x: 0, y: -1 },
        right: { x: 1, y: 0 },
        bottom: { x: 0, y: 1 },
        left: { x: -1, y: 0 }
      }
    }
  });

  Object.defineProperties(Snake.prototype, {
    start: {
      value: function () {
        this.hookEvents();
        if (!this.apple) {
          this.popApple();
        }
        this.timer = setInterval(this.loopWrapper, this.speed);
      }
    },

    loop: {
      value: function () {
        this.step();
        this.drawScene();
        if (this.isDead()) {
          this.gameOver();
        } else if (this.eating()) {
          this.powerUp();
        }
        this.moved = false;
      }
    },

    stop: {
      value: function () {
        clearInterval(this.timer);
        this.unhookEvents();
      }
    },

    isDead: {
      value: function () {
        var dead = false, head = this.body[0], i = this.body.length;

        if (head.x < 0 || head.y < 0 || head.x > (this.width - 1) || head.y > (this.height - 1)) {
          dead = true;
        }

        while (!dead && --i) {
          dead = head.x === this.body[i].x && head.y === this.body[i].y;
        }

        return dead;
      }
    },

    gameOver: {
      value: function () {
        this.stop();
        document.getElementById('debug').textContent = 'GAME OVER - Score = ' + (this.body.length - this.snakeLength);
        return this;
      }
    },

    eating: {
      value: function () {
        var apple = this.apple, head = this.body[0];
        return head.x === apple.x && head.y === apple.y
      }
    },

    powerUp: {
      value: function () {
        this.grow();
        this.popApple();
        this.drawScene();
        return this;
      }
    },

    grow: {
      value: function () {
        var last = this.body[this.body.length - 1];
        this.body.push({ x: last.x - this.direction.x, y: last.y - this.direction.y });
        return this;
      }
    },

    popApple: {
      value: function () {
        do {
          this.apple = { x: Math.randomInt(0, this.width), y: Math.randomInt(0, this.height) };
        } while(this.appleOnBody());
        return this;
      }
    },

    appleOnBody: {
      value: function () {
        var i = this.body.length, onBody = false;

        while (!onBody && --i >= 0) {
          onBody = this.body[i].x === this.apple.x && this.body[i].y === this.apple.y;
        }

        return onBody;
      }
    },

    build: {
      value: function () {
        var node = this.canvas = document.createElement('canvas');

        node.setAttribute('height', this.height * this.snakeWidth);
        node.setAttribute('width', this.width * this.snakeWidth);

        node.style.border = '1px solid #3E3D40';
        node.style.backgroundColor = 'white';
        node.style.display = 'inline-block';

        this.initCanvas();

        return node;
      }
    },

    initCanvas: {
      value: function () {
        var ctx = this.ctx = this.canvas.getContext('2d');
        this.drawScene();
        return this;
      }
    },

    resetCanvas: {
      value: function () {
        this.canvas.width = this.canvas.width;
        return this;
      }
    },

    drawScene: {
      value: function () {
        this.resetCanvas();

        if (Snake.debug) {
          this.drawDebug();
        }

        this.drawSnake();
        this.drawApple();

        return this;
      }
    },

    drawSnake: {
      value: function () {
        var
          i, ln, part,
          width = this.snakeWidth,
          ctx = this.ctx;

        ctx.fillStyle = 'black';
        ctx.lineWidth = 0.2;
        ctx.lineCap = 'butt';

        for (i = 0, ln = this.body.length; i < ln; i += 1) {
          part = this.body[i];

          ctx.beginPath();
          ctx.rect(width * part.x, width * part.y, width, width);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }

        return this;
      }
    },

    drawApple: {
      value: function () {
        var ctx = this.ctx, apple = this.apple, width = this.snakeWidth;

        ctx.fillStyle = 'grey';

        ctx.beginPath();
        ctx.rect(width * apple.x, width * apple.y, width, width);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        return this;
      }
    },

    drawDebug: {
      value: function () {
        var ctx = this.ctx, x = this.width, y = this.height;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.2;
        ctx.lineCap = 'butt';

        while (--x) {
          ctx.beginPath();
          ctx.moveTo(this.snakeWidth * x, 0);
          ctx.lineTo(this.snakeWidth * x, this.canvas.height);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }

        while (--y) {
          ctx.beginPath();
          ctx.moveTo(0, this.snakeWidth * y);
          ctx.lineTo(this.canvas.width, this.snakeWidth * y);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }

        return this;
      }
    },

    step: {
      value: function () {
        var first = this.body[0];
        this.body.pop();
        this.body.unshift({ x: first.x + this.direction.x, y: first.y + this.direction.y });
        return this;
      }
    },

    onKeydown: {
      value: function (e) {
        var key = e.keyCode;

        if (!this.moved && key === 38 && this.direction !== Snake.direction.bottom) {
          this.direction = Snake.direction.top;
          this.moved = true;
        } else if (!this.moved && key === 39 && this.direction !== Snake.direction.left) {
          this.direction = Snake.direction.right;
          this.moved = true;
        } else if (!this.moved && key === 40 && this.direction !== Snake.direction.top) {
          this.direction = Snake.direction.bottom;
          this.moved = true;
        } else if (!this.moved && key === 37 && this.direction !== Snake.direction.right) {
          this.direction = Snake.direction.left;
          this.moved = true;
        }
      }
    },

    hookEvents: {
      value: function () {
        document.addEventListener('keydown', this.onKeydownWrapper, false);
        return this;
      }
    },

    unhookEvents: {
      value: function () {
        document.removeEventListener('keydown', this.onKeydownWrapper, false);
        return this;
      }
    }
  });

}(this));
