package com.example.epicvault_v2.ui;

import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.models.DetailedCampaign;
import com.example.epicvault_v2.models.InviteRequest;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.network.RetrofitClient;
import com.example.epicvault_v2.models.User;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.imageview.ShapeableImageView;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CampaignDetailActivity extends AppCompatActivity {

    private String campaignId;
    private String currentUserId;
    private DetailedCampaign currentCampaign;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_campaign_detail);

        campaignId = getIntent().getStringExtra("CAMPAIGN_ID");
        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        currentUserId = prefs.getString("USER_ID", "");

        if (campaignId == null || campaignId.isEmpty()) {
            finish();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (campaignId != null && !campaignId.isEmpty()) {
            cargarDetalles();
        }
    }

    private void cargarDetalles() {
        ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
        apiService.getCampaignById(campaignId).enqueue(new Callback<DetailedCampaign>() {
            @Override
            public void onResponse(Call<DetailedCampaign> call, Response<DetailedCampaign> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentCampaign = response.body();
                    pintarLobby();
                }
            }

            @Override
            public void onFailure(Call<DetailedCampaign> call, Throwable t) {
            }
        });
    }

    private void pintarLobby() {
        ImageView ivCover = findViewById(R.id.ivDetailCover);
        TextView tvName = findViewById(R.id.tvDetailName);
        TextView tvDm = findViewById(R.id.tvDetailDm);
        TextView tvDesc = findViewById(R.id.tvDetailDesc);
        TextView tvJoinCode = findViewById(R.id.tvJoinCode);
        Button btnCopyCode = findViewById(R.id.btnCopyCode);

        LinearLayout llDmActions = findViewById(R.id.llDmActions);
        Button btnInvitePlayers = findViewById(R.id.btnInvitePlayers);
        Button btnDeleteCampaign = findViewById(R.id.btnDeleteCampaign);
        Button btnManageCampaign = findViewById(R.id.btnManageCampaign);
        Button btnEditCampaign = findViewById(R.id.btnEditCampaign);

        Button btnPlayCampaign = findViewById(R.id.btnPlayCampaign);
        LinearLayout llPlayers = findViewById(R.id.llPlayersContainer);

        tvName.setText(currentCampaign.getName());
        tvDesc.setText(currentCampaign.getDescription() != null ? currentCampaign.getDescription() : "Sin historia registrada...");
        tvJoinCode.setText("Código: " + currentCampaign.getJoinCode());

        String coverUrl = currentCampaign.getCoverUrl();
        if (coverUrl != null && !coverUrl.isEmpty()) {
            if (coverUrl.contains("localhost"))
                coverUrl = coverUrl.replace("localhost", "10.0.2.2");
            Glide.with(this).load(coverUrl).into(ivCover);
        }

        if (currentCampaign.getDungeonMaster() != null) {
            tvDm.setText("Creada por: " + currentCampaign.getDungeonMaster().getUsername());
            if (currentCampaign.getDungeonMaster().getId().equals(currentUserId)) {
                llDmActions.setVisibility(View.VISIBLE);
            }
        }

        btnCopyCode.setOnClickListener(v -> {
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Código Mágico", currentCampaign.getJoinCode());
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "¡Código copiado! 📋", Toast.LENGTH_SHORT).show();
        });

        btnDeleteCampaign.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("⚠️ ¿Destruir Campaña?")
                    .setMessage("Esta acción es irreversible.")
                    .setPositiveButton("Sí, Destruir", (dialog, which) -> destruirCampana())
                    .setNegativeButton("Cancelar", null)
                    .show();
        });

        btnInvitePlayers.setOnClickListener(v -> mostrarPanelInvitacion());
        btnManageCampaign.setOnClickListener(v -> mostrarPanelAdministrar());

        btnEditCampaign.setOnClickListener(v -> {
            Intent intent = new Intent(CampaignDetailActivity.this, CampaignEditActivity.class);
            intent.putExtra("CAMPAIGN_ID", campaignId);
            startActivity(intent);
        });

        if (btnPlayCampaign != null) {
            btnPlayCampaign.setOnClickListener(v -> {
                Intent intent = new Intent(CampaignDetailActivity.this, CampaignPlayActivity.class);
                intent.putExtra("CAMPAIGN_ID", campaignId);
                startActivity(intent);
            });
        }

        llPlayers.removeAllViews();
        if (currentCampaign.getDungeonMaster() != null) {
            View dmView = getLayoutInflater().inflate(R.layout.item_player_avatar, null);
            ShapeableImageView ivAvatar = dmView.findViewById(R.id.ivPlayerAvatar);
            TextView tvPName = dmView.findViewById(R.id.tvPlayerName);
            tvPName.setText(currentCampaign.getDungeonMaster().getUsername() + " (DM)");
            tvPName.setTextColor(android.graphics.Color.parseColor("#dc3545"));
            String avatar = currentCampaign.getDungeonMaster().getAvatarUrl();
            if (avatar != null && !avatar.isEmpty())
                Glide.with(this).load(avatar.replace("localhost", "10.0.2.2")).placeholder(R.mipmap.ic_launcher).into(ivAvatar);
            llPlayers.addView(dmView);
        }

        if (currentCampaign.getPlayers() != null) {
            for (User player : currentCampaign.getPlayers()) {
                View playerView = getLayoutInflater().inflate(R.layout.item_player_avatar, null);
                ShapeableImageView ivAvatar = playerView.findViewById(R.id.ivPlayerAvatar);
                TextView tvPName = playerView.findViewById(R.id.tvPlayerName);
                tvPName.setText(player.getUsername());
                String avatar = player.getAvatarUrl();
                if (avatar != null && !avatar.isEmpty())
                    Glide.with(this).load(avatar.replace("localhost", "10.0.2.2")).placeholder(R.mipmap.ic_launcher).into(ivAvatar);
                llPlayers.addView(playerView);
            }
        }
    }

    private void destruirCampana() {
        RetrofitClient.getClient().create(ApiService.class).deleteCampaign(campaignId).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(CampaignDetailActivity.this, "Campaña destruida.", Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
            }
        });
    }

    private void mostrarPanelInvitacion() {
        BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(this);
        View view = getLayoutInflater().inflate(R.layout.layout_bottom_sheet_invite, null);
        bottomSheetDialog.setContentView(view);

        EditText etSearchUser = view.findViewById(R.id.etSearchUser);
        RecyclerView rvInviteUsers = view.findViewById(R.id.rvInviteUsers);
        rvInviteUsers.setLayoutManager(new LinearLayoutManager(this));

        InviteAdapter adapter = new InviteAdapter(new ArrayList<>());
        rvInviteUsers.setAdapter(adapter);

        ApiService apiService = RetrofitClient.getClient().create(ApiService.class);

        etSearchUser.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void afterTextChanged(Editable s) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (s.length() >= 2) {
                    apiService.searchUsers(s.toString()).enqueue(new Callback<List<User>>() {
                        @Override
                        public void onResponse(Call<List<User>> call, Response<List<User>> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                List<User> resultados = new ArrayList<>();
                                for (User u : response.body()) {
                                    if (!u.getId().equals(currentUserId)) resultados.add(u);
                                }
                                adapter.setUsers(resultados);
                            }
                        }

                        @Override
                        public void onFailure(Call<List<User>> call, Throwable t) {
                        }
                    });
                }
            }
        });

        bottomSheetDialog.show();
    }

    private void mostrarPanelAdministrar() {
        BottomSheetDialog bottomSheetDialog = new BottomSheetDialog(this);
        View view = getLayoutInflater().inflate(R.layout.layout_bottom_sheet_manage, null);
        bottomSheetDialog.setContentView(view);

        LinearLayout llManagePlayers = view.findViewById(R.id.llManagePlayers);
        LinearLayout llManageInvites = view.findViewById(R.id.llManageInvites);

        ApiService apiService = RetrofitClient.getClient().create(ApiService.class);

        llManagePlayers.removeAllViews();
        if (currentCampaign.getPlayers() != null && !currentCampaign.getPlayers().isEmpty()) {
            for (User player : currentCampaign.getPlayers()) {
                View userView = getLayoutInflater().inflate(R.layout.item_manage_user, null);
                TextView tvName = userView.findViewById(R.id.tvManageUsername);
                Button btnAction = userView.findViewById(R.id.btnManageAction);

                tvName.setText(player.getUsername());
                btnAction.setText("Expulsar");
                btnAction.setTextColor(android.graphics.Color.parseColor("#dc3545"));

                btnAction.setOnClickListener(v -> {
                    btnAction.setEnabled(false);
                    btnAction.setText("⏳...");
                    InviteRequest req = new InviteRequest(currentUserId, player.getId());

                    apiService.removePlayer(campaignId, req).enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> response) {
                            if (response.isSuccessful()) {
                                Toast.makeText(CampaignDetailActivity.this, "Jugador expulsado.", Toast.LENGTH_SHORT).show();
                                bottomSheetDialog.dismiss();
                                cargarDetalles();
                            } else {
                                btnAction.setEnabled(true);
                                btnAction.setText("Expulsar");
                            }
                        }

                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                        }
                    });
                });
                llManagePlayers.addView(userView);
            }
        } else {
            TextView tvEmpty = new TextView(this);
            tvEmpty.setText("No hay jugadores activos.");
            tvEmpty.setTextColor(android.graphics.Color.GRAY);
            llManagePlayers.addView(tvEmpty);
        }

        llManageInvites.removeAllViews();
        if (currentCampaign.getPendingInvites() != null && !currentCampaign.getPendingInvites().isEmpty()) {
            for (User invite : currentCampaign.getPendingInvites()) {
                View userView = getLayoutInflater().inflate(R.layout.item_manage_user, null);
                TextView tvName = userView.findViewById(R.id.tvManageUsername);
                Button btnAction = userView.findViewById(R.id.btnManageAction);

                tvName.setText(invite.getUsername());
                btnAction.setText("Cancelar");
                btnAction.setTextColor(android.graphics.Color.parseColor("#ffc107"));

                btnAction.setOnClickListener(v -> {
                    btnAction.setEnabled(false);
                    btnAction.setText("⏳...");
                    InviteRequest req = new InviteRequest(currentUserId, invite.getId());

                    apiService.cancelInvite(campaignId, req).enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> response) {
                            if (response.isSuccessful()) {
                                Toast.makeText(CampaignDetailActivity.this, "Invitación cancelada.", Toast.LENGTH_SHORT).show();
                                bottomSheetDialog.dismiss();
                                cargarDetalles();
                            } else {
                                btnAction.setEnabled(true);
                                btnAction.setText("Cancelar");
                            }
                        }

                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                        }
                    });
                });
                llManageInvites.addView(userView);
            }
        } else {
            TextView tvEmpty = new TextView(this);
            tvEmpty.setText("No hay cuervos en vuelo.");
            tvEmpty.setTextColor(android.graphics.Color.GRAY);
            llManageInvites.addView(tvEmpty);
        }

        bottomSheetDialog.show();
    }

    private class InviteAdapter extends RecyclerView.Adapter<InviteAdapter.ViewHolder> {
        private List<User> users;

        public InviteAdapter(List<User> users) {
            this.users = users;
        }

        public void setUsers(List<User> users) {
            this.users = users;
            notifyDataSetChanged();
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user_invite, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            User user = users.get(position);
            holder.tvUsername.setText(user.getUsername());

            holder.btnSendInvite.setOnClickListener(v -> {
                holder.btnSendInvite.setEnabled(false);
                holder.btnSendInvite.setText("Enviando...");

                ApiService api = RetrofitClient.getClient().create(ApiService.class);
                InviteRequest req = new InviteRequest(currentUserId, user.getId());

                api.inviteUser(campaignId, req).enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        if (response.isSuccessful()) {
                            Toast.makeText(CampaignDetailActivity.this, "¡Cuervo enviado a " + user.getUsername() + "!", Toast.LENGTH_SHORT).show();
                            holder.btnSendInvite.setText("Enviado ✓");
                            cargarDetalles();
                        } else {
                            holder.btnSendInvite.setEnabled(true);
                            holder.btnSendInvite.setText("Invitar");
                            Toast.makeText(CampaignDetailActivity.this, "Error al invitar.", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                    }
                });
            });
        }

        @Override
        public int getItemCount() {
            return users.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvUsername;
            Button btnSendInvite;

            public ViewHolder(View itemView) {
                super(itemView);
                tvUsername = itemView.findViewById(R.id.tvInviteUsername);
                btnSendInvite = itemView.findViewById(R.id.btnSendInvite);
            }
        }
    }
}