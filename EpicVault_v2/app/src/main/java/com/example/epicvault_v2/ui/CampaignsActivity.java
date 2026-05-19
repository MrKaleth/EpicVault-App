package com.example.epicvault_v2.ui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.models.Campaign;
import com.example.epicvault_v2.adapters.CampaignAdapter;
import com.example.epicvault_v2.models.JoinCodeRequest;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.network.RetrofitClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CampaignsActivity extends AppCompatActivity {

    private RecyclerView rvCampaigns;
    private CampaignAdapter adapter;
    private List<Campaign> allCampaigns = new ArrayList<>();
    private String currentUserId = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_campaigns);

        rvCampaigns = findViewById(R.id.rvCampaigns);
        rvCampaigns.setLayoutManager(new GridLayoutManager(this, 2));

        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        currentUserId = prefs.getString("USER_ID", "");

        adapter = new CampaignAdapter(new ArrayList<>(), currentUserId, campaign -> {
            Intent intent = new Intent(CampaignsActivity.this, CampaignDetailActivity.class);
            intent.putExtra("CAMPAIGN_ID", campaign.getId());
            startActivity(intent);
        });

        rvCampaigns.setAdapter(adapter);

        findViewById(R.id.fabCreateCampaign).setOnClickListener(v ->
                startActivity(new Intent(CampaignsActivity.this, CampaignCreateActivity.class))
        );

        configurarBuscador();
        configurarLlamadaPuerta();
    }

    @Override
    protected void onResume() {
        super.onResume();
        cargarCampanas();
    }

    private void cargarCampanas() {
        if (currentUserId.isEmpty()) return;

        ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
        apiService.getMyCampaigns(currentUserId).enqueue(new Callback<List<Campaign>>() {
            @Override
            public void onResponse(Call<List<Campaign>> call, Response<List<Campaign>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allCampaigns = response.body();
                    adapter.updateList(allCampaigns);
                }
            }

            @Override
            public void onFailure(Call<List<Campaign>> call, Throwable t) {
                Toast.makeText(CampaignsActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_LONG).show();
                android.util.Log.e("CAMPANAS_ERROR", "Fallo crítico", t);
            }
        });
    }

    private void configurarBuscador() {
        EditText etSearchCampaign = findViewById(R.id.etSearchCampaign);
        etSearchCampaign.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String query = s.toString().toLowerCase().trim();
                List<Campaign> filtradas = new ArrayList<>();
                for (Campaign c : allCampaigns) {
                    if (c.getName() != null && c.getName().toLowerCase().contains(query)) {
                        filtradas.add(c);
                    }
                }
                adapter.updateList(filtradas);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void configurarLlamadaPuerta() {
        EditText etJoinCode = findViewById(R.id.etJoinCode);
        Button btnJoinCode = findViewById(R.id.btnJoinCode);

        btnJoinCode.setOnClickListener(v -> {
            String code = etJoinCode.getText().toString().trim().toUpperCase();
            if (code.isEmpty()) return;

            btnJoinCode.setEnabled(false);
            btnJoinCode.setText("⏳ Llamando...");

            ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
            JoinCodeRequest request = new JoinCodeRequest(code, currentUserId);

            apiService.joinByCode(request).enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    btnJoinCode.setEnabled(true);
                    btnJoinCode.setText("Llamar a la Puerta");
                    etJoinCode.setText("");

                    if (response.isSuccessful()) {
                        Toast.makeText(CampaignsActivity.this, "¡Llamada a la puerta enviada! 🦅", Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(CampaignsActivity.this, "🚫 El código mágico ha fallado.", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    btnJoinCode.setEnabled(true);
                    btnJoinCode.setText("Llamar a la Puerta");
                    Toast.makeText(CampaignsActivity.this, "Error de red.", Toast.LENGTH_SHORT).show();
                }
            });
        });
    }
}