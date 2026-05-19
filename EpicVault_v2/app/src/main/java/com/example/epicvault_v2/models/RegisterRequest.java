package com.example.epicvault_v2.models;

public class RegisterRequest {
    private String username;
    private String email;
    private String password_hash;

    public RegisterRequest(String username, String email, String password_hash) {
        this.username = username;
        this.email = email;
        this.password_hash = password_hash;
    }
}