(function (exports) {
  "use strict";

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
    var
      onKeydown = this.onKeydown,
      loop = this.loop,
      onMousemove = this.onMousemove,
      onMousedown = this.onMousedown;

    this.setOptions(options);

    this.onKeydownWrapper = function () {
      onKeydown.apply(this, arguments);
    }.bind(this);

    this.loopWrapper = function () {
      loop.apply(this, arguments);
    }.bind(this);

    this.onMousemoveWrapper = function () {
      onMousemove.apply(this, arguments);
    }.bind(this);

    this.onMousedownWrapper = function () {
      onMousedown.apply(this, arguments);
    }.bind(this);

    this.build();
    this.init();
  };

  Object.defineProperties(Snake, {
    debug: { value: false, writable: true },

    init: {
      value: function (root, options) {
        var snake = new Snake(options);
        while (root.childNodes[0]) {
          root.removeChild(root.childNodes[0]);
        }
        root.appendChild(snake.canvas);
        snake.setup();
        return snake;
      }
    },

    width: { value: 24 },
    height: { value: 16 },
    snakeWidth: { value: 20 },
    snakeLength: { value: 3 },
    speed: { value: 300 },
    hudHeight: { value: 20 },

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
    playing: { value: false, writable: true },
    paused: { value: false, writable: true },
    showHelp: { value: false, writable: true },
    moved: { value: false, writable: true },

    setOptions: {
      value: function (options) {
        options = options || {};
        this.width = options.width || Snake.width;
        this.height = options.height || Snake.height;
        this.snakeWidth = options.snakeWidth || Snake.snakeWidth;
        this.snakeLength = options.snakeLength || Snake.snakeLength;
        this.speed = options.speed || Snake.speed;
        this.hudHeight = options.hudHeight || Snake.hudHeight;
        return this;
      }
    },

    setup: {
      value: function () {
        this.hookEvents();
        this.rect = {
          top: this.canvas.offsetTop,
          left: this.canvas.offsetLeft
        };
        this.drawScene();
      }
    },

    init: {
      value: function () {
        var ln;

        this.body = [{ x: Math.round(this.width / 2), y: Math.round(this.height / 2) }];
        this.direction = (this.width > this.height) ? Snake.direction.left : Snake.direction.top;

        ln = this.snakeLength;
        while (--ln) {
          this.grow();
        }

        this.popApple();
      }
    },

    start: {
      value: function () {
        if (!this.playing) {
          if (this.isDead()) {
            this.init();
          }

          this.paused = false;
          this.showHelp = false;
          this.playing = true;
          this.timer = setInterval(this.loopWrapper, this.speed);
        }
        return this;
      }
    },

    playPause: {
      value: function () {
        if (this.playing) {
          if (this.paused) {
            this.showHelp = false;
            this.timer = setInterval(this.loopWrapper, this.speed);
          } else {
            clearInterval(this.timer);
          }
          this.paused = !this.paused;
        }
        return this;
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
        if (this.playing) {
          clearInterval(this.timer);
          this.playing = false;
          this.paused = false;
        }
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
        this.drawHUD();
        return this;
      }
    },

    eating: {
      value: function () {
        var apple = this.apple, head = this.body[0];
        return head.x === apple.x && head.y === apple.y;
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
        } while (this.appleOnBody());
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

        node.setAttribute('height', this.height * this.snakeWidth + this.hudHeight);
        node.setAttribute('width', this.width * this.snakeWidth);

        node.style.border = '1px solid #3E3D40';
        node.style.backgroundColor = 'white';
        node.style.display = 'inline-block';

        this.ctx = this.canvas.getContext('2d');

        return node;
      }
    },

    destroy: {
      value: function () {
        this.stop();
        this.unhookEvents();
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

        this.drawn = {
          debug: false,
          snake: false,
          apple: false,
          hud: false
        };

        if (Snake.debug) {
          this.drawDebug();
        }

        this.drawSnake();
        this.drawApple();
        this.drawHUD();
        this.event ? this.event.consumed = true : null;

        return this;
      }
    },

    drawSnake: {
      value: function () {
        var
          i, ln, part,
          width = this.snakeWidth,
          ctx = this.ctx;

          if (!this.drawn.snake) {
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

            this.drawn.snake = true;
          }

        return this;
      }
    },

    drawApple: {
      value: function () {
        var ctx = this.ctx, apple = this.apple, width = this.snakeWidth;

        if (!this.drawn.apple) {
          ctx.fillStyle = 'grey';

          ctx.beginPath();
          ctx.rect(width * apple.x, width * apple.y, width, width);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();

          this.drawn.apple = true;
        }

        return this;
      }
    },

    drawHUD: {
      value: function () {
        var ctx = this.ctx, metrics;

        this.drawn.hud = {
          top: false,
          score: false,
          gameOver: false,
          startBt: false,
          helpBt: false,
          help: false
        };

        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.font = '12px Helvetica';
        ctx.textBaseline = 'middle';

        // clean hud zone
        console.log('clear', Date.now());
        ctx.clearRect(0, this.canvas.height - this.hudHeight - 1, this.canvas.width, this.hudHeight + 1);

        // draw hud top bar
        if (!this.drawn.hud.top) {
          ctx.beginPath();
          ctx.moveTo(0, this.canvas.height - this.hudHeight);
          ctx.lineTo(this.width * this.snakeWidth, this.canvas.height - this.hudHeight);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
          this.drawn.hud.top = true;
        }

        if (this.isDead() && !this.drawn.hud.gameOver) {
          // draw GAME OVER & restart button
          ctx.textAlign = 'center';
          ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height - this.hudHeight / 2);
          ctx.textAlign = 'left';
          this.drawn.hud.gameOver = true;
        }

        if (!this.drawn.hud.helpBt) {
          metrics = this.drawButton('help', 'right', this.canvas.width - 10, this.canvas.height - this.hudHeight / 2, null, this.help.bind(this));
          this.drawn.hud.helpBt = true;
        }

        if (!this.drawn.hud.startBt) {
          this.drawButton(this.playing ? (this.paused ? 'resume' : 'pause') : 'start', 'right', this.canvas.width - 26, this.canvas.height - this.hudHeight / 2, metrics, this.playing ? this.playPause.bind(this) : this.start.bind(this));
          this.drawn.hud.startBt = true;
        }

        // draw score
        if (!this.drawn.hud.score) {
          ctx.fillStyle = 'black';
          ctx.textAlign = 'left';
          console.log('score');
          ctx.fillText('score: ' + (this.body.length - this.snakeLength), 10, this.canvas.height - this.hudHeight / 2);
          this.drawn.hud.score = true;
        }

        if (this.showHelp) {
          this.drawHelp();
        }
      }
    },

    drawButton: {
      value: function (text, align, x, y, previous, onClick) {
        var
          ctx = this.ctx,
          previousAlign = ctx.textAlign,
          metrics = ctx.measureText(text),
          rect = this.event ? {
            x: this.event.clientX - this.rect.left,
            y: this.event.clientY - this.rect.top
          } : {},
          hover = false;

        rect.top = y - 7.5;
        rect.height = 15;
        rect.bottom = rect.top + rect.height;
        rect.left = x - metrics.width - (previous ? previous.width : 0) - 3;
        rect.width = metrics.width + 6;
        rect.right = rect.left + rect.width;

        previous = previous || { width: 0 };

        ctx.beginPath();
        ctx.rect(rect.left, rect.top, rect.width, rect.height);
        ctx.stroke();
        hover = ctx.isPointInPath(rect.x, rect.y);
        if (hover) {
          ctx.fillStyle = 'black';
          ctx.fill();
          if (!this.event.consumed && this.event.type === 'mousedown') {
            this.event ? this.event.consumed = true : null;
            console.log('consume: ', text, this.event.consumed);
            onClick();
          }
        }
        ctx.closePath();

        ctx.textAlign = align;
        ctx.fillStyle = hover ? 'white' : 'black';
        ctx.fillText(text, x - previous.width, y);
        ctx.textAlign = previousAlign;

        ctx.clearRect(rect.left - 1, rect.top - 1, 2, 2);
        ctx.fillRect(rect.left, rect.top, 2, 2);

        ctx.clearRect(rect.right - 1, rect.top - 1, 2, 2);
        ctx.fillRect(rect.right - 2, rect.top, 2, 2);

        ctx.clearRect(rect.left - 1, rect.bottom - 1, 2, 2);
        ctx.fillRect(rect.left, rect.bottom - 2, 2, 2);

        ctx.clearRect(rect.right - 1, rect.bottom - 1, 2, 2);
        ctx.fillRect(rect.right - 2, rect.bottom - 2, 2, 2);

        return metrics;
      }
    },

    drawHelp: {
      value: function () {
        var
          ctx = this.ctx, metrics, width = 0,
          lines = [
            'arrow keys -> move',
            'space -> pause'
          ],
          lh = 13,
          bp = 5,
          x = this.canvas.width / 2,
          y = (this.canvas.height - this.hudHeight) / 2 - (lh * lines.length / 2),
          i, ln;

        if (!this.drawn.hud.help) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;

          console.log('help');
          for (i = 0, ln = lines.length; i < ln; i += 1) {
            metrics = ctx.measureText(lines[i]);
            width = metrics.width > width ? metrics.width : width;
          }

          ctx.beginPath();
          ctx.rect(x - width / 2 - bp, y - lh / 2 - bp, width + bp * 2, lh * lines.length + bp * 2);
          ctx.fill();
          ctx.stroke();
          ctx.closePath();

          ctx.fillStyle = 'black';

          for (i = 0, ln = lines.length; i < ln; i += 1) {
            ctx.fillText(lines[i], x, (y + lh * i));
          }

          this.drawn.hud.help = true;
        }

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

    help: {
      value: function () {
        this.showHelp = !this.showHelp;

        if (this.playing && !this.paused) {
          this.playPause();
        }

        this.drawScene();

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

        if (this.playing) {
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

          if (key === 32) {
            this.playPause();
            this.drawHUD();
          }
        }
      }
    },

    onMousemove: {
      value: function (e) {
        this.event = e;
        this.drawHUD();
      }
    },

    onMousedown: {
      value: function (e) {
        this.event = e;
        this.drawHUD();
      }
    },

    hookEvents: {
      value: function () {
        document.addEventListener('keydown', this.onKeydownWrapper, false);
        this.canvas.addEventListener('mousemove', this.onMousemoveWrapper, false);
        this.canvas.addEventListener('mousedown', this.onMousedownWrapper, false);
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
