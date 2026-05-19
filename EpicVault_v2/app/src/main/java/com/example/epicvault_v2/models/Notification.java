package com.example.epicvault_v2.models;

public class Notification {
    private String _id;
    private String message;
    private String type;
    private boolean read;
    private String created_at;
    private Sender sender;
    private Campaign campaign;

    public String getId() { return _id; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public boolean isRead() { return read; }
    public String getCreatedAt() { return created_at; }
    public Sender getSender() { return sender; }
    public Campaign getCampaign() { return campaign; }

    public static class Sender {
        private String _id;
        private String username;
        private String avatar_url;

        public String getId() { return _id; }
        public String getUsername() { return username; }
        public String getAvatarUrl() { return avatar_url; }
    }

    public static class Campaign {
        private String _id;
        private String name;

        public String getId() { return _id; }
        public String getName() { return name; }
    }
}