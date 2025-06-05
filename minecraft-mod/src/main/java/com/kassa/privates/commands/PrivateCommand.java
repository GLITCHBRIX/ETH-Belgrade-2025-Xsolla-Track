package com.kassa.privates.commands;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import com.kassa.privates.data.PrivateManager;
import com.kassa.privates.data.PrivateZone;
import com.kassa.privates.items.SelectionStick;
import net.minecraft.command.CommandRegistryAccess;
import net.minecraft.component.DataComponentTypes;
import net.minecraft.item.ItemStack;
import net.minecraft.item.Items;
import net.minecraft.server.command.CommandManager;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.RawFilteredPair;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;
import net.minecraft.util.math.BlockPos;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

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
            
            .then(CommandManager.literal("list")
                .executes(PrivateCommand::listPrivates))

            .then(CommandManager.literal("uuid")
                .executes(PrivateCommand::showPlayerUuid))
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

    private static int listPrivates(CommandContext<ServerCommandSource> context) {
        if (!(context.getSource().getEntity() instanceof ServerPlayerEntity player)) {
            context.getSource().sendFeedback(() -> 
                Text.literal("This command is only available to players!").formatted(Formatting.RED), false);
            return 0;
        }
        
        PrivateManager manager = PrivateManager.getInstance();
        List<PrivateZone> playerZones = manager.getPlayerZones(player);
        
        if (playerZones.isEmpty()) {
            player.sendMessage(
                Text.literal("You don't have any private zones.")
                    .formatted(Formatting.YELLOW)
                    .append(Text.literal("\nUse ")
                        .formatted(Formatting.GRAY))
                    .append(Text.literal("/private wand")
                        .formatted(Formatting.GREEN))
                    .append(Text.literal(" and ")
                        .formatted(Formatting.GRAY))
                    .append(Text.literal("/private create <name>")
                        .formatted(Formatting.GREEN))
                    .append(Text.literal(" to create your first zone!")
                        .formatted(Formatting.GRAY)), 
                false
            );
            return 1;
        }
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm");
        
        Text header = Text.literal("═══ Your Private Zones (" + playerZones.size() + ") ═══")
            .formatted(Formatting.GOLD, Formatting.BOLD);
        
        player.sendMessage(header, false);
        
        for (int i = 0; i < playerZones.size(); i++) {
            PrivateZone zone = playerZones.get(i);
            
            int sizeX = zone.getMaxX() - zone.getMinX() + 1;
            int sizeY = zone.getMaxY() - zone.getMinY() + 1;
            int sizeZ = zone.getMaxZ() - zone.getMinZ() + 1;
            
            String createdDate = dateFormat.format(new Date(zone.getCreatedAt()));
            String worldName = zone.getWorldName().replace("minecraft:", "");
            
            Text zoneInfo = Text.literal((i + 1) + ". ")
                .formatted(Formatting.WHITE)
                .append(Text.literal(zone.getName())
                    .formatted(Formatting.AQUA, Formatting.BOLD))
                .append(Text.literal("\n   Size: ")
                    .formatted(Formatting.GRAY))
                .append(Text.literal(sizeX + "x" + sizeY + "x" + sizeZ)
                    .formatted(Formatting.GREEN))
                .append(Text.literal(" (" + zone.getVolumeBlocks() + " blocks)")
                    .formatted(Formatting.DARK_GREEN))
                .append(Text.literal("\n   World: ")
                    .formatted(Formatting.GRAY))
                .append(Text.literal(worldName)
                    .formatted(Formatting.YELLOW))
                .append(Text.literal("\n   Position: ")
                    .formatted(Formatting.GRAY))
                .append(Text.literal(String.format("(%d, %d, %d) to (%d, %d, %d)", 
                    zone.getMinX(), zone.getMinY(), zone.getMinZ(),
                    zone.getMaxX(), zone.getMaxY(), zone.getMaxZ()))
                    .formatted(Formatting.WHITE))
                .append(Text.literal("\n   Created: ")
                    .formatted(Formatting.GRAY))
                .append(Text.literal(createdDate)
                    .formatted(Formatting.LIGHT_PURPLE));
            
            player.sendMessage(zoneInfo, false);
            
            if (i < playerZones.size() - 1) {
                player.sendMessage(Text.literal(""), false);
            }
        }
        
        Text footer = Text.literal("═══════════════════════════════")
            .formatted(Formatting.GOLD);
        
        player.sendMessage(footer, false);
        
        return 1;
    }

    private static int showPlayerUuid(CommandContext<ServerCommandSource> context) {
        if (!(context.getSource().getEntity() instanceof ServerPlayerEntity player)) {
            context.getSource().sendFeedback(() -> 
                Text.literal("This command is only available to players!").formatted(Formatting.RED), false);
            return 0;
        }
        
        String playerUuid = player.getUuidAsString();
        String playerName = player.getName().getString();
        
        try {
            ItemStack book = new ItemStack(Items.WRITABLE_BOOK);
            
            String bookContent = String.format(
                "Player Info\n\n" +
                "Name: %s\n\n" +
                "UUID:\n%s\n\n" +
                "Copy UUID from here!",
                playerName,
                playerUuid
            );
            
            java.util.List<RawFilteredPair<String>> pages = java.util.List.of(
                RawFilteredPair.of(bookContent)
            );
            
            book.set(DataComponentTypes.WRITABLE_BOOK_CONTENT, 
                new net.minecraft.component.type.WritableBookContentComponent(pages));
            
            book.set(DataComponentTypes.CUSTOM_NAME, 
                Text.literal("UUID Info: " + playerName)
                    .formatted(Formatting.GOLD, Formatting.BOLD));
            
            if (player.giveItemStack(book)) {
                player.sendMessage(
                    Text.literal("You received a book with your UUID! ")
                        .formatted(Formatting.GREEN)
                        .append(Text.literal("Open it and copy the UUID.")
                            .formatted(Formatting.YELLOW)), 
                    false
                );
            } else {
                player.sendMessage(
                    Text.literal("Your inventory is full! Clear some space and try again.")
                        .formatted(Formatting.RED), 
                    false
                );
            }
            
        } catch (Exception e) {
            System.err.println("Failed to create UUID book: " + e.getMessage());
            e.printStackTrace();
            
            player.sendMessage(
                Text.literal("Failed to create book. Your UUID: ")
                    .formatted(Formatting.RED)
                    .append(Text.literal(playerUuid)
                        .formatted(Formatting.YELLOW)), 
                false
            );
        }
        
        return 1;
    }
}