package com.kassa.privates.data;

import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.util.math.BlockPos;

import java.util.*;

public class PrivateManager {
    private static PrivateManager instance;
    private final Map<String, BlockPos> playerFirstPoints = new HashMap<>();
    private final Map<String, BlockPos> playerSecondPoints = new HashMap<>();
    
    private PrivateManager() {}
    
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
}