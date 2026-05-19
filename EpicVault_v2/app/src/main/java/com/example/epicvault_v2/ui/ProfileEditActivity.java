package com.example.epicvault_v2.ui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.network.RetrofitClient;
import com.example.epicvault_v2.models.User;
import com.example.epicvault_v2.models.UserUpdateResponse;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.imageview.ShapeableImageView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileEditActivity extends AppCompatActivity {

    private ShapeableImageView ivEditAvatar;
    private Uri selectedImageUri = null;
    private String userId = "";

    private final ActivityResultLauncher<String> mGetContent = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    Glide.with(this).load(uri).into(ivEditAvatar);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile_edit);

        ivEditAvatar = findViewById(R.id.ivEditAvatar);
        FloatingActionButton fabChangePhoto = findViewById(R.id.fabChangePhoto);
        EditText etEditUsername = findViewById(R.id.etEditUsername);
        EditText etEditEmail = findViewById(R.id.etEditEmail);
        TextView tvEditFriendCode = findViewById(R.id.tvEditFriendCode);
        TextView tvEditError = findViewById(R.id.tvEditError);
        Button btnCancelEdit = findViewById(R.id.btnCancelEdit);
        Button btnSaveEdit = findViewById(R.id.btnSaveEdit);

        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        userId = prefs.getString("USER_ID", "");
        String currentUsername = prefs.getString("USERNAME", "");
        String currentEmail = prefs.getString("EMAIL", "");
        String currentCode = prefs.getString("FRIEND_CODE", "");
        String currentAvatar = prefs.getString("AVATAR_URL", "");

        etEditUsername.setText(currentUsername);
        etEditEmail.setText(currentEmail);
        tvEditFriendCode.setText(currentCode);

        if (!currentAvatar.isEmpty()) {
            if (currentAvatar.contains("localhost")) currentAvatar = currentAvatar.replace("localhost", "10.0.2.2");
            Glide.with(this).load(currentAvatar).placeholder(R.mipmap.ic_launcher).into(ivEditAvatar);
        }

        fabChangePhoto.setOnClickListener(v -> mGetContent.launch("image/*"));

        btnCancelEdit.setOnClickListener(v -> finish());

        btnSaveEdit.setOnClickListener(v -> {
            String newUsername = etEditUsername.getText().toString().trim();
            String newEmail = etEditEmail.getText().toString().trim();

            if (newUsername.isEmpty() || newEmail.isEmpty() || userId.isEmpty()) {
                tvEditError.setText("❌ Rellena los campos.");
                tvEditError.setVisibility(View.VISIBLE);
                return;
            }

            btnSaveEdit.setEnabled(false);
            btnSaveEdit.setText("⏳ Forjando...");
            tvEditError.setVisibility(View.GONE);

            MultipartBody.Builder formBuilder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("username", newUsername)
                    .addFormDataPart("email", newEmail);

            if (selectedImageUri != null) {
                try {
                    InputStream is = getContentResolver().openInputStream(selectedImageUri);
                    File tempFile = new File(getCacheDir(), "upload_avatar.jpg");
                    FileOutputStream fos = new FileOutputStream(tempFile);
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = is.read(buffer)) > 0) { fos.write(buffer, 0, len); }
                    fos.close(); is.close();

                    RequestBody reqFile = RequestBody.create(MediaType.parse("image/*"), tempFile);
                    formBuilder.addFormDataPart("avatar_image", tempFile.getName(), reqFile);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
            apiService.updateUser(userId, formBuilder.build()).enqueue(new Callback<UserUpdateResponse>() {
                @Override
                public void onResponse(Call<UserUpdateResponse> call, Response<UserUpdateResponse> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        User updatedUser = response.body().getUser();
                        SharedPreferences.Editor editor = prefs.edit();
                        editor.putString("USERNAME", updatedUser.getUsername());
                        editor.putString("EMAIL", updatedUser.getEmail());
                        editor.putString("AVATAR_URL", updatedUser.getAvatarUrl());
                        editor.apply();

                        Toast.makeText(ProfileEditActivity.this, "¡Perfil actualizado!", Toast.LENGTH_SHORT).show();

                        Intent intent = new Intent(ProfileEditActivity.this, ProfileActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(intent);
                        finish();
                    } else {
                        tvEditError.setText("❌ Error del servidor. Comprueba tu Node.js.");
                        tvEditError.setVisibility(View.VISIBLE);
                        btnSaveEdit.setEnabled(true);
                        btnSaveEdit.setText("Guardar");
                    }
                }

                @Override
                public void onFailure(Call<UserUpdateResponse> call, Throwable t) {
                    tvEditError.setText("❌ Servidor desconectado: " + t.getMessage());
                    tvEditError.setVisibility(View.VISIBLE);
                    btnSaveEdit.setEnabled(true);
                    btnSaveEdit.setText("Guardar");
                }
            });
        });
    }
}