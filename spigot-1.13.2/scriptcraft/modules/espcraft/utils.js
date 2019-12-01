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
  }
};