var JavaString = java.lang.String;
var mqtt = require('sc-mqtt');
var utils = require('utils');
var config = require('espcraft/config');

var MQTT_SERVER = config.MQTT_SERVER;

/** MQTTNode constructor */
var MQTTNode = function (blockCords, signCords, world, topic, payload) {

  this.x = blockCords[0];
  this.y = blockCords[1];
  this.z = blockCords[2];

  this.signX = signCords[0];
  this.signY = signCords[1];
  this.signZ = signCords[2];

  this.world = utils.world(world);

  this.topic = topic;
  this.payload = payload;

  //is receiver block
  if (!this.payload) {
    for (var i = 0; i < MQTTNode.subTopics.length; i++) {
      if (this.topic === MQTTNode.subTopics[i]) {
        return;
      }
    }

    console.log('[MQTTNode] Subscribing to: ' + this.topic);

    MQTTNode.client.subscribe(this.topic);
    MQTTNode.subTopics.push(this.topic);
  } else {
    var drone = new Drone(this.x, this.y, this.z, 0, this.world);

    console.log('[MQTTNode] Publishing to: ' + this.topic);

    drone.run('setblock ' + this.x + ' ' + (this.y - 1) + ' ' + this.z + ' air');
    drone.run('setblock ' + this.x + ' ' + (this.y - 1) + ' ' + this.z + ' command_block{Command:"jsp pub ' + this.topic + ' ' + this.payload + '"}');
  }
};

MQTTNode.receiving = [];
MQTTNode.sending = [];

MQTTNode.subTopics = [];

MQTTNode.client = mqtt.client(MQTT_SERVER);
MQTTNode.client.connect();

MQTTNode.prototype.createReceiver = function (blockCords, signCords, world, topic) {
  MQTTNode.receiving.push(new MQTTNode(blockCords, signCords, world, topic, null));
};

MQTTNode.prototype.createSender = function (blockCords, signCords, world, topic, payload) {
  if (!payload) {
    payload = '0';
  }

  MQTTNode.sending.push(new MQTTNode(blockCords, signCords, world, topic, payload));
};

MQTTNode.prototype.activate = function (type) {
  var drone = new Drone(this.x, this.y, this.z, 0, this.world);

  drone.place('152'); //152 - REDSTONE_BLOCK
};

MQTTNode.prototype.deactivate = function () {
  var drone = new Drone(this.x, this.y, this.z, 0, this.world);

  drone.place('42'); //42 - IRON_BLOCK
};

MQTTNode.prototype.signExists = function () {
  var block = this.world.getBlockAt(this.signX, this.signY, this.signZ);

  if (block.getType().toString() === 'SIGN' || block.getType().toString() === 'WALL_SIGN') {
    return true;
  }

  return false;
};

/** This handles messages */
MQTTNode.client.onMessageArrived(function (topic, msg) {
  var message = new JavaString(msg.payload);

  console.log('[MQTTNode] Incoming message: ' + topic + ':' + message);

  var isMessageValid = parseInt(message) === 0 || message === 'OFF' || parseInt(message) === 1 || message === 'ON';

  if (!isMessageValid) {
    console.log('[MQTTNode] Message invalid');
    return;
  }

  MQTTNode.receiving.forEach(function (receiver) {
    if (topic !== receiver.topic || !receiver.signExists()) {
      return;
    }

    if (parseInt(message) === 0 || message === 'OFF') {
      receiver.deactivate();
    } else if (parseInt(message) === 1 || message === 'ON') {
      receiver.activate();
    }

  })
});

MQTTNode.client.onConnectionLost(function (cause) {
  console.log('[MQTT] Connection lost. Restarting the plugin...');
  refresh(true);
});

module.exports = MQTTNode;