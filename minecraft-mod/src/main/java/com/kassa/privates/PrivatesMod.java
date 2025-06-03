package com.kassa.privates;

import com.kassa.privates.commands.PrivateCommand;
import com.kassa.privates.data.PrivateManager;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents;

public class PrivatesMod implements ModInitializer {
    public static final String MOD_ID = "privates";
    
    @Override
    public void onInitialize() {
        System.out.println("Initializing the Privates mod...");
        
        CommandRegistrationCallback.EVENT.register(PrivateCommand::register);
        
        ServerLifecycleEvents.SERVER_STARTING.register(server -> {
            System.out.println("Loading private data...");
            PrivateManager.getInstance().loadData();
        });
        
        ServerLifecycleEvents.SERVER_STOPPING.register(server -> {
            System.out.println("Saving private data...");
            PrivateManager.getInstance().saveData();
        });
        
        System.out.println("Mod Privates loaded successfully!");
    }
}