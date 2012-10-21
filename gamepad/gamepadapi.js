/**
 * @fileoverview Entry point for interacting with Gamepads. Programmatically
 * interacting with devices currently differs between browsers (the spec is
 * still in working draft state), but also does not provide significant event
 * handling. This wrapper provides thresholding and event firing for common
 * Gamepad events (button presses above a threshold, joystick changing beyond
 * a threshold) for easier development.
 * @author jesse.gunsch@gmail.com (Jesse Gunsch)
 */

goog.provide('gamepad');
goog.provide('gamepad.GamepadManager');

goog.require('gamepad.EventType');
goog.require('gamepad.Gamepad');
goog.require('gamepad.GamepadEvent');
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');

/**
 * Constructor for managing gamepads. Should be used from gamepad.getInstance(),
 * not instantiated directly.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
gamepad.GamepadManager = function() {
  goog.base(this);

  /**
   * @type {Array.<Gamepad>}
   * @private
   */
  this.knownRawGamepads_ = [];

  /**
   * @type {Array.<gamepad.Gamepad>}
   * @private
   */
  this.gamepads_ = [];

  /**
   * Timer for polling for gamepads.
   * @type {goog.Timer}
   * @private
   */
  this.pollingTimer_ = new goog.Timer(16);

  /**
   * Default threshold for button presses/releases. Any newly connected gamepads
   * are automatically configured with this threshold.
   * @type {number}
   * @private
   */
  this.defaultButtonThreshold_ = 0.5;

  /**
   * Default threshold for a joystick change event. Any newly connected gamepads
   * are automatically configured with this threshold.
   * @type {number}
   * @private
   */
  this.defaultJoystickThreshold_ = 0.1;
};
goog.inherits(gamepad.GamepadManager, goog.events.EventTarget);
goog.addSingletonGetter(gamepad.GamepadManager);


/** @override */
gamepad.GamepadManager.prototype.disposeInternal = function() {
  goog.array.forEach(this.gamepads_, goog.dispose);
  goog.dispose(this.pollingTimer_);

  goog.array.clear(this.gamepads_);
  goog.array.clear(this.knownRawGamepads_);
};


/**
 * Start or stop polling for gamepad connections or button presses.
 * @param {boolean} enableConnectionPolling True to start polling for gamepad
 *     connections or disconnections, false to stop.
 * @param {boolean} opt_enableGamepadPolling True to start polling for gamepad
 *     button/joystick changes, false to stop. If not provided, will take the
 *     same value as enableConnectionPolling.
 */
gamepad.GamepadManager.prototype.pollGamepads = function(
    enableConnectionPolling, opt_enableGamepadPolling) {
  var enableGamepadPolling = typeof opt_enableGamepadPolling == 'boolean' ?
      opt_enableGamepadPolling : enableConnectionPolling;

  if (enableConnectionPolling) {
    goog.events.listen(this.pollingTimer_, goog.Timer.TICK,
        this.pollForConnections_, false, this);
  } else {
    goog.events.unlisten(this.pollingTimer_, goog.Timer.TICK,
        this.pollForConnections_, false, this);
  }

  if (enableGamepadPolling) {
    goog.events.listen(this.pollingTimer_, goog.Timer.TICK,
        this.pollForButtons_, false, this);
  } else {
    goog.events.unlisten(this.pollingTimer_, goog.Timer.TICK,
        this.pollForButtons_, false, this);
  }

  if (enableConnectionPolling || enableGamepadPolling) {
    this.pollingTimer_.start();
  } else {
    this.pollingTimer_.stop();
  }
};


/**
 * Check if gamepads have been added or removed. Fire events if so.
 * @private
 */
gamepad.GamepadManager.prototype.pollForConnections_ = function() {
  if (navigator.webkitGetGamepads) {
    var rawGamepads = goog.array.clone(navigator.webkitGetGamepads());

    for (var i = rawGamepads.length - 1, rawGamepad; i >= 0; i--) {
      var rawGamepad = rawGamepads[i];
      if (rawGamepad != this.knownRawGamepads_[i]) {
        // Gamepad i was disconnected
        if (this.knownRawGamepads_[i] && this.gamepads_[i]) {
          // Dispatch two DISCONNECTED events: one for the gamepad manager,
          // and one for the controller itself. User can listen for either.
          var event = new gamepad.GamepadEvent(gamepad.EventType.DISCONNECTED,
              this.gamepads_[i]);
          this.gamepads_[i].dispatchEvent(event);
          this.dispatchEvent(event);
        }

        // New gamepad was connected. Create Pad object and dispatch CONNECTED
        // event.
        if (rawGamepad) {
          this.gamepads_[i] = new gamepad.Gamepad(rawGamepad);
          this.gamepads_[i].setThresholds(this.defaultButtonThreshold_,
              this.defaultJoystickThreshold_);
          this.dispatchEvent(new gamepad.GamepadEvent(
              gamepad.EventType.CONNECTED, this.gamepads_[i]));
        }
      }
    }

    this.knownRawGamepads_ = rawGamepads;
  }
};


/**
 * Return the Pad object with a given id.
 * @param {number} id Pad number. Should be in the range [0, 3].
 * @return {gamepad.Gamepad} Associated Pad object.
 */
gamepad.GamepadManager.prototype.getGamepad = function(id) {
  return this.gamepads_[id];
};


/**
 * Poll all existing gamepads for events.
 * @private
 */
gamepad.GamepadManager.prototype.pollForButtons_ = function() {
  goog.array.forEach(this.gamepads_, function(gamepad) {
    gamepad.poll();
  });
};


/**
 * Set threshold for gamepad events on all currently connected gamepads
 * and the default for future gamepads.
 * @param {number} buttonThreshold Value above which a button value is
 *     considered a press and below which a button value is considered a
 *     release. Must be between 0.0 and 1.0.
 * @param {number} joystickThreshold Amount that a joystick value needs to
 *     change since its value at the last change event fired in order to fire
 *     a new change event.
 */
gamepad.GamepadManager.prototype.setThresholds = function(buttonThreshold,
    joystickThreshold) {
  if (buttonThreshold < 0 || buttonThreshold > 1) {
    throw 'Invalid button threshold. Value must be in the range [0.0, 1.0].';
  }
  if (joystickThreshold < 0 || joystickThreshold > 1) {
    throw 'Invalid joystick threshold. Value must be in the range [0.0, 1.0].';
  }

  this.defaultButtonThreshold_ = buttonThreshold;
  this.defaultJoystickThreshold_ = joystickThreshold;
  goog.array.forEach(this.gamepads_, function(gamepad) {
    gamepad && gamepad.setThresholds(buttonThreshold, joystickThreshold);
  });
};
