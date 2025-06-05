package com.kassa.privates.handlers;

import com.kassa.privates.data.PrivateManager;
import com.kassa.privates.items.SelectionStick;
import net.fabricmc.fabric.api.event.player.UseBlockCallback;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.ActionResult;
import net.minecraft.util.Formatting;
import net.minecraft.util.math.BlockPos;

public class SelectionHandler {
    
    public static void register() {
        UseBlockCallback.EVENT.register((player, world, hand, hitResult) -> {
            if (world.isClient() || !(player instanceof ServerPlayerEntity serverPlayer)) {
                return ActionResult.PASS;
            }
            
            if (!SelectionStick.isSelectionStick(serverPlayer.getStackInHand(hand))) {
                return ActionResult.PASS;
            }
            
            BlockPos clickedPos = hitResult.getBlockPos();
            PrivateManager manager = PrivateManager.getInstance();
            
            if (serverPlayer.isSneaking()) {
                manager.setSecondPoint(serverPlayer, clickedPos);
                
                serverPlayer.sendMessage(
                    Text.literal("Second point set: ")
                        .formatted(Formatting.GREEN)
                        .append(Text.literal(String.format("(%d, %d, %d)", 
                            clickedPos.getX(), clickedPos.getY(), clickedPos.getZ()))
                            .formatted(Formatting.YELLOW)), 
                    false
                );
                
                if (manager.hasBothPoints(serverPlayer)) {
                    BlockPos firstPoint = manager.getFirstPoint(serverPlayer);
                    int sizeX = Math.abs(clickedPos.getX() - firstPoint.getX()) + 1;
                    int sizeY = Math.abs(clickedPos.getY() - firstPoint.getY()) + 1;
                    int sizeZ = Math.abs(clickedPos.getZ() - firstPoint.getZ()) + 1;
                    int totalBlocks = sizeX * sizeY * sizeZ;
                    
                    serverPlayer.sendMessage(
                        Text.literal("Area selected! Size: ")
                            .formatted(Formatting.AQUA)
                            .append(Text.literal(String.format("%dx%dx%d (%d blocks)", 
                                sizeX, sizeY, sizeZ, totalBlocks))
                                .formatted(Formatting.WHITE)), 
                        false
                    );
                }
            } else {
                manager.setFirstPoint(serverPlayer, clickedPos);
                
                serverPlayer.sendMessage(
                    Text.literal("First point set: ")
                        .formatted(Formatting.GREEN)
                        .append(Text.literal(String.format("(%d, %d, %d)", 
                            clickedPos.getX(), clickedPos.getY(), clickedPos.getZ()))
                            .formatted(Formatting.YELLOW)), 
                    false
                );
            }
            
            return ActionResult.SUCCESS;
        });
    }
}