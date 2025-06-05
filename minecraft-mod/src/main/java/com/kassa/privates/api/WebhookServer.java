package com.kassa.privates.api;

import com.google.gson.Gson;
import com.kassa.privates.data.PrivateManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class WebhookServer {
    private static final int PORT = 8081;
    private static final String MOCK_OWNER_UUID = "00000000-0000-0000-0000-000000000000";
    private static final Gson GSON = new Gson();
    
    private HttpServer server;
    
    public static class OwnershipChangeRequest {
        private String uuid;
        private String newOwner;
        
        public String getUuid() { return uuid; }
        public String getNewOwner() { return newOwner; }
    }
    
    @SuppressWarnings("unused")
    public static class ApiResponse {
        private boolean success;
        private String message;
        
        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }
    
    public void start() {
        try {
            server = HttpServer.create(new InetSocketAddress(PORT), 0);
            server.createContext("/change-owner", new OwnershipChangeHandler());
            server.setExecutor(Executors.newFixedThreadPool(4));
            server.start();
            
            System.out.println("Webhook server started on port " + PORT);
            System.out.println("Listening for ownership change requests at: http://localhost:" + PORT + "/change-owner");
            
        } catch (IOException e) {
            System.err.println("Failed to start webhook server: " + e.getMessage());
        }
    }
    
    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("Webhook server stopped");
        }
    }
    
    private static class OwnershipChangeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, new ApiResponse(false, "Method not allowed"));
                return;
            }
            
            try {
                String requestBody = readRequestBody(exchange.getRequestBody());
                System.out.println("Received ownership change request: " + requestBody);
                
                OwnershipChangeRequest request = GSON.fromJson(requestBody, OwnershipChangeRequest.class);
                
                if (request.getUuid() == null || request.getUuid().trim().isEmpty()) {
                    sendResponse(exchange, 400, new ApiResponse(false, "Zone UUID is required"));
                    return;
                }
                
                String newOwnerUuid = request.getNewOwner();
                if (newOwnerUuid == null || newOwnerUuid.trim().isEmpty()) {
                    newOwnerUuid = MOCK_OWNER_UUID;
                    System.out.println("No new owner specified, using mock UUID: " + MOCK_OWNER_UUID);
                } else {
                    System.out.println("Changing owner to: " + newOwnerUuid);
                }
                
                final String finalNewOwnerUuid = newOwnerUuid;
                final String finalNewOwnerName = request.getNewOwner() == null ? "Pending Player" : "New Owner";
                
                CompletableFuture<Boolean> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        System.out.println("Processing ownership change in background thread...");
                        boolean result = PrivateManager.getInstance().changeZoneOwner(
                            request.getUuid(), 
                            finalNewOwnerUuid,
                            finalNewOwnerName
                        );
                        System.out.println("Ownership change completed: " + result);
                        return result;
                    } catch (Exception e) {
                        System.err.println("Error changing zone owner: " + e.getMessage());
                        e.printStackTrace();
                        return false;
                    }
                });
                
                Boolean result;
                try {
                    result = future.get(10, TimeUnit.SECONDS);
                    System.out.println("Future completed with result: " + result);
                } catch (Exception e) {
                    System.err.println("Timeout or error waiting for operation: " + e.getMessage());
                    e.printStackTrace();
                    result = false;
                }
                
                if (result) {
                    sendResponse(exchange, 200, new ApiResponse(true, "Zone ownership changed successfully"));
                } else {
                    sendResponse(exchange, 404, new ApiResponse(false, "Zone not found or ownership change failed"));
                }
                
                
            } catch (Exception e) {
                System.err.println("Error processing ownership change request: " + e.getMessage());
                e.printStackTrace();
                sendResponse(exchange, 500, new ApiResponse(false, "Internal server error: " + e.getMessage()));
            }
        }
        
        private String readRequestBody(InputStream inputStream) throws IOException {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        private void sendResponse(HttpExchange exchange, int statusCode, ApiResponse response) throws IOException {
            String jsonResponse = GSON.toJson(response);
            byte[] responseBytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
            
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusCode, responseBytes.length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
        }
    }
}