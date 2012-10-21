/**
 * @fileoverview Class to represent a single gamepad. This is a wrapper around
 * the browser's Gamepad object, mostly for event handling purposes. The browser
 * Gamepad doesn't fire any events, but instead requires polling---this class
 * abstracts the polling away by firing button and joystick events when set
 * thresholds are crossed.
 * @author jesse.gunsch@gmail.com (Jesse Gunsch)
 */

goog.provide('gamepad.Gamepad');

goog.require('gamepad.GamepadEvent');
goog.require('goog.events.EventTarget');

/**
 * A single Gamepad instance. Gamepads should not be instantiated directly but
 * should be retrieved with gamepad.getGamepad(int) or from a GamepadEvent.
 * @param {Gamepad} gamepad Actual browser Gamepad object.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
gamepad.Gamepad = function(gamepad) {
  goog.base(this);

  /**
   * Actual browser GamePad object.
   * @type {Gamepad}
   * @private
   */
  this.gamepad_ = gamepad;

  /**
   * Threshold for button presses/releases.
   * @type {number}
   * @private
   */
  this.buttonThreshold_ = 0.5;

  /**
   * Threshold for joystick change events.
   * @type {number}
   * @private
   */
  this.joystickThreshold_ = 0.1;

  /**
   * Snapshot of all button values when the last button event was fired.
   * @type {Array.<number>}
   * @private
   */
  this.lastButtonSnapshot_ = this.gamepad_.buttons;

  /**
   * Snapshot of all axis values when the last axis event was fired.
   * @type {Array.<number>}
   * @private
   */
  this.lastAxisSnapshot_ = this.gamepad_.axes;
};
goog.inherits(gamepad.Gamepad, goog.events.EventTarget);


/**
 * Format for gamepad object's raw button/axis raw data.
 * @typedef {axes: Array.<number>, buttons.<number>}
 */
gamepad.Gamepad.RawData;


/**
 * Set threshold for gamepad events.
 * @param {number} buttonThreshold Value above which a button value is
 *     considered a press and below which a button value is considered a
 *     release. Must be between 0.0 and 1.0.
 * @param {number} joystickThreshold Amount that a joystick value needs to
 *     change since its value at the last change event fired in order to fire
 *     a new change event.
 */
gamepad.Gamepad.prototype.setThresholds = function(buttonThreshold,
    joystickThreshold) {
  if (buttonThreshold < 0 || buttonThreshold > 1) {
    throw 'Invalid button threshold. Value must be in the range [0.0, 1.0].';
  }
  if (joystickThreshold < 0 || joystickThreshold > 1) {
    throw 'Invalid joystick threshold. Value must be in the range [0.0, 1.0].';
  }

  this.buttonThreshold_ = buttonThreshold;
  this.joystickThreshold_ = joystickThreshold;
};


/**
 * Get raw data from Gamepad. Fire events as necessary. Returns the raw data.
 * @return {gamepad.Gamepad.RawData} Button and axis data from this Gamepad.
 */
gamepad.Gamepad.prototype.poll = function() {
  var snapshot = {
    axes: this.gamepad_.axes,
    buttons: this.gamepad_.buttons
  };

  // Check for axis events.
  var axisEventOccurred = false;
  goog.array.forEach(snapshot.axes, function(axisValue, i) {
    if (Math.abs(axisValue - this.lastAxisSnapshot_[i]) >
        this.joystickThreshold_) {
      var adjustedValue = Math.round(axisValue / this.joystickThreshold_) *
          this.joystickThreshold_;
      this.dispatchEvent(new gamepad.GamepadEvent(
          gamepad.EventType.JOYSTICK_MOVED, this, null, i,
          adjustedValue));
      axisEventOccurred = true;
    }
  }, this);
  if (axisEventOccurred) {
    this.lastAxisSnapshot_ = snapshot.axes;
  }

  // Check for button events
  var buttonEventOccurred = false;
  goog.array.forEach(snapshot.buttons, function(buttonValue, i) {
    if (buttonValue >= this.buttonThreshold_ &&
        this.lastButtonSnapshot_[i] < this.buttonThreshold_) {
      this.dispatchEvent(new gamepad.GamepadEvent(
          gamepad.EventType.BUTTON_DOWN, this, i, null, 1));
      buttonEventOccurred = true;
    }

    // Released
    if (buttonValue < this.buttonThreshold_ &&
        this.lastButtonSnapshot_[i] >= this.buttonThreshold_) {
      this.dispatchEvent(new gamepad.GamepadEvent(
          gamepad.EventType.BUTTON_UP, this, i, null, 0));
      buttonEventOccurred = true;
    }
  }, this);
  if (buttonEventOccurred) {
    this.lastButtonSnapshot_ = snapshot.buttons;
  }

  return snapshot;
};
