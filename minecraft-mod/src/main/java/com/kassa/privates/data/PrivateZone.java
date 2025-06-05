package com.kassa.privates.data;

import com.google.gson.annotations.SerializedName;
import net.minecraft.util.math.BlockPos;

import java.util.UUID;

public class PrivateZone {
    @SerializedName("id")
    private String id;
    
    @SerializedName("name")
    private String name;
    
    @SerializedName("owner")
    private String ownerUuid;
    
    @SerializedName("ownerName")
    private String ownerName;
    
    @SerializedName("world")
    private String worldName;
    
    @SerializedName("minX")
    private int minX;
    
    @SerializedName("minY")
    private int minY;
    
    @SerializedName("minZ")
    private int minZ;
    
    @SerializedName("maxX")
    private int maxX;
    
    @SerializedName("maxY")
    private int maxY;
    
    @SerializedName("maxZ")
    private int maxZ;
    

    
    @SerializedName("createdAt")
    private long createdAt;
    
    public PrivateZone() {
    }
    
    public PrivateZone(String name, String ownerUuid, String ownerName, String worldName, 
                      BlockPos pos1, BlockPos pos2) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.ownerUuid = ownerUuid;
        this.ownerName = ownerName;
        this.worldName = worldName;
        this.createdAt = System.currentTimeMillis();
        
        this.minX = Math.min(pos1.getX(), pos2.getX());
        this.minY = Math.min(pos1.getY(), pos2.getY());
        this.minZ = Math.min(pos1.getZ(), pos2.getZ());
        this.maxX = Math.max(pos1.getX(), pos2.getX());
        this.maxY = Math.max(pos1.getY(), pos2.getY());
        this.maxZ = Math.max(pos1.getZ(), pos2.getZ());
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public String getOwnerUuid() { return ownerUuid; }
    public String getOwnerName() { return ownerName; }
    public String getWorldName() { return worldName; }
    public int getMinX() { return minX; }
    public int getMinY() { return minY; }
    public int getMinZ() { return minZ; }
    public int getMaxX() { return maxX; }
    public int getMaxY() { return maxY; }
    public int getMaxZ() { return maxZ; }
    public long getCreatedAt() { return createdAt; }

    public void setOwnerUuid(String ownerUuid) { this.ownerUuid = ownerUuid; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    
    
    public boolean isOwner(String uuid) {
        return ownerUuid.equals(uuid);
    }
    
    public boolean containsBlock(BlockPos pos, String world) {
        if (!worldName.equals(world)) {
            return false;
        }
        
        return pos.getX() >= minX && pos.getX() <= maxX &&
               pos.getY() >= minY && pos.getY() <= maxY &&
               pos.getZ() >= minZ && pos.getZ() <= maxZ;
    }

    public boolean intersectsWith(PrivateZone other) {
        if (!this.worldName.equals(other.worldName)) {
            return false;
        }
        
        boolean noOverlapX = this.maxX < other.minX || this.minX > other.maxX;
        boolean noOverlapY = this.maxY < other.minY || this.minY > other.maxY;
        boolean noOverlapZ = this.maxZ < other.minZ || this.minZ > other.maxZ;
        
        return !(noOverlapX || noOverlapY || noOverlapZ);
    }
    
    public int getVolumeBlocks() {
        return (maxX - minX + 1) * (maxY - minY + 1) * (maxZ - minZ + 1);
    }
    
    @Override
    public String toString() {
        return String.format("PrivateZone{name='%s', owner='%s', size=%dx%dx%d}", 
            name, ownerName, 
            maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);
    }
}