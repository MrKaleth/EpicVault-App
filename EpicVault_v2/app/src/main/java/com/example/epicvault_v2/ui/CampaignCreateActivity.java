package com.example.epicvault_v2.ui;

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
import com.example.epicvault_v2.models.Campaign;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.network.RetrofitClient;
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

public class CampaignCreateActivity extends AppCompatActivity {

    private ShapeableImageView ivCampaignPreview;
    private Uri selectedImageUri = null;
    private String currentUserId = "";

    private final ActivityResultLauncher<String> mGetContent = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    ivCampaignPreview.setVisibility(View.VISIBLE);
                    Glide.with(this).load(uri).into(ivCampaignPreview);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_campaign_create);

        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        currentUserId = prefs.getString("USER_ID", "");

        ivCampaignPreview = findViewById(R.id.ivCampaignPreview);
        Button btnSelectCover = findViewById(R.id.btnSelectCover);
        EditText etCampaignName = findViewById(R.id.etCampaignName);
        EditText etCampaignDesc = findViewById(R.id.etCampaignDesc);
        TextView tvCreateError = findViewById(R.id.tvCreateError);
        Button btnCancelCreate = findViewById(R.id.btnCancelCreate);
        Button btnSubmitCampaign = findViewById(R.id.btnSubmitCampaign);

        btnSelectCover.setOnClickListener(v -> mGetContent.launch("image/*"));

        btnCancelCreate.setOnClickListener(v -> finish());

        btnSubmitCampaign.setOnClickListener(v -> {
            String name = etCampaignName.getText().toString().trim();
            String desc = etCampaignDesc.getText().toString().trim();

            if (name.isEmpty() || currentUserId.isEmpty()) {
                tvCreateError.setText("⚠️ El nombre de la aventura es obligatorio.");
                tvCreateError.setVisibility(View.VISIBLE);
                return;
            }

            btnSubmitCampaign.setEnabled(false);
            btnSubmitCampaign.setText("⏳ Forjando...");
            tvCreateError.setVisibility(View.GONE);

            RequestBody rbName = RequestBody.create(MediaType.parse("text/plain"), name);
            RequestBody rbDesc = RequestBody.create(MediaType.parse("text/plain"), desc);
            RequestBody rbDmId = RequestBody.create(MediaType.parse("text/plain"), currentUserId);

            MultipartBody.Part imagePart = null;
            if (selectedImageUri != null) {
                try {
                    InputStream is = getContentResolver().openInputStream(selectedImageUri);
                    File tempFile = new File(getCacheDir(), "upload_cover.jpg");
                    FileOutputStream fos = new FileOutputStream(tempFile);
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = is.read(buffer)) > 0) { fos.write(buffer, 0, len); }
                    fos.close(); is.close();

                    RequestBody reqFile = RequestBody.create(MediaType.parse("image/*"), tempFile);
                    imagePart = MultipartBody.Part.createFormData("cover_image", tempFile.getName(), reqFile);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            ApiService apiService = RetrofitClient.getClient().create(ApiService.class);
            apiService.createCampaign(rbName, rbDesc, rbDmId, imagePart).enqueue(new Callback<Campaign>() {
                @Override
                public void onResponse(Call<Campaign> call, Response<Campaign> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(CampaignCreateActivity.this, "¡Campaña forjada con éxito!", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        tvCreateError.setText("⚠️ Error al forjar la campaña.");
                        tvCreateError.setVisibility(View.VISIBLE);
                        btnSubmitCampaign.setEnabled(true);
                        btnSubmitCampaign.setText("Crear Partida");
                    }
                }

                @Override
                public void onFailure(Call<Campaign> call, Throwable t) {
                    tvCreateError.setText("⚠️ Error de red: " + t.getMessage());
                    tvCreateError.setVisibility(View.VISIBLE);
                    btnSubmitCampaign.setEnabled(true);
                    btnSubmitCampaign.setText("Crear Partida");
                }
            });
        });
    }
}