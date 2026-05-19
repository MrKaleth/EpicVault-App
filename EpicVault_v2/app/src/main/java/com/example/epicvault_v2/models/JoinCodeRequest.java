package com.example.epicvault_v2.models;

public class JoinCodeRequest {
    private String join_code;
    private String userId;

    public JoinCodeRequest(String join_code, String userId) {
        this.join_code = join_code;
        this.userId = userId;
    }
}