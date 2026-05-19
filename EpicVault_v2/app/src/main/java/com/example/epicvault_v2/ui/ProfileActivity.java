package com.example.epicvault_v2.ui;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

// IMPORTAMOS GLIDE Y EL IMAGEVIEW CIRCULAR
import com.bumptech.glide.Glide;
import com.example.epicvault_v2.R;
import com.google.android.material.imageview.ShapeableImageView;

public class ProfileActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        ShapeableImageView ivProfileAvatar = findViewById(R.id.ivProfileAvatar); // NUESTRO AVATAR
        TextView tvProfileName = findViewById(R.id.tvProfileName);
        TextView tvFriendCode = findViewById(R.id.tvFriendCode);
        Button btnCopyCode = findViewById(R.id.btnCopyCode);
        LinearLayout panelAdmin = findViewById(R.id.panelAdmin);
        Button btnEditProfile = findViewById(R.id.btnEditProfile);
        Button btnLogout = findViewById(R.id.btnLogout);

        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        String username = prefs.getString("USERNAME", "Aventurero Desconocido");
        boolean isAdmin = prefs.getBoolean("IS_ADMIN", false);
        String avatarUrl = prefs.getString("AVATAR_URL", ""); // Sacamos la URL

        String realFriendCode = prefs.getString("FRIEND_CODE", "");
        if (realFriendCode == null || realFriendCode.isEmpty()) {
            String prefijo = username.length() >= 3 ? username.substring(0, 3).toUpperCase() : "USR";
            realFriendCode = "EV-" + prefijo + "-777";
        }

        tvProfileName.setText(username);
        tvFriendCode.setText(realFriendCode);

        if (isAdmin) {
            panelAdmin.setVisibility(View.VISIBLE);
        }

        if (!avatarUrl.isEmpty()) {
            if (avatarUrl.contains("localhost")) {
                avatarUrl = avatarUrl.replace("localhost", "10.0.2.2");
            }

            Glide.with(this)
                    .load(avatarUrl)
                    .placeholder(R.mipmap.ic_launcher)
                    .error(R.mipmap.ic_launcher)
                    .into(ivProfileAvatar);
        }

        btnCopyCode.setOnClickListener(v -> {
            String codigo = tvFriendCode.getText().toString();
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Código Gremio", codigo);
            clipboard.setPrimaryClip(clip);

            btnCopyCode.setText("✔️ Copiado");
            btnCopyCode.setBackgroundColor(android.graphics.Color.parseColor("#4CAF50"));
            Toast.makeText(ProfileActivity.this, "¡Código arcano copiado!", Toast.LENGTH_SHORT).show();
        });

        btnEditProfile.setOnClickListener(v -> {
            Intent intent = new Intent(ProfileActivity.this, ProfileEditActivity.class);
            startActivity(intent);
        });

        btnLogout.setOnClickListener(v -> {
            SharedPreferences prefsLogout = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
            prefsLogout.edit().clear().apply();

            Intent intent = new Intent(ProfileActivity.this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }
}