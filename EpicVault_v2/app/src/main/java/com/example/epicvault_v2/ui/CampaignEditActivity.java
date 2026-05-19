package com.example.epicvault_v2.ui;

import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.models.DetailedCampaign;
import com.example.epicvault_v2.R;
import com.example.epicvault_v2.network.RetrofitClient;
import com.google.android.material.imageview.ShapeableImageView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CampaignEditActivity extends AppCompatActivity {
    private String campaignId;
    private ShapeableImageView ivPreview;
    private EditText etName, etDesc;
    private Uri selectedImageUri = null;

    private final ActivityResultLauncher<String> mGetContent = registerForActivityResult(
            new ActivityResultContracts.GetContent(), uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    Glide.with(this).load(uri).into(ivPreview);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_campaign_edit);

        campaignId = getIntent().getStringExtra("CAMPAIGN_ID");
        ivPreview = findViewById(R.id.ivEditPreview);
        etName = findViewById(R.id.etEditName);
        etDesc = findViewById(R.id.etEditDesc);

        cargarDatosActuales();

        findViewById(R.id.btnChangeCover).setOnClickListener(v -> mGetContent.launch("image/*"));
        findViewById(R.id.btnSaveCampaign).setOnClickListener(v -> guardarCambios());
    }

    private void cargarDatosActuales() {
        RetrofitClient.getClient().create(ApiService.class).getCampaignById(campaignId).enqueue(new Callback<DetailedCampaign>() {
            @Override
            public void onResponse(Call<DetailedCampaign> call, Response<DetailedCampaign> response) {
                if (response.isSuccessful() && response.body() != null) {
                    etName.setText(response.body().getName());
                    etDesc.setText(response.body().getDescription());
                    String cover = response.body().getCoverUrl();
                    if (cover != null)
                        Glide.with(CampaignEditActivity.this).load(cover.replace("localhost", "10.0.2.2")).into(ivPreview);
                }
            }

            @Override
            public void onFailure(Call<DetailedCampaign> call, Throwable t) {
            }
        });
    }

    private void guardarCambios() {
        String name = etName.getText().toString().trim();
        String desc = etDesc.getText().toString().trim();

        if (name.isEmpty()) {
            Toast.makeText(this, "El nombre es obligatorio", Toast.LENGTH_SHORT).show();
            return;
        }

        Button btnSave = findViewById(R.id.btnSaveCampaign);
        btnSave.setEnabled(false);
        btnSave.setText("Forjando cambios... ⏳");

        RequestBody rbName = RequestBody.create(MediaType.parse("text/plain"), name);
        RequestBody rbDesc = RequestBody.create(MediaType.parse("text/plain"), desc);
        MultipartBody.Part imagePart = null;

        if (selectedImageUri != null) {
            try {
                InputStream is = getContentResolver().openInputStream(selectedImageUri);
                File tempFile = new File(getCacheDir(), "update_cover.jpg");
                FileOutputStream fos = new FileOutputStream(tempFile);
                byte[] buffer = new byte[1024];
                int len;
                while ((len = is.read(buffer)) > 0) fos.write(buffer, 0, len);
                fos.close();
                is.close();
                imagePart = MultipartBody.Part.createFormData("cover_image", tempFile.getName(), RequestBody.create(MediaType.parse("image/*"), tempFile));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        RetrofitClient.getClient().create(ApiService.class).updateCampaign(campaignId, rbName, rbDesc, imagePart).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(CampaignEditActivity.this, "¡Aventura actualizada! 📜", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    btnSave.setEnabled(true);
                    btnSave.setText("Guardar Cambios");
                    Toast.makeText(CampaignEditActivity.this, "Error en Servidor: " + response.code(), Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                btnSave.setEnabled(true);
                btnSave.setText("Guardar Cambios");
                Toast.makeText(CampaignEditActivity.this, "Fallo: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}