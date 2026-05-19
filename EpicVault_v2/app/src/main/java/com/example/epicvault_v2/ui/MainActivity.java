package com.example.epicvault_v2.ui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Menu;
import android.view.View;
import android.widget.Button;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.models.Notification;
import com.example.epicvault_v2.adapters.NotificationAdapter;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.network.RetrofitClient;

public class MainActivity extends AppCompatActivity {

    boolean isLoggedIn = false;
    boolean isAdmin = false;
    String username = "";
    boolean isLightMode = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        isLoggedIn = prefs.getBoolean("IS_LOGGED_IN", false);
        isAdmin = prefs.getBoolean("IS_ADMIN", false);
        username = prefs.getString("USERNAME", "");

        boolean showWelcome = getIntent().getBooleanExtra("SHOW_WELCOME_TOAST", false);
        if (showWelcome && !username.isEmpty()) {
            Toast.makeText(this, "Bienvenido de vuelta, " + username, Toast.LENGTH_LONG).show();
        }

        Button btnGestionarUsuarios = findViewById(R.id.btnGestionarUsuarios);
        Button btnMisCampanas = findViewById(R.id.btnMisCampanas);
        Button btnMiPerfil = findViewById(R.id.btnMiPerfil);
        Button btnEntrarBoveda = findViewById(R.id.btnEntrarBoveda);
        Button btnCrearCuenta = findViewById(R.id.btnCrearCuenta);

        Button navBtnLogin = findViewById(R.id.navBtnLogin);
        TextView navBellIcon = findViewById(R.id.navBellIcon);
        TextView navThemeToggle = findViewById(R.id.navThemeToggle);
        TextView navMenuIcon = findViewById(R.id.navMenuIcon);

        if (isLoggedIn) {
            btnEntrarBoveda.setVisibility(View.GONE);
            btnCrearCuenta.setVisibility(View.GONE);
            navBtnLogin.setVisibility(View.GONE);

            btnMisCampanas.setVisibility(View.VISIBLE);
            btnMiPerfil.setVisibility(View.VISIBLE);
            navBellIcon.setVisibility(View.VISIBLE);

            if (isAdmin) {
                btnGestionarUsuarios.setVisibility(View.VISIBLE);
            }
        }

