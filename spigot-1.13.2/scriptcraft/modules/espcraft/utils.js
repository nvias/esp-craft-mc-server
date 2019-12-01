var config = require('espcraft/config');

var FEED_NAME = config.FEED_NAME;

module.exports = {
  getCoords: function (signFace, sign) {
    if (signFace === 'WEST') {
      return [sign.getX() + 1, sign.getY(), sign.getZ()];
    } else if (signFace === 'SOUTH') {
      return [sign.getX(), sign.getY(), sign.getZ() - 1];
    } else if (signFace === 'NORTH') {
      return [sign.getX(), sign.getY(), sign.getZ() + 1];
    } else if (signFace === 'EAST') {
      return [sign.getX() - 1, sign.getY(), sign.getZ()];
    }
  },

  getTopic: function (sign) {
    var module = sign.getLine(1);
    var pin = sign.getLine(2);

    var topic = FEED_NAME + module + '/' + pin;

    return topic;
  },

  getPayload: function (sign) {
    return sign.getLine(3);
  }
};