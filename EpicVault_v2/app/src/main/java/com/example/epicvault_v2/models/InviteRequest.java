package com.example.epicvault_v2.models;

public class InviteRequest {
    private String dmId;
    private String userId;

    public InviteRequest(String dmId, String userId) {
        this.dmId = dmId;
        this.userId = userId;
    }
}