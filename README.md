# Gamepad API

A wrapper around the new working-draft
[Gamepad API](http://www.w3.org/TR/gamepad/). Uses Google's
[Closure Tools](https://developers.google.com/closure/) for libraries and
deploying.

## Description

The Gamepad API provides a very low-level interface for interacting with gamepads
plugged into your computer (such as the PS3 Controller). This includes a lack of
event handling besides needing to poll the controller directly for values. This
library wraps that by generating events on button presses, joystick movement
(above a settable threshold), and controller connects/disconnects.

The provided library code is in `gamepad`, with the demo code in `demo`.

## Installation

This depends on the Closure builder and compiler. Expected locations can be
found at the top of the makefile, or the entire demo can be built with the
following commands:

    git clone git://github.com/gunsch/gamepad.git
    cd gamepad
    svn checkout http://closure-library.googlecode.com/svn/trunk/ closure-library
    wget http://closure-compiler.googlecode.com/files/compiler-latest.zip
    unzip -d closure-compiler compiler-latest.zip
    rm compiler-latest.zip
    make

Once built, the file `demo.html` should have everything you need.

## Example Usage

While this API requires the Closure libraries, its use is meant to be simple.
The following code snippet is a minimal example of what it would take to get
a joystick and listen for events:

    var handleJoystickConnection = function(event) {
      var newGamepad = event.gamepad;
      goog.events.listen(newGamepad, gamepad.EventType.JOYSTICK_MOVED, handleJoystickMoved);
      goog.events.listen(newGamepad, [gamepad.EventType.BUTTON_DOWN, gamepad.EventType.BUTTON_UP], handleButtonEvent);
    };

    var handleJoystickMoved = function(event) {
      // Joystick moved
      var joystickAxisId = event.axis;
      var joystickValue = event.value;
    };

    var handleButtonEvent = function(event) {
      var buttonId = event.button;
      if (event.type == gamepad.EventType.BUTTON_DOWN) {
        // Button pressed
      } else if (event.type == gamepad.EventType.BUTTON_UP) {
        // Button released
      }
    };

    var manager = gamepad.GamepadManager.getInstance();
    goog.events.listen(manager, gamepad.EventType.CONNECTED, handleJoystickConnection);
    manager.pollGamepads(true);

## Known Issues

1. Only supported in Chrome 22. Support for Firefox to follow.
1. Only tested with PS3 DualShock controller. Let me know how/if it works with other controllers.
1. Gamepad will not appear as "connected" until you actually press one or more buttons. This seems to be a browser-level issue.

## License

Copyright (c) 2012 Jesse Gunsch

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
