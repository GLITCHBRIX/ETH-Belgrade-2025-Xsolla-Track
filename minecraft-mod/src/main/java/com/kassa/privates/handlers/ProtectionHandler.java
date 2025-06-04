package com.kassa.privates.handlers;

import com.kassa.privates.data.PrivateManager;
import com.kassa.privates.data.PrivateZone;
import net.fabricmc.fabric.api.event.player.UseBlockCallback;
import net.fabricmc.fabric.api.event.player.UseEntityCallback;
import net.fabricmc.fabric.api.event.player.UseItemCallback;
import net.fabricmc.fabric.api.event.player.AttackBlockCallback;
import net.fabricmc.fabric.api.event.player.PlayerBlockBreakEvents;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.ActionResult;
import net.minecraft.util.Formatting;
import net.minecraft.util.math.BlockPos;

public class ProtectionHandler {
    
    public static void register() {
        PlayerBlockBreakEvents.BEFORE.register((world, player, pos, state, blockEntity) -> {
            if (world.isClient() || !(player instanceof ServerPlayerEntity serverPlayer)) {
                return true;
            }
            
            if (isProtectedAndNotOwner(serverPlayer, pos)) {
                sendProtectionMessage(serverPlayer);
                return false;
            }
            
            return true;
        });
        
        UseBlockCallback.EVENT.register((player, world, hand, hitResult) -> {
            if (world.isClient() || !(player instanceof ServerPlayerEntity serverPlayer)) {
                return ActionResult.PASS;
            }
            
            if (com.kassa.privates.items.SelectionStick.isSelectionStick(serverPlayer.getStackInHand(hand))) {
                return ActionResult.PASS;
            }
            
            BlockPos pos = hitResult.getBlockPos();
            
            if (isProtectedAndNotOwner(serverPlayer, pos)) {
                sendProtectionMessage(serverPlayer);
                return ActionResult.FAIL;
            }
            
            return ActionResult.PASS;
        });

        UseItemCallback.EVENT.register((player, world, hand) -> {
            if (world.isClient() || !(player instanceof ServerPlayerEntity serverPlayer)) {
                return ActionResult.PASS;
            }
            
            if (com.kassa.privates.items.SelectionStick.isSelectionStick(serverPlayer.getStackInHand(hand))) {
                return ActionResult.PASS;
            }
            
            BlockPos playerPos = serverPlayer.getBlockPos();
            
            if (isProtectedAndNotOwner(serverPlayer, playerPos)) {
                sendProtectionMessage(serverPlayer);
                return ActionResult.FAIL;
            }
            
            return ActionResult.PASS;
        });

        UseEntityCallback.EVENT.register((player, world, hand, entity, hitResult) -> {
            if (world.isClient() || !(player instanceof ServerPlayerEntity serverPlayer)) {
                return ActionResult.PASS;
            }
            
            BlockPos entityPos = entity.getBlockPos();
            
            if (isProtectedAndNotOwner(serverPlayer, entityPos)) {
                sendProtectionMessage(serverPlayer);
                return ActionResult.FAIL;
            }
            
            return ActionResult.PASS;
        });

        AttackBlockCallback.EVENT.register((player, world, hand, pos, direction) -> {
            if (world.isClient() || !(player instanceof ServerPlayerEntity serverPlayer)) {
                return ActionResult.PASS;
            }
            
            if (isProtectedAndNotOwner(serverPlayer, pos)) {
                sendProtectionMessage(serverPlayer);
                return ActionResult.FAIL;
            }
            
            return ActionResult.PASS;
        });
    }
    
    private static boolean isProtectedAndNotOwner(ServerPlayerEntity player, BlockPos pos) {
        PrivateManager manager = PrivateManager.getInstance();
        String worldName = player.getServerWorld().getRegistryKey().getValue().toString();
        
        PrivateZone zone = manager.getZoneAtPosition(pos, worldName);
        
        if (zone == null) {
            return false;
        }
        
        return !zone.isOwner(player.getUuidAsString());
    }
    
    private static void sendProtectionMessage(ServerPlayerEntity player) {
        player.sendMessage(
            Text.literal("This area is protected! Only the zone owner can perform actions here.")
                .formatted(Formatting.RED), 
            true
        );
    }
}