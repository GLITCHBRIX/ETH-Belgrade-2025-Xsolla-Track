package com.kassa.privates.api;

import com.google.gson.Gson;

import net.minecraft.server.network.ServerPlayerEntity;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

public class ApiService {
    private static final String API_URL = "https://8830-212-47-148-189.ngrok-free.app/items";
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private static final Gson GSON = new Gson();
    
    public static class ApiResponse {
        private boolean success;
        private String message;
        
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }

    @SuppressWarnings("unused")
    public static class Attribute {
        private String trait_type;
        private String value;
        
        public Attribute(String trait_type, String value) {
            this.trait_type = trait_type;
            this.value = value;
        }
    }

    @SuppressWarnings("unused")
    public static class Metadata {
        private String name;
        private String description;
        private String image;
        private String external_url;
        private List<Attribute> attributes;
        
        public Metadata(String name, String description, String image, List<Attribute> attributes) {
            this.name = name;
            this.description = description;
            this.image = image;
            this.external_url = null;
            this.attributes = attributes;
        }
    }

    @SuppressWarnings("unused")
    public static class ZoneCreateRequest {
        private int gameId = 1;
        private int collectionId = 1;
        private Metadata metadata;
        private String playerId;
        private String playerAddress;
        
        public ZoneCreateRequest(String zoneName, String playerName, String playerUuid, String zoneUuid) {
            this.playerId = playerUuid;
            this.playerAddress = null;
            
            String description = "Private zone of player " + playerName;
            
            String imageUrl = "https://placehold.co/512x512?text=" + zoneName.replace(" ", "+");
            
            List<Attribute> attributes = List.of(new Attribute("uuid", zoneUuid));
            
            this.metadata = new Metadata(zoneName, description, imageUrl, attributes);
        }
    }
    
    public static ApiResponse createZone(String zoneName, ServerPlayerEntity player, String zoneUuid) {
        try {
            ZoneCreateRequest request = new ZoneCreateRequest(
                zoneName, 
                player.getName().getString(), 
                player.getUuidAsString(), 
                zoneUuid
            );
            
            String jsonBody = GSON.toJson(request);
            System.out.println("Sending API request: " + jsonBody);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            HttpResponse<String> response = HTTP_CLIENT.send(httpRequest, 
                    HttpResponse.BodyHandlers.ofString());
            
            System.out.println("API response status: " + response.statusCode());
            System.out.println("API response body: " + response.body());
            
            ApiResponse apiResponse = new ApiResponse();
            if (response.statusCode() == 200 || response.statusCode() == 201) {
                apiResponse.success = true;
                apiResponse.message = "Zone created successfully";
            } else {
                apiResponse.success = false;
                apiResponse.message = "API returned status: " + response.statusCode();
            }
            
            return apiResponse;
            
        } catch (IOException | InterruptedException e) {
            System.err.println("Failed to call external API: " + e.getMessage());
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.success = false;
            errorResponse.message = "Network error: " + e.getMessage();
            return errorResponse;
        } catch (Exception e) {
            System.err.println("Unexpected error during API call: " + e.getMessage());
            ApiResponse errorResponse = new ApiResponse();
            errorResponse.success = false;
            errorResponse.message = "Unexpected error: " + e.getMessage();
            return errorResponse;
        }
    }
}