package com.example.epicvault_v2.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.models.Campaign;
import com.google.android.material.imageview.ShapeableImageView;
import java.util.List;

public class CampaignAdapter extends RecyclerView.Adapter<CampaignAdapter.ViewHolder> {

    private List<Campaign> campaigns;
    private String currentUserId;
    private OnCampaignClickListener listener;

    public interface OnCampaignClickListener {
        void onCampaignClick(Campaign campaign);
    }

    public CampaignAdapter(List<Campaign> campaigns, String currentUserId, OnCampaignClickListener listener) {
        this.campaigns = campaigns;
        this.currentUserId = currentUserId;
        this.listener = listener;
    }

    public void updateList(List<Campaign> newList) {
        this.campaigns = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_campaign, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Campaign campaign = campaigns.get(position);

        holder.tvCampaignName.setText(campaign.getName());
        holder.tvPlayersCount.setText("👥 " + campaign.getPlayersCount());

        if (campaign.getDungeonMaster() != null) {
            holder.tvDmName.setText("DM: " + campaign.getDungeonMaster().getUsername());

            if (campaign.getDungeonMaster().getId().equals(currentUserId)) {
                holder.tvCampaignRole.setText("Dungeon Master");
                holder.tvCampaignRole.setBackgroundTintList(android.content.res.ColorStateList.valueOf(android.graphics.Color.parseColor("#dc3545")));
            } else {
                holder.tvCampaignRole.setText("Jugador");
                holder.tvCampaignRole.setBackgroundTintList(android.content.res.ColorStateList.valueOf(android.graphics.Color.parseColor("#0dcaf0")));
            }

            String dmAvatar = campaign.getDungeonMaster().getAvatarUrl();
            if (dmAvatar != null && !dmAvatar.isEmpty()) {
                if (dmAvatar.contains("localhost")) dmAvatar = dmAvatar.replace("localhost", "10.0.2.2");
                Glide.with(holder.itemView.getContext()).load(dmAvatar).placeholder(R.mipmap.ic_launcher).into(holder.ivDmAvatar);
            }
        }

        String cover = campaign.getCoverUrl();
        if (cover != null && !cover.isEmpty()) {
            if (cover.contains("localhost")) cover = cover.replace("localhost", "10.0.2.2");
            Glide.with(holder.itemView.getContext()).load(cover).into(holder.ivCampaignCover);
        } else {
            Glide.with(holder.itemView.getContext()).load("https://images.unsplash.com/photo-1614273618169-2f22b7244de1?q=80&w=1000&auto=format&fit=crop").into(holder.ivCampaignCover);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onCampaignClick(campaign);
            }
        });
    }

    @Override
    public int getItemCount() {
        return campaigns != null ? campaigns.size() : 0;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivCampaignCover;
        TextView tvCampaignRole, tvCampaignName, tvDmName, tvPlayersCount;
        ShapeableImageView ivDmAvatar;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivCampaignCover = itemView.findViewById(R.id.ivCampaignCover);
            tvCampaignRole = itemView.findViewById(R.id.tvCampaignRole);
            tvCampaignName = itemView.findViewById(R.id.tvCampaignName);
            tvDmName = itemView.findViewById(R.id.tvDmName);
            tvPlayersCount = itemView.findViewById(R.id.tvPlayersCount);
            ivDmAvatar = itemView.findViewById(R.id.ivDmAvatar);
        }
    }
}