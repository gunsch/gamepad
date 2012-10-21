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
 * @param {number} opt_button Number representing button that changed.
 * @param {number} opt_axis Number representing axis that changed.
 * @param {number} opt_value Value of button or joystick.
 * @constructor
 * @extends {goog.events.Event}
 */
gamepad.GamepadEvent = function(type, gamepad, opt_button, opt_axis,
    opt_value) {
  goog.base(this, type);

  /**
   * @type {gamepad.Gamepad}
   */
  this.gamepad = gamepad;

  /**
   * @type {number}
   */
  this.button = opt_button;

  /**
   * @type {number}
   */
  this.axis = opt_axis;

  /**
   * @type {number}
   */
  this.value = opt_value;
};
goog.inherits(gamepad.GamepadEvent, goog.events.Event);
