package com.kassa.privates.commands;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import com.kassa.privates.data.PrivateManager;
import com.kassa.privates.data.PrivateZone;
import com.kassa.privates.items.SelectionStick;
import net.minecraft.command.CommandRegistryAccess;
import net.minecraft.server.command.CommandManager;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;
import net.minecraft.util.math.BlockPos;

public class PrivateCommand {
    public static void register(CommandDispatcher<ServerCommandSource> dispatcher, 
                               CommandRegistryAccess registryAccess, 
                               CommandManager.RegistrationEnvironment environment) {
        
        dispatcher.register(CommandManager.literal("private")
            .requires(source -> source.hasPermissionLevel(0))
            .then(CommandManager.literal("wand")
                .executes(PrivateCommand::giveWand))

            .then(CommandManager.literal("create")
                .then(CommandManager.argument("name", StringArgumentType.string())
                    .executes(PrivateCommand::createPrivate)))
        );
        
        SelectionStick.init();
    }
    
    private static int giveWand(CommandContext<ServerCommandSource> context) {
        if (!(context.getSource().getEntity() instanceof ServerPlayerEntity player)) {
            context.getSource().sendFeedback(() -> 
                Text.literal("The command is available only to players!").formatted(Formatting.RED), false);
            return 0;
        }
        
        player.giveItemStack(SelectionStick.createSelectionStick());
        player.sendMessage(
            Text.literal("You got the private stick!")
                .formatted(Formatting.GREEN)
                .append(Text.literal("\nRMB - first point")
                    .formatted(Formatting.YELLOW))
                .append(Text.literal("\nShift+RMB - second point")
                    .formatted(Formatting.YELLOW)), 
            false
        );
        
        return 1;
    }

    private static int createPrivate(CommandContext<ServerCommandSource> context) {
        if (!(context.getSource().getEntity() instanceof ServerPlayerEntity player)) {
            context.getSource().sendFeedback(() -> 
                Text.literal("This command is only available to players!").formatted(Formatting.RED), false);
            return 0;
        }
        
        String name = StringArgumentType.getString(context, "name");
        PrivateManager manager = PrivateManager.getInstance();
        
        if (!manager.hasBothPoints(player)) {
            player.sendMessage(
                Text.literal("You need to select two points first! Use ")
                    .formatted(Formatting.RED)
                    .append(Text.literal("/private wand")
                        .formatted(Formatting.YELLOW))
                    .append(Text.literal(" to get the selection stick.")
                        .formatted(Formatting.RED)), 
                false
            );
            return 0;
        }
        
        if (name.length() < 1 || name.length() > 32) {
            player.sendMessage(
                Text.literal("Private name must be between 1 and 32 characters!")
                    .formatted(Formatting.RED), 
                false
            );
            return 0;
        }
        
        if (manager.getPlayerZoneByName(player, name) != null) {
            player.sendMessage(
                Text.literal("You already have a private zone named '")
                    .formatted(Formatting.RED)
                    .append(Text.literal(name)
                        .formatted(Formatting.YELLOW))
                    .append(Text.literal("'!")
                        .formatted(Formatting.RED)), 
                false
            );
            return 0;
        }

        BlockPos pos1 = manager.getFirstPoint(player);
        BlockPos pos2 = manager.getSecondPoint(player);
        String worldName = player.getServerWorld().getRegistryKey().getValue().toString();
        
        PrivateZone intersectingZone = manager.findIntersectingZone(pos1, pos2, worldName);
        if (intersectingZone != null) {
            player.sendMessage(
                Text.literal("Cannot create private zone! The selected area intersects with existing private zone '")
                    .formatted(Formatting.RED)
                    .append(Text.literal(intersectingZone.getName())
                        .formatted(Formatting.YELLOW))
                    .append(Text.literal("' owned by ")
                        .formatted(Formatting.RED))
                    .append(Text.literal(intersectingZone.getOwnerName())
                        .formatted(Formatting.YELLOW))
                    .append(Text.literal(".")
                        .formatted(Formatting.RED)), 
                false
            );
            return 0;
        }
        
        player.sendMessage(
            Text.literal("Checking zone creation with external service...")
                .formatted(Formatting.YELLOW), 
            false
        );
        
        PrivateManager.ZoneCreationResult result = manager.createPrivateZone(name, player);
        
        if (result.isSuccess()) {
            PrivateZone zone = result.getZone();
            
            player.sendMessage(
                Text.literal("Private zone '")
                    .formatted(Formatting.GREEN)
                    .append(Text.literal(name)
                        .formatted(Formatting.GOLD))
                    .append(Text.literal("' created successfully!")
                        .formatted(Formatting.GREEN))
                    .append(Text.literal(String.format("\nSize: %dx%dx%d (%d blocks)", 
                        zone.getMaxX() - zone.getMinX() + 1,
                        zone.getMaxY() - zone.getMinY() + 1,
                        zone.getMaxZ() - zone.getMinZ() + 1,
                        zone.getVolumeBlocks()))
                        .formatted(Formatting.AQUA)), 
                false
            );
            return 1;
        } else {
            player.sendMessage(
                Text.literal("Failed to create private zone: ")
                    .formatted(Formatting.RED)
                    .append(Text.literal(result.getMessage())
                        .formatted(Formatting.YELLOW)), 
                false
            );
            return 0;
        }
    }
}