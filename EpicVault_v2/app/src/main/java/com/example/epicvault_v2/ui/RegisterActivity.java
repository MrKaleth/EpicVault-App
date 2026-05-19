package com.example.epicvault_v2.ui;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.models.RegisterRequest;
import com.example.epicvault_v2.network.RetrofitClient;
import com.example.epicvault_v2.models.User;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        EditText etUsername = findViewById(R.id.etRegUsername);
        EditText etEmail = findViewById(R.id.etRegEmail);
        EditText etPassword = findViewById(R.id.etRegPassword);
        TextView tvMessage = findViewById(R.id.tvRegMessage);
        Button btnRegisterSubmit = findViewById(R.id.btnRegisterSubmit);
        TextView tvGoToLogin = findViewById(R.id.tvGoToLogin);

        btnRegisterSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String username = etUsername.getText().toString().trim();
                String email = etEmail.getText().toString().trim();
                String password = etPassword.getText().toString().trim();

                if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
                    tvMessage.setText("⚠️ Por favor, rellena todos los campos.");
                    tvMessage.setTextColor(Color.parseColor("#ff4d4d"));
                    tvMessage.setVisibility(View.VISIBLE);
                } else {
                    btnRegisterSubmit.setEnabled(false);
                    btnRegisterSubmit.setText("⏳ REGISTRANDO...");

                    ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
                    RegisterRequest request = new RegisterRequest(username, email, password);

                    apiService.register(request).enqueue(new Callback<User>() {
                        @Override
                        public void onResponse(Call<User> call, Response<User> response) {
                            if (response.isSuccessful()) {
                                tvMessage.setText("✅ ¡Registro completado! Redirigiendo...");
                                tvMessage.setTextColor(Color.parseColor("#4CAF50"));
                                tvMessage.setVisibility(View.VISIBLE);

                                new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                                    @Override
                                    public void run() {
                                        Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                                        startActivity(intent);
                                        finish();
                                    }
                                }, 2000);
                            } else {
                                tvMessage.setText("⚠️ Error en el registro. Quizás el email ya existe.");
                                tvMessage.setTextColor(Color.parseColor("#ff4d4d"));
                                tvMessage.setVisibility(View.VISIBLE);
                                btnRegisterSubmit.setEnabled(true);
                                btnRegisterSubmit.setText("📜 REGISTRARSE");
                            }
                        }

                        @Override
                        public void onFailure(Call<User> call, Throwable t) {
                            tvMessage.setText("❌ Error de conexión con el servidor.");
                            tvMessage.setTextColor(Color.parseColor("#ff4d4d"));
                            tvMessage.setVisibility(View.VISIBLE);
                            btnRegisterSubmit.setEnabled(true);
                            btnRegisterSubmit.setText("📜 REGISTRARSE");
                        }
                    });
                }
            }
        });

        tvGoToLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                startActivity(intent);
                finish();
            }
        });
    }
}