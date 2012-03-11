snake.js
==========

snake.js is a simple snake game written in javascript using the HTML Canvas element.

It should work on the latest version of all five major browsers: Firefox, Chrome, Internet Explorer, Safari and Opera.

Usage
-------

    // DOM node where you want to insert the canvas. All other children in that node will be removed.
    var node = document.getElementById('snake');

    // parameters you want to use to override the default ones
    var options = {
      snakeWidth: 20, // snake width in pixel = 1 case
      width: 24,      // width of the game in case
      height: 16,     // height of the game in case
      speed: 150      // time in millisecond between game loop: smaller is faster
    };

    var snake = Snake.init(node, options);

    // start the game with this method automatically or via the in-game start button
    snake.start();

    // pause the game with this method or via the in-game button
    snake.playPause();

    // stop the current game
    snake.stop();

    // destroy the game correctly to avoid memory leaks
    snake.destroy();

License
--------
The MIT License (MIT)

Copyright (c) 2012 Mathieu Merdy

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.