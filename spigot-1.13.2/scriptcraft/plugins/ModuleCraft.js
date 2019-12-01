'use strict';

//edit these to match your preferences

var FEED_NAME = 'nvias/MC/';
var MQTT_SERVER = 'tcp://52.59.197.227:1884';

var mqtt = require('sc-mqtt');
var utils = require('utils');
var espcraft = require('utils/espcraft');
var JavaString = java.lang.String;

//=============================== EVENT SETUP ==============================
console.log(espcraft.ahoj);

function getCoords(signFace, sign) {
  if (signFace === 'WEST') {
    return [sign.getX() + 1, sign.getY(), sign.getZ()];
  } else if (signFace == "SOUTH") {
    return [sign.getX(), sign.getY(), sign.getZ() - 1];
  } else if (signFace == "NORTH") {
    return [sign.getX(), sign.getY(), sign.getZ() + 1];
  } else if (signFace == "EAST") {
    return [sign.getX() - 1, sign.getY(), sign.getZ()];
  }
}

function sign_activation(event) {
  try {
    var sneaking = event.getPlayer().isSneaking();
    var action = event.getAction().toString();
    var clicked = event.getClickedBlock().getType().toString();

    if (sneaking && action === 'RIGHT_CLICK_BLOCK' && (clicked === 'SIGN' || clicked === 'WALL_SIGN')) {
      var sign = event.getClickedBlock().state;

      var signCords = [sign.getX(), sign.getY(), sign.getZ()];
      var blockCords = [sign.getX(), sign.getY() - 1, sign.getZ()];
      var world = sign.getWorld();
      var topic = getTopic(sign, event.getPlayer());
      var payload = getPayload(sign);

      if (sign.getLine(0) === 'SEM' || sign.getLine(0) === 'RECV') {
        if (clicked === 'WALL_SIGN') {
          MQTTNode.prototype.createReceiver(getCoords(event.getBlockFace().toString(), sign), signCords, world, topic);
        } else {
          MQTTNode.prototype.createReceiver(blockCords, signCords, world, topic);
        }
        echo(event.getPlayer(), 'Receiver ACTIVATED!');
      } else if (sign.getLine(0) === 'TAM' || sign.getLine(0) === 'TRAN') {
        if (clicked === 'WALL_SIGN') {
          MQTTNode.prototype.createSender(getCoords(event.getBlockFace().toString(), sign), signCords, world, topic, payload);
        } else {
          MQTTNode.prototype.createSender(blockCords, signCords, world, topic, payload);
        }
        echo(event.getPlayer(), 'Transmitter ACTIVATED!');
      } else {
        echo(event.getPlayer(), 'Need Help? You need to type SEM/RECV | TAM/TRAN ;)'); // Write SEM/RECV | TAM/TRAN
      }
    }

  } catch (err) {
    console.log('Invalid activation - ' + err);
  }
}


events.playerInteract(sign_activation);

//=============================== TOPIC DECODING ===============================

function getTopic(sign, player) {

  var module = sign.getLine(1), pin = sign.getLine(2);
  var topic = FEED_NAME + module + '/' + pin;

  console.log('Topic: ' + topic);
  return topic;
}

function getPayload(sign) {
  return sign.getLine(3);
}

function MQTTNode(blockCords, signCords, world, topic, payload) { // constructor function

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
  if (!payload) {
    for (var i = 0; i < MQTTNode.subTopics.length; i++) {
      if (topic === MQTTNode.subTopics[i]) {
        return;
      }
    }

    console.log('Subscribing to: ' + topic);
    MQTTNode.client.subscribe(topic);
    MQTTNode.subTopics.push(topic);
  } else {
    var drone = new Drone(this.x, this.y, this.z, 0, this.world);
    drone.run('setblock ' + this.x + ' ' + (this.y - 1) + ' ' + this.z + ' air');
    drone.run('setblock ' + this.x + ' ' + (this.y - 1) + ' ' + this.z + ' command_block{Command:"jsp pub ' + this.topic + ' ' + this.payload + '"}');
  }
}

MQTTNode.receiving = [];
MQTTNode.sending = [];

MQTTNode.subTopics = [];

MQTTNode.client = mqtt.client(MQTT_SERVER);
MQTTNode.client.connect();

MQTTNode.prototype.createReceiver = function (blockCords, signCords, world, topic) {
  MQTTNode.receiving.push(new MQTTNode(blockCords, signCords, world, topic, null));
};

MQTTNode.prototype.createSender = function (blockCords, signCords, world, topic, payload) {
  if (!payload) payload = '0';

  MQTTNode.sending.push(new MQTTNode(blockCords, signCords, world, topic, payload));
};

/** This handles messages */
MQTTNode.client.onMessageArrived(function (topic, msg) {
  var i;
  var message = new JavaString(msg.payload);

  console.log('# MQTT MSG: ' + topic + ':' + message + '#');

  var deadConnection = false;

  if (parseInt(message) === 0 || message === 'OFF') {
    deadConnection = true;
    MQTTNode.receiving.forEach(function (receiver) {
      if (topic === receiver.topic) {
        if (receiver.signExists()) {
          receiver.deactivate();
          deadConnection = false;
        }
      }
    })
  } else if (parseInt(message) === 1 || message === 'ON') {
    deadConnection = true;
    MQTTNode.receiving.forEach(function (receiver) {
      if (topic === receiver.topic) {
        if (receiver.signExists()) {
          receiver.activate();
          deadConnection = false;
        }
      }
    })
  }
});

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

//// the following callbacks are optional 
//MQTTNode.client.onDeliveryComplete(function (deliveryToken) {
//    // optional callback to handle completion of outgoing messages
//});

MQTTNode.client.onConnectionLost(function (cause) {
  // optional callback to handle connection loss
  console.log('MQTT connection lost. Restarting the plugin...');
  refresh(true);
});


/** All is about this command */
command('pub', function (parameters, player) {

  //if (MQTTNode.signExists()) {

  var topic = parameters[0];
  var payload = parameters[1];

  console.log('SENDING: Topic: ' + topic + '; Msg: ' + payload);
  MQTTNode.client.publish(topic, payload);
  //}e
  //else {
  //    var drone = new Drone(this.x, this.y-1, this.z, 0, this.world);
  //    drone.place('1');
  //}
});

