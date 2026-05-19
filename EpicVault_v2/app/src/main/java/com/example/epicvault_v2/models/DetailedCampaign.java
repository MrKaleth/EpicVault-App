package com.example.epicvault_v2.models;

import java.util.List;

public class DetailedCampaign {
    private String _id;
    private String name;
    private String description;
    private String cover_url;
    private String join_code;
    private User dungeon_master;
    private List<User> players;

    private List<User> pending_invites;

    public String getId() { return _id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCoverUrl() { return cover_url; }
    public String getJoinCode() { return join_code; }
    public User getDungeonMaster() { return dungeon_master; }
    public List<User> getPlayers() { return players; }

    public List<User> getPendingInvites() { return pending_invites; }
}