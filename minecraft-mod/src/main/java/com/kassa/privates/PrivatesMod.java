package com.kassa.privates;

import com.kassa.privates.api.WebhookServer;
import com.kassa.privates.commands.PrivateCommand;
import com.kassa.privates.handlers.ProtectionHandler;
import com.kassa.privates.handlers.SelectionHandler;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;

public class PrivatesMod implements ModInitializer {
    public static final String MOD_ID = "privates";

    private WebhookServer webhookServer;
    
    @Override
    public void onInitialize() {
        System.out.println("Initializing the Privates mod...");
        
        CommandRegistrationCallback.EVENT.register(PrivateCommand::register);

        SelectionHandler.register();
        ProtectionHandler.register();

        webhookServer = new WebhookServer();
        

        ServerLifecycleEvents.SERVER_STARTED.register(server -> {
            System.out.println("Minecraft server started, starting webhook server...");
            webhookServer.start();
        });
        
        ServerLifecycleEvents.SERVER_STOPPING.register(server -> {
            System.out.println("Minecraft server stopping, stopping webhook server...");
            webhookServer.stop();
        });
        
        System.out.println("Mod Privates loaded successfully!");
    }
}