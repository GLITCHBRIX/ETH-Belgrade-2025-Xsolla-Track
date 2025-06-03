package com.kassa.privates.data;

import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.util.math.BlockPos;

import java.util.*;

public class PrivateManager {
    private static PrivateManager instance;
    private final Map<String, BlockPos> playerSelections = new HashMap<>();
    
    private PrivateManager() {}
    
    public static PrivateManager getInstance() {
        if (instance == null) {
            instance = new PrivateManager();
        }
        return instance;
    }
    
    public void setFirstPoint(ServerPlayerEntity player, BlockPos pos) {
        playerSelections.put(player.getUuidAsString(), pos);
    }
    
    public BlockPos getFirstPoint(ServerPlayerEntity player) {
        return playerSelections.get(player.getUuidAsString());
    }
}