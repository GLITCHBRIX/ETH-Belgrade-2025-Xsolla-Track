package com.kassa.privates.commands;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.context.CommandContext;
import com.kassa.privates.items.SelectionStick;
import net.minecraft.command.CommandRegistryAccess;
import net.minecraft.server.command.CommandManager;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

public class PrivateCommand {
    public static void register(CommandDispatcher<ServerCommandSource> dispatcher, 
                               CommandRegistryAccess registryAccess, 
                               CommandManager.RegistrationEnvironment environment) {
        
        dispatcher.register(CommandManager.literal("private")
            .requires(source -> source.hasPermissionLevel(0))
            .then(CommandManager.literal("wand")
                .executes(PrivateCommand::giveWand))
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
}