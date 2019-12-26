@echo off
java -Xms512M -Xmx1G -XX:+UseConcMarkSweepGC -classpath sc-mqtt.jar;spigot-1.13.2.jar org.bukkit.craftbukkit.Main
pause