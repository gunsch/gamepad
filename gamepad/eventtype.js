/**
 * @fileoverview Event types and event details for Gamepads.
 * @author jesse.gunsch@gmail.com (Jesse Gunsch)
 */

goog.provide('gamepad.EventType');
goog.provide('gamepad.GamepadEvent');

goog.require('goog.events.Event');

/**
 * Event types that are fired on a Gamepad or are associated with a Gamepad.
 * @enum {string}
 */
gamepad.EventType = {
  CONNECTED: 'gamepadConnected',
  DISCONNECTED: 'gamepadDisconnected',

  BUTTON_DOWN: 'gamepadButtonDown',
  BUTTON_UP: 'gamepadButtonReleased',
  JOYSTICK_MOVED: 'gamepadJoystickMoved'
};


/**
 * Gamepad Event object. These are fired whenever interesting events occur
 * involving Gamepad connections/disconnections or events on an actual Gamepad.
 * @param {string} type Event type.
 * @param {gamepad.Gamepad} gamepad Gamepad that this event relates to.
 * @param {?number=} opt_button Number representing button that changed.
 * @param {?number=} opt_axis Number representing axis that changed.
 * @param {?number=} opt_value Value of button or joystick.
 * @param {?number=} opt_timestamp Time the event occurred at.
 * @constructor
 * @extends {goog.events.Event}
 */
gamepad.GamepadEvent = function(type, gamepad, opt_button, opt_axis,
    opt_value, opt_timestamp) {
  goog.base(this, type);

  /**
   * Gamepad object that this event occurred on. Usually also this.src
   * but not always.
   * @type {gamepad.Gamepad}
   */
  this.gamepad = gamepad;

  /**
   * Button that was pressed, or -1 if not a button event.
   * @type {number}
   */
  this.button = opt_button || -1;

  /**
   * Axis that was moved, or -1 if not a joystick event.
   * @type {number}
   */
  this.axis = opt_axis || -1;

  /**
   * Value of the pressed button or moved joystick.
   * @type {number}
   */
  this.value = opt_value || 0;

  /**
   * Timestamp the event occurred at.
   * @type {number}
   */
  this.timestamp = opt_timestamp || -1;
};
goog.inherits(gamepad.GamepadEvent, goog.events.Event);
