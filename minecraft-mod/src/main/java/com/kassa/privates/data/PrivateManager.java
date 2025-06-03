package com.kassa.privates.data;

import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.util.math.BlockPos;

import java.util.*;

public class PrivateManager {
    private static PrivateManager instance;
    private final Map<String, BlockPos> playerFirstPoints = new HashMap<>();
    private final Map<String, BlockPos> playerSecondPoints = new HashMap<>();
    private final List<PrivateZone> privateZones = new ArrayList<>();
    private final DataStorage dataStorage;

    private PrivateManager() {
        this.dataStorage = new DataStorage();
        loadZones();
    }
    
    public static PrivateManager getInstance() {
        if (instance == null) {
            instance = new PrivateManager();
        }
        return instance;
    }
    
    public void setFirstPoint(ServerPlayerEntity player, BlockPos pos) {
        playerFirstPoints.put(player.getUuidAsString(), pos);
    }
    
    public BlockPos getFirstPoint(ServerPlayerEntity player) {
        return playerFirstPoints.get(player.getUuidAsString());
    }
    
    public void setSecondPoint(ServerPlayerEntity player, BlockPos pos) {
        playerSecondPoints.put(player.getUuidAsString(), pos);
    }
    
    public BlockPos getSecondPoint(ServerPlayerEntity player) {
        return playerSecondPoints.get(player.getUuidAsString());
    }

    public boolean hasFirstPoint(ServerPlayerEntity player) {
        return playerFirstPoints.containsKey(player.getUuidAsString());
    }
    
    public boolean hasSecondPoint(ServerPlayerEntity player) {
        return playerSecondPoints.containsKey(player.getUuidAsString());
    }
    
    public boolean hasBothPoints(ServerPlayerEntity player) {
        return hasFirstPoint(player) && hasSecondPoint(player);
    }

    public void clearPoints(ServerPlayerEntity player) {
        String uuid = player.getUuidAsString();
        playerFirstPoints.remove(uuid);
        playerSecondPoints.remove(uuid);
    }

    public boolean createPrivateZone(String name, ServerPlayerEntity owner) {
        if (!hasBothPoints(owner)) {
            return false;
        }
        
        if (getPlayerZoneByName(owner, name) != null) {
            return false;
        }
        
        BlockPos pos1 = getFirstPoint(owner);
        BlockPos pos2 = getSecondPoint(owner);
        String worldName = owner.getServerWorld().getRegistryKey().getValue().toString();
        
        PrivateZone zone = new PrivateZone(
            name,
            owner.getUuidAsString(),
            owner.getName().getString(),
            worldName,
            pos1,
            pos2
        );
        
        privateZones.add(zone);
        saveZones();
        
        clearPoints(owner);
        
        return true;
    }

    public PrivateZone getPlayerZoneByName(ServerPlayerEntity player, String name) {
        String playerUuid = player.getUuidAsString();
        return privateZones.stream()
            .filter(zone -> zone.getOwnerUuid().equals(playerUuid))
            .filter(zone -> zone.getName().equals(name))
            .findFirst()
            .orElse(null);
    }

    private void saveZones() {
        dataStorage.saveZones(privateZones);
    }

    private void loadZones() {
        List<PrivateZone> loadedZones = dataStorage.loadZones();
        privateZones.clear();
        privateZones.addAll(loadedZones);
    }
}