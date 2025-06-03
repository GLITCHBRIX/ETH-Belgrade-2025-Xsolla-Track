package com.kassa.privates;

import com.kassa.privates.commands.PrivateCommand;
import com.kassa.privates.handlers.SelectionHandler;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.command.v2.CommandRegistrationCallback;

public class PrivatesMod implements ModInitializer {
    public static final String MOD_ID = "privates";
    
    @Override
    public void onInitialize() {
        System.out.println("Initializing the Privates mod...");
        
        CommandRegistrationCallback.EVENT.register(PrivateCommand::register);

        SelectionHandler.register();
        
        System.out.println("Mod Privates loaded successfully!");
    }
}