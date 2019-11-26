
//command('block', function (parameters, player) {
//    var drone = new Drone(player);
//    drone.place('152');
//});

//utils = require('utils');
//mqtt = require('mqtt');

////var sounds = require('sounds');
//function activate_sign(event)
//{
//    //event.getAction() RIGHT_CLICK_BLOCK

//    var sneaking = event.getPlayer().isSneaking();
//    var action = event.getAction().toString();
//    var clicked = event.getClickedBlock().getType().toString();

//    //console.log(event.getPlayer().isSneaking());
//    //console.log(event.getAction());
//    //console.log(event.getClickedBlock().getState());

//    if (sneaking && action === 'RIGHT_CLICK_BLOCK') {

//        if (clicked === 'WALL_SIGN') {
//            //if (hasItems(event, 'REDSTONE', 1))
//            mqtt.createMQTTNode(event.getClickedBlock().state, true);
//        }
//        else if (clicked === 'SIGN') {
//            //if (hasItems(event, 'REDSTONE', 1))
//            mqtt.createMQTTNode(event.getClickedBlock().state, false);
//        }
//    }

//    //function hasItems(event, item, count) {  
//    //    if (event.hasItem()){
//    //        if (event.getItem().getType().toString() === item && event.getItem().getAmount() === count) {
//    //            //console.log('Has items.');
//    //            return true;
//    //        }
//    //    }
//    //    return false;    
//    //    //event.useItemInHand();
//    //}

//    //function addNode(sign, isWallSign) {
//    //    console.log("Adding node!");

//    //    var modul = sign.getLine(0);
//    //    var topic = sign.getLine(1);
//    //    var channel = sign.getLine(2);
//    //    var world = sign.getWorld();
//    //    var x = sign.getX();
//    //    var y = sign.getY();
//    //    var z = sign.getZ();
//    //}
//}

//events.playerInteract(activate_sign);

////!!!! hub.spigotmc.org/javadocs/spigot/org/bukkit/block/Block.html
////getBlockPower()
////block.isBlockPowered()
////block.isBlockIndirectlyPowered()

