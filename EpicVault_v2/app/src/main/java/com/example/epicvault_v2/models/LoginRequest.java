package com.example.epicvault_v2.models;

public class LoginRequest {
    private String email;
    private String password_hash;

    public LoginRequest(String email, String password_hash) {
        this.email = email;
        this.password_hash = password_hash;
    }
}