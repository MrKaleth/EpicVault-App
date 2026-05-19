package com.example.epicvault_v2.models;

import java.util.List;

public class User {
    private String _id;
    private String username;
    private String email;
    private List<String> global_roles;
    private String avatar_url;
    private String friend_code;

    public String getId() { return _id; }
    public String getUsername() { return username; }

    public String getEmail() { return email; }

    public String getAvatarUrl() { return avatar_url; }
    public String getFriendCode() { return friend_code; }

    public boolean isAdminOrModerator() {
        return global_roles != null && (global_roles.contains("ADMIN") || global_roles.contains("MODERATOR"));
    }
}