        btnEntrarBoveda.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, LoginActivity.class)));
        navBtnLogin.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, LoginActivity.class)));
        btnCrearCuenta.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, RegisterActivity.class)));
        btnMiPerfil.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, ProfileActivity.class)));

        btnMisCampanas.setOnClickListener(v -> startActivity(new Intent(MainActivity.this, CampaignsActivity.class)));

        navThemeToggle.setOnClickListener(v -> {
            isLightMode = !isLightMode;
            navThemeToggle.setText(isLightMode ? "☀️" : "🌙");
            Toast.makeText(MainActivity.this, "Tema cambiado (Simulado)", Toast.LENGTH_SHORT).show();
        });

        navBellIcon.setOnClickListener(v -> mostrarBuzonDeCuervos());

        navMenuIcon.setOnClickListener(v -> {
            androidx.appcompat.view.ContextThemeWrapper wrapper = new androidx.appcompat.view.ContextThemeWrapper(MainActivity.this, androidx.appcompat.R.style.ThemeOverlay_AppCompat_Dark);
            PopupMenu popup = new PopupMenu(wrapper, navMenuIcon);
            popup.getMenuInflater().inflate(R.menu.nav_menu, popup.getMenu());

            Menu menu = popup.getMenu();
            if (!isLoggedIn) {
                menu.findItem(R.id.menu_campanas).setVisible(false);
                menu.findItem(R.id.menu_gremio).setVisible(false);
                menu.findItem(R.id.menu_perfil).setVisible(false);
                menu.findItem(R.id.menu_salir).setVisible(false);
            }
            if (!isAdmin) {
                menu.findItem(R.id.menu_herramientas).setVisible(false);
            }

            popup.setOnMenuItemClickListener(item -> {
                int id = item.getItemId();
                if (id == R.id.menu_inicio) {
                    Toast.makeText(MainActivity.this, "Ya estás en Inicio", Toast.LENGTH_SHORT).show();
                } else if (id == R.id.menu_campanas) {
                    startActivity(new Intent(MainActivity.this, CampaignsActivity.class));
                } else if (id == R.id.menu_perfil) {
                    startActivity(new Intent(MainActivity.this, ProfileActivity.class));
                } else if (id == R.id.menu_salir) {
                    SharedPreferences prefsLogout = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
                    prefsLogout.edit().clear().apply();
                    Intent intent = new Intent(MainActivity.this, MainActivity.class);
                    startActivity(intent);
                    finish();
                }
                return true;
            });
            popup.show();
        });
    }

    private void mostrarBuzonDeCuervos() {
        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        String userId = prefs.getString("USER_ID", "");

        if (userId.isEmpty()) {
            Toast.makeText(this, "Error: No se encontró el ID del usuario.", Toast.LENGTH_SHORT).show();
            return;
        }

        com.google.android.material.bottomsheet.BottomSheetDialog bottomSheetDialog = new com.google.android.material.bottomsheet.BottomSheetDialog(this);
        View view = getLayoutInflater().inflate(R.layout.layout_bottom_sheet_notifications, null);
        bottomSheetDialog.setContentView(view);

        androidx.recyclerview.widget.RecyclerView rvNotifications = view.findViewById(R.id.rvNotifications);
        TextView tvEmptyNotifications = view.findViewById(R.id.tvEmptyNotifications);
        TextView btnCleanNotifications = view.findViewById(R.id.btnCleanNotifications);

        rvNotifications.setLayoutManager(new androidx.recyclerview.widget.LinearLayoutManager(this));

        ApiService apiService = RetrofitClient.getClient().create(ApiService.class);

        apiService.getNotifications(userId).enqueue(new retrofit2.Callback<java.util.List<Notification>>() {
            @Override
            public void onResponse(retrofit2.Call<java.util.List<Notification>> call, retrofit2.Response<java.util.List<Notification>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    java.util.List<Notification> listaReal = response.body();

                    if (listaReal.isEmpty()) {
                        tvEmptyNotifications.setVisibility(View.VISIBLE);
                    } else {
                        tvEmptyNotifications.setVisibility(View.GONE);
                    }

                    NotificationAdapter adapter = new NotificationAdapter(listaReal, (notificacion, aceptar) -> {
                        String tipo = notificacion.getType();
                        if ("FRIEND_REQUEST".equals(tipo)) {
                            Toast.makeText(MainActivity.this, (aceptar ? "Aceptando" : "Rechazando") + " amistad de " + notificacion.getSender().getUsername(), Toast.LENGTH_SHORT).show();
                        } else if ("INVITE_RECEIVED".equals(tipo)) {
                            Toast.makeText(MainActivity.this, (aceptar ? "Uniéndose" : "Ignorando") + " campaña.", Toast.LENGTH_SHORT).show();
                        }

                        bottomSheetDialog.dismiss();
                        mostrarBuzonDeCuervos();
                    });

                    rvNotifications.setAdapter(adapter);

                    apiService.markAllAsRead(userId).enqueue(new retrofit2.Callback<Void>() {
                        @Override
                        public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {}
                        @Override
                        public void onFailure(retrofit2.Call<Void> call, Throwable t) {}
                    });

                }
            }

            @Override
            public void onFailure(retrofit2.Call<java.util.List<Notification>> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Fallo al llamar a los cuervos.", Toast.LENGTH_SHORT).show();
            }
        });

        btnCleanNotifications.setOnClickListener(v -> bottomSheetDialog.dismiss());

        bottomSheetDialog.show();
    }
}