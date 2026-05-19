package com.example.epicvault_v2.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.models.Notification;
import com.google.android.material.imageview.ShapeableImageView;
import java.util.List;

public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.ViewHolder> {

    private List<Notification> notifications;
    private OnNotificationActionListener actionListener;

    public interface OnNotificationActionListener {
        void onAction(Notification notification, boolean accept);
    }

    public NotificationAdapter(List<Notification> notifications, OnNotificationActionListener listener) {
        this.notifications = notifications;
        this.actionListener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_notification, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Notification notif = notifications.get(position);

        holder.tvNotifMessage.setText(notif.getMessage() != null ? notif.getMessage() : "Mensaje arcano");
        holder.tvNotifDate.setText(notif.getCreatedAt() != null ? notif.getCreatedAt() : "Reciente");

        if (notif.getSender() != null && notif.getSender().getAvatarUrl() != null && !notif.getSender().getAvatarUrl().isEmpty()) {
            String avatarUrl = notif.getSender().getAvatarUrl();
            if (avatarUrl.contains("localhost")) avatarUrl = avatarUrl.replace("localhost", "10.0.2.2");
            Glide.with(holder.itemView.getContext()).load(avatarUrl).placeholder(R.mipmap.ic_launcher).into(holder.ivNotifAvatar);
        } else {
            holder.ivNotifAvatar.setImageResource(R.mipmap.ic_launcher);
        }

        if ("FRIEND_REQUEST".equals(notif.getType()) ||
                "INVITE_RECEIVED".equals(notif.getType()) ||
                "JOIN_REQUEST".equals(notif.getType())) {

            holder.layoutNotifActions.setVisibility(View.VISIBLE);
            holder.btnAcceptNotif.setOnClickListener(v -> actionListener.onAction(notif, true));
            holder.btnRejectNotif.setOnClickListener(v -> actionListener.onAction(notif, false));
        } else {
            holder.layoutNotifActions.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() {
        return notifications != null ? notifications.size() : 0;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ShapeableImageView ivNotifAvatar;
        TextView tvNotifMessage, tvNotifDate;
        LinearLayout layoutNotifActions;
        Button btnAcceptNotif, btnRejectNotif;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivNotifAvatar = itemView.findViewById(R.id.ivNotifAvatar);
            tvNotifMessage = itemView.findViewById(R.id.tvNotifMessage);
            tvNotifDate = itemView.findViewById(R.id.tvNotifDate);
            layoutNotifActions = itemView.findViewById(R.id.layoutNotifActions);
            btnAcceptNotif = itemView.findViewById(R.id.btnAcceptNotif);
            btnRejectNotif = itemView.findViewById(R.id.btnRejectNotif);
        }
    }
}