package com.example.epicvault_v2.models;

import java.util.List;

public class Campaign {
    private String _id;
    private String name;
    private String cover_url;
    private User dungeon_master;

    private List<String> players;

    public String getId() { return _id; }
    public String getName() { return name; }
    public String getCoverUrl() { return cover_url; }
    public User getDungeonMaster() { return dungeon_master; }

    public int getPlayersCount() { return players != null ? players.size() : 0; }
}