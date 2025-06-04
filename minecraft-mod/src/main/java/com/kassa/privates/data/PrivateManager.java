package com.kassa.privates.data;

import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.util.math.BlockPos;

import java.util.*;

import com.kassa.privates.api.ApiService;

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

    public PrivateZone findIntersectingZone(BlockPos pos1, BlockPos pos2, String worldName) {
        PrivateZone tempZone = new PrivateZone(
            "temp", "", "", worldName, pos1, pos2
        );
        
        for (PrivateZone existingZone : privateZones) {
            if (tempZone.intersectsWith(existingZone)) {
                return existingZone;
            }
        }
        
        return null;
    }

    public ZoneCreationResult createPrivateZone(String name, ServerPlayerEntity owner) {
        if (!hasBothPoints(owner)) {
            return new ZoneCreationResult(false, "No selection points set", null);
        }
        
        if (getPlayerZoneByName(owner, name) != null) {
            return new ZoneCreationResult(false, "Zone with this name already exists", null);
        }
        
        BlockPos pos1 = getFirstPoint(owner);
        BlockPos pos2 = getSecondPoint(owner);
        String worldName = owner.getServerWorld().getRegistryKey().getValue().toString();
        
        PrivateZone newZone  = new PrivateZone(
            name,
            owner.getUuidAsString(),
            owner.getName().getString(),
            worldName,
            pos1,
            pos2
        );

        for (PrivateZone existingZone : privateZones) {
            if (newZone.intersectsWith(existingZone)) {
                return new ZoneCreationResult(false, "Zone intersects with existing zone", null);
            }
        }


        System.out.println("Sending zone creation request to external API...");
        ApiService.ApiResponse apiResponse = ApiService.createZone(
            name, 
            owner, 
            newZone.getId()
        );
        
        if (!apiResponse.isSuccess()) {
            System.err.println("External API rejected zone creation: " + apiResponse.getMessage());
            return new ZoneCreationResult(false, 
                "External service rejected zone creation: " + apiResponse.getMessage(), null);
        }
        
        System.out.println("External API approved zone creation, saving zone...");
        
        privateZones.add(newZone);
        saveZones();
        
        clearPoints(owner);

        return new ZoneCreationResult(true, "Zone created successfully", newZone);
    }

    public static class ZoneCreationResult {
        private final boolean success;
        private final String message;
        private final PrivateZone zone;
        
        public ZoneCreationResult(boolean success, String message, PrivateZone zone) {
            this.success = success;
            this.message = message;
            this.zone = zone;
        }
        
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public PrivateZone getZone() { return zone; }
    }

    public PrivateZone getPlayerZoneByName(ServerPlayerEntity player, String name) {
        String playerUuid = player.getUuidAsString();
        return privateZones.stream()
            .filter(zone -> zone.getOwnerUuid().equals(playerUuid))
            .filter(zone -> zone.getName().equals(name))
            .findFirst()
            .orElse(null);
    }

    public PrivateZone getZoneAtPosition(BlockPos pos, String worldName) {
        return privateZones.stream()
            .filter(zone -> zone.containsBlock(pos, worldName))
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