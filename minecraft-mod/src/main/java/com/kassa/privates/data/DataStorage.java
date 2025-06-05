package com.kassa.privates.data;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import net.fabricmc.loader.api.FabricLoader;

import java.io.*;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class DataStorage {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final String DATA_FOLDER = "privates";
    private static final String ZONES_FILE = "zones.json";
    
    private final Path dataDir;
    private final Path zonesFile;
    
    public DataStorage() {
        this.dataDir = FabricLoader.getInstance().getConfigDir().resolve(DATA_FOLDER);
        this.zonesFile = dataDir.resolve(ZONES_FILE);
        
        try {
            Files.createDirectories(dataDir);
        } catch (IOException e) {
            System.err.println("Failed to create privates data directory: " + e.getMessage());
        }
    }
    
    public void saveZones(List<PrivateZone> zones) {
        try (FileWriter writer = new FileWriter(zonesFile.toFile())) {
            GSON.toJson(zones, writer);
            System.out.println("Saved " + zones.size() + " private zones to " + zonesFile);
        } catch (IOException e) {
            System.err.println("Failed to save private zones: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public List<PrivateZone> loadZones() {
        if (!Files.exists(zonesFile)) {
            System.out.println("Zones file doesn't exist, starting with empty list");
            return new ArrayList<>();
        }
        
        try (FileReader reader = new FileReader(zonesFile.toFile())) {
            Type listType = new TypeToken<List<PrivateZone>>(){}.getType();
            List<PrivateZone> zones = GSON.fromJson(reader, listType);
            
            if (zones == null) {
                zones = new ArrayList<>();
            }
            
            System.out.println("Loaded " + zones.size() + " private zones from " + zonesFile);
            return zones;
        } catch (IOException e) {
            System.err.println("Failed to load private zones: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Failed to parse private zones JSON: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    public void createBackup() {
        if (!Files.exists(zonesFile)) {
            return;
        }
        
        try {
            String timestamp = String.valueOf(System.currentTimeMillis());
            Path backupFile = dataDir.resolve("zones_backup_" + timestamp + ".json");
            Files.copy(zonesFile, backupFile);
            System.out.println("Created backup: " + backupFile);
        } catch (IOException e) {
            System.err.println("Failed to create backup: " + e.getMessage());
        }
    }
    
    public boolean dataExists() {
        return Files.exists(zonesFile);
    }

    public Path getDataPath() {
        return zonesFile;
    }
}