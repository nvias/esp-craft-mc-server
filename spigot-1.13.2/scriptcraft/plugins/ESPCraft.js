'use strict';

var espUtils = require('espcraft/utils');
var MQTTNode = require('espcraft/MQTTNode');

var getCoords = espUtils.getCoords;
var getTopic = espUtils.getTopic;
var getPayload = espUtils.getPayload;

//=============================== EVENT SETUP ==============================

function handleSignActivation(event) {
  var sneaking = event.getPlayer().isSneaking();
  var action = event.getAction().toString();
  var clicked = event.getClickedBlock() ? event.getClickedBlock().getType().toString() : '';

  var signCommandActivated = sneaking
    && action === 'RIGHT_CLICK_BLOCK'
    && (clicked === 'SIGN' || clicked === 'WALL_SIGN');

  if (!signCommandActivated) {
    return;
  }

  try {
    var sign = event.getClickedBlock().state;
    var world = sign.getWorld();

    var signCords = [
      sign.getX(),
      sign.getY(),
      sign.getZ()
    ];

    var blockCords = [
      sign.getX(),
      sign.getY() - 1,
      sign.getZ()
    ];

    var topic = getTopic(sign);
    var payload = getPayload(sign);
    var signFacing = event.getBlockFace().toString();

    if (sign.getLine(0) === 'SEM' || sign.getLine(0) === 'RECV') {
      if (clicked === 'WALL_SIGN') {
        MQTTNode.prototype.createReceiver(getCoords(signFacing, sign), signCords, world, topic);
      } else {
        MQTTNode.prototype.createReceiver(blockCords, signCords, world, topic);
      }

      echo(event.getPlayer(), 'Receiver ACTIVATED!');
    } else if (sign.getLine(0) === 'TAM' || sign.getLine(0) === 'TRAN') {
      if (clicked === 'WALL_SIGN') {
        MQTTNode.prototype.createSender(getCoords(signFacing, sign), signCords, world, topic, payload);
      } else {
        MQTTNode.prototype.createSender(blockCords, signCords, world, topic, payload);
      }

      echo(event.getPlayer(), 'Transmitter ACTIVATED!');
    } else {
      echo(event.getPlayer(), 'Need Help? You need to type SEM/RECV | TAM/TRAN ;)');
    }
  } catch (err) {
    console.log('Invalid activation - ' + err);
  }
}

events.playerInteract(handleSignActivation);


//=============================== MINECRAFT COMMANDS ==============================

/** All is about this command */
command('pub', function (parameters) {
  var topic = parameters[0];
  var payload = parameters[1];

  console.log('SENDING: Topic: ' + topic + '; Msg: ' + payload);

  MQTTNode.client.publish(topic, payload);
});

