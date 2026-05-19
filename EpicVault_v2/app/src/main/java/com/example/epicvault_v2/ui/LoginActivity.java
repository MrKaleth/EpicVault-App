package com.example.epicvault_v2.ui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.epicvault_v2.R;
import com.example.epicvault_v2.models.LoginRequest;
import com.example.epicvault_v2.models.User;
import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.network.RetrofitClient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        EditText etEmail = findViewById(R.id.etEmail);
        EditText etPassword = findViewById(R.id.etPassword);
        TextView tvErrorMsg = findViewById(R.id.tvErrorMsg);
        Button btnLoginSubmit = findViewById(R.id.btnLoginSubmit);
        TextView tvGoToRegister = findViewById(R.id.tvGoToRegister);

        btnLoginSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tvErrorMsg.setVisibility(View.GONE);

                String email = etEmail.getText().toString().trim();
                String password = etPassword.getText().toString().trim();

                if (email.isEmpty() || password.isEmpty()) {
                    tvErrorMsg.setText("⚠️ Por favor, rellena todos los campos.");
                    tvErrorMsg.setVisibility(View.VISIBLE);
                } else {
                    btnLoginSubmit.setEnabled(false);
                    btnLoginSubmit.setText("⏳ CONECTANDO...");

                    ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
                    LoginRequest request = new LoginRequest(email, password);

                    apiService.login(request).enqueue(new Callback<User>() {
                        @Override
                        public void onResponse(Call<User> call, Response<User> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                User loggedInUser = response.body();

                                SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
                                SharedPreferences.Editor editor = prefs.edit();
                                editor.putBoolean("IS_LOGGED_IN", true);
                                editor.putBoolean("IS_ADMIN", loggedInUser.isAdminOrModerator());
                                editor.putString("USERNAME", loggedInUser.getUsername());
                                editor.putString("AVATAR_URL", loggedInUser.getAvatarUrl());
                                editor.putString("FRIEND_CODE", loggedInUser.getFriendCode());

                                editor.putString("USER_ID", loggedInUser.getId());
                                editor.putString("EMAIL", email);

                                editor.apply();

                                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                                intent.putExtra("SHOW_WELCOME_TOAST", true);
                                startActivity(intent);
                                finish();
                            } else {
                                tvErrorMsg.setText("⚠️ Usuario o contraseña incorrectos.");
                                tvErrorMsg.setVisibility(View.VISIBLE);
                                btnLoginSubmit.setEnabled(true);
                                btnLoginSubmit.setText("🔓 ACCEDER AHORA");
                            }
                        }

                        @Override
                        public void onFailure(Call<User> call, Throwable t) {
                            tvErrorMsg.setText("❌ Error de conexión con el servidor.");
                            tvErrorMsg.setVisibility(View.VISIBLE);
                            btnLoginSubmit.setEnabled(true);
                            btnLoginSubmit.setText("🔓 ACCEDER AHORA");
                        }
                    });
                }
            }
        });

        tvGoToRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
            finish();
        });
    }
}