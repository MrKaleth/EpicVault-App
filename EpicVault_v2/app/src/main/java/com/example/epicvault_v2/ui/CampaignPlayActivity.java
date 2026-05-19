package com.example.epicvault_v2.ui;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.epicvault_v2.R;
import com.example.epicvault_v2.models.DetailedCampaign;
import com.example.epicvault_v2.models.User;
import com.example.epicvault_v2.network.ApiService;
import com.example.epicvault_v2.network.RetrofitClient;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CampaignPlayActivity extends AppCompatActivity {

    private String campaignId;
    private String currentUserId;
    private DetailedCampaign currentCampaign;
    private boolean isDM = false;
    private PlayCharacter myCharacter = null;

    private List<PlayCharacter> characters = new ArrayList<>();
    private List<PlayNote> notes = new ArrayList<>();

    private LinearLayout containerCharacters, containerInventory, containerNotes, llCreateCharacter;
    private Button tabCharacters, tabInventory, tabNotes;
    private RecyclerView rvCharacters, rvPublicLoot, rvNotes;

    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_campaign_play);

        campaignId = getIntent().getStringExtra("CAMPAIGN_ID");
        SharedPreferences prefs = getSharedPreferences("EpicVaultPrefs", MODE_PRIVATE);
        currentUserId = prefs.getString("USER_ID", "");

        apiService = RetrofitClient.getClient().create(ApiService.class);

        vincularVistas();
        configurarPestanas();

        findViewById(R.id.btnExitPlay).setOnClickListener(v -> finish());
        findViewById(R.id.btnCreateCharacter).setOnClickListener(v -> crearPersonaje());
        findViewById(R.id.btnNewNote).setOnClickListener(v -> Toast.makeText(this, "Crear nota (Próximamente)", Toast.LENGTH_SHORT).show());

        cargarDatosBase();
    }

    private void vincularVistas() {
        tabCharacters = findViewById(R.id.tabCharacters);
        tabInventory = findViewById(R.id.tabInventory);
        tabNotes = findViewById(R.id.tabNotes);

        containerCharacters = findViewById(R.id.containerCharacters);
        containerInventory = findViewById(R.id.containerInventory);
        containerNotes = findViewById(R.id.containerNotes);
        llCreateCharacter = findViewById(R.id.llCreateCharacter);

        rvCharacters = findViewById(R.id.rvCharacters);
        rvCharacters.setLayoutManager(new LinearLayoutManager(this));

        rvPublicLoot = findViewById(R.id.rvPublicLoot);
        rvPublicLoot.setLayoutManager(new LinearLayoutManager(this));

        rvNotes = findViewById(R.id.rvNotes);
        rvNotes.setLayoutManager(new LinearLayoutManager(this));
    }

    private void configurarPestanas() {
        tabCharacters.setOnClickListener(v -> setTab("personajes"));
        tabInventory.setOnClickListener(v -> setTab("inventario"));
        tabNotes.setOnClickListener(v -> setTab("notas"));
    }

    private void setTab(String tabName) {
        containerCharacters.setVisibility(View.GONE);
        containerInventory.setVisibility(View.GONE);
        containerNotes.setVisibility(View.GONE);

        int inactiveBg = getResources().getColor(R.color.input_bg_dark);
        int inactiveText = getResources().getColor(R.color.text_main_dark);
        tabCharacters.setBackgroundTintList(android.content.res.ColorStateList.valueOf(inactiveBg));
        tabCharacters.setTextColor(inactiveText);
        tabInventory.setBackgroundTintList(android.content.res.ColorStateList.valueOf(inactiveBg));
        tabInventory.setTextColor(inactiveText);
        tabNotes.setBackgroundTintList(android.content.res.ColorStateList.valueOf(inactiveBg));
        tabNotes.setTextColor(inactiveText);

        int activeBg = getResources().getColor(R.color.secondary);
        int activeText = getResources().getColor(android.R.color.white);

        if (tabName.equals("personajes")) {
            containerCharacters.setVisibility(View.VISIBLE);
            tabCharacters.setBackgroundTintList(android.content.res.ColorStateList.valueOf(activeBg));
            tabCharacters.setTextColor(activeText);
        } else if (tabName.equals("inventario")) {
            containerInventory.setVisibility(View.VISIBLE);
            tabInventory.setBackgroundTintList(android.content.res.ColorStateList.valueOf(activeBg));
            tabInventory.setTextColor(activeText);
            actualizarInventarioGrupal();
        } else {
            containerNotes.setVisibility(View.VISIBLE);
            tabNotes.setBackgroundTintList(android.content.res.ColorStateList.valueOf(activeBg));
            tabNotes.setTextColor(activeText);
        }
    }


    private void cargarDatosBase() {
        apiService.getCampaignById(campaignId).enqueue(new Callback<DetailedCampaign>() {
            @Override
            public void onResponse(Call<DetailedCampaign> call, Response<DetailedCampaign> response) {
                if (response.isSuccessful() && response.body() != null) {
                    currentCampaign = response.body();
                    isDM = currentCampaign.getDungeonMaster() != null && currentCampaign.getDungeonMaster().getId().equals(currentUserId);

                    TextView tvName = findViewById(R.id.tvPlayCampaignName);
                    TextView tvDm = findViewById(R.id.tvPlayDmName);
                    tvName.setText(currentCampaign.getName());
                    tvDm.setText("👑 DM: " + (currentCampaign.getDungeonMaster() != null ? currentCampaign.getDungeonMaster().getUsername() : "Desconocido"));

                    cargarPersonajes();
                } else {
                    Toast.makeText(CampaignPlayActivity.this, "Error Campaña: " + response.code(), Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<DetailedCampaign> call, Throwable t) {
                Toast.makeText(CampaignPlayActivity.this, "Fallo Campaña: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void cargarPersonajes() {
        apiService.getCharactersByCampaign(campaignId).enqueue(new Callback<List<PlayCharacter>>() {
            @Override
            public void onResponse(Call<List<PlayCharacter>> call, Response<List<PlayCharacter>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    characters = response.body();
                    myCharacter = null;

                    for (PlayCharacter c : characters) {
                        if (c.user_id != null && c.user_id.getId().equals(currentUserId)) {
                            myCharacter = c;
                            break;
                        }
                    }

                    if (!isDM && myCharacter == null) {
                        llCreateCharacter.setVisibility(View.VISIBLE);
                    } else {
                        llCreateCharacter.setVisibility(View.GONE);
                    }

                    rvCharacters.setAdapter(new CharacterAdapter(characters));
                    actualizarInventarioGrupal();
                    cargarNotas();
                } else {
                    Toast.makeText(CampaignPlayActivity.this, "Error Personajes: " + response.code(), Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<List<PlayCharacter>> call, Throwable t) {
                Toast.makeText(CampaignPlayActivity.this, "Fallo JSON Personajes: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void cargarNotas() {
        apiService.getCampaignNotes(campaignId).enqueue(new Callback<List<PlayNote>>() {
            @Override
            public void onResponse(Call<List<PlayNote>> call, Response<List<PlayNote>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    notes = response.body();
                    rvNotes.setAdapter(new NoteAdapter(notes));
                } else {
                    Toast.makeText(CampaignPlayActivity.this, "Error Notas: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<PlayNote>> call, Throwable t) {
                Toast.makeText(CampaignPlayActivity.this, "Fallo JSON Notas: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
    private void crearPersonaje() {
        EditText etName = findViewById(R.id.etCharName);
        EditText etRace = findViewById(R.id.etCharRace);
        EditText etClass = findViewById(R.id.etCharClass);

        PlayCharacter newChar = new PlayCharacter();
        newChar.name = etName.getText().toString();
        newChar.race = etRace.getText().toString();
        newChar.clase = etClass.getText().toString();
        newChar.level = 1;
        newChar.campaign_id = campaignId;

        if (newChar.name.isEmpty()) return;

        apiService.createCharacter(newChar).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(CampaignPlayActivity.this, "¡Personaje Creado!", Toast.LENGTH_SHORT).show();
                    cargarPersonajes();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
            }
        });
    }

    private void actualizarInventarioGrupal() {
        int ppt = 0, po = 0, pe = 0, pp = 0, pc = 0;
        List<PlayItem> publicItems = new ArrayList<>();

        for (PlayCharacter c : characters) {
            ppt += c.public_money.ppt;
            po += c.public_money.po;
            pe += c.public_money.pe;
            pp += c.public_money.pp;
            pc += c.public_money.pc;

            for (PlayItem item : c.inventory) {
                if (item.isPublic) {
                    item.ownerName = c.name;
                    publicItems.add(item);
                }
            }
        }

        TextView tvPartyCoins = findViewById(R.id.tvPartyCoins);
        tvPartyCoins.setText("💎 " + ppt + "  |  🪙 " + po + "  |  🔋 " + pe + "  |  ⚪ " + pp + "  |  🟠 " + pc);
        rvPublicLoot.setAdapter(new PublicItemAdapter(publicItems));
    }

    private void abrirFicha(PlayCharacter character) {
        BottomSheetDialog sheetDialog = new BottomSheetDialog(this);
        View view = getLayoutInflater().inflate(R.layout.layout_sheet_character, null);
        sheetDialog.setContentView(view);

        TextView tvName = view.findViewById(R.id.tvSheetName);
        tvName.setText("Ficha: " + character.name);

        EditText etPubPPT = view.findViewById(R.id.etPubPPT);
        etPubPPT.setText(String.valueOf(character.public_money.ppt));
        EditText etPubPO = view.findViewById(R.id.etPubPO);
        etPubPO.setText(String.valueOf(character.public_money.po));
        EditText etPubPE = view.findViewById(R.id.etPubPE);
        etPubPE.setText(String.valueOf(character.public_money.pe));
        EditText etPubPP = view.findViewById(R.id.etPubPP);
        etPubPP.setText(String.valueOf(character.public_money.pp));
        EditText etPubPC = view.findViewById(R.id.etPubPC);
        etPubPC.setText(String.valueOf(character.public_money.pc));

        EditText etPrivPPT = view.findViewById(R.id.etPrivPPT);
        etPrivPPT.setText(String.valueOf(character.private_money.ppt));
        EditText etPrivPO = view.findViewById(R.id.etPrivPO);
        etPrivPO.setText(String.valueOf(character.private_money.po));
        EditText etPrivPE = view.findViewById(R.id.etPrivPE);
        etPrivPE.setText(String.valueOf(character.private_money.pe));
        EditText etPrivPP = view.findViewById(R.id.etPrivPP);
        etPrivPP.setText(String.valueOf(character.private_money.pp));
        EditText etPrivPC = view.findViewById(R.id.etPrivPC);
        etPrivPC.setText(String.valueOf(character.private_money.pc));

        Spinner spinCoinType = view.findViewById(R.id.spinCoinType);
        String[] coins = new String[]{"pc", "pp", "pe", "po", "ppt"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, coins);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinCoinType.setAdapter(adapter);

        view.findViewById(R.id.btnSaveMoney).setOnClickListener(v -> {
            try {
                character.public_money.ppt = Integer.parseInt(etPubPPT.getText().toString());
                character.public_money.po = Integer.parseInt(etPubPO.getText().toString());
                character.public_money.pe = Integer.parseInt(etPubPE.getText().toString());
                character.public_money.pp = Integer.parseInt(etPubPP.getText().toString());
                character.public_money.pc = Integer.parseInt(etPubPC.getText().toString());

                character.private_money.ppt = Integer.parseInt(etPrivPPT.getText().toString());
                character.private_money.po = Integer.parseInt(etPrivPO.getText().toString());
                character.private_money.pe = Integer.parseInt(etPrivPE.getText().toString());
                character.private_money.pp = Integer.parseInt(etPrivPP.getText().toString());
                character.private_money.pc = Integer.parseInt(etPrivPC.getText().toString());

                guardarDinero(character);
                sheetDialog.dismiss();
            } catch (Exception e) {
                Toast.makeText(this, "Datos inválidos", Toast.LENGTH_SHORT).show();
            }
        });

        EditText etSpendAmount = view.findViewById(R.id.etSpendAmount);
        view.findViewById(R.id.btnSpendPublic).setOnClickListener(v -> {
            String amtStr = etSpendAmount.getText().toString();
            if (!amtStr.isEmpty())
                restarDinero(character, true, Integer.parseInt(amtStr), spinCoinType.getSelectedItem().toString(), sheetDialog);
        });
        view.findViewById(R.id.btnSpendPrivate).setOnClickListener(v -> {
            String amtStr = etSpendAmount.getText().toString();
            if (!amtStr.isEmpty())
                restarDinero(character, false, Integer.parseInt(amtStr), spinCoinType.getSelectedItem().toString(), sheetDialog);
        });

        RecyclerView rvPersonal = view.findViewById(R.id.rvPersonalInventory);
        rvPersonal.setLayoutManager(new LinearLayoutManager(this));
        rvPersonal.setAdapter(new PublicItemAdapter(character.inventory));

        EditText etItemName = view.findViewById(R.id.etItemName);
        EditText etItemQty = view.findViewById(R.id.etItemQty);
        CheckBox cbPublic = view.findViewById(R.id.cbItemPublic);

        view.findViewById(R.id.btnAddItem).setOnClickListener(v -> {
            PlayItem nItem = new PlayItem();
            nItem.name = etItemName.getText().toString();
            if (nItem.name.isEmpty()) return;
            nItem.quantity = etItemQty.getText().toString().isEmpty() ? 1 : Integer.parseInt(etItemQty.getText().toString());
            nItem.isPublic = cbPublic.isChecked();

            apiService.addToInventory(character._id, nItem).enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    sheetDialog.dismiss();
                    cargarPersonajes();
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                }
            });
        });

        sheetDialog.show();
    }

    private void restarDinero(PlayCharacter character, boolean esPublico, int amount, String type, BottomSheetDialog dialog) {
        PlayMoney cartera = esPublico ? character.public_money : character.private_money;

        int tasa_ppt = 1000, tasa_po = 100, tasa_pe = 50, tasa_pp = 10, tasa_pc = 1;

        int totalCobre = (cartera.ppt * tasa_ppt) + (cartera.po * tasa_po) +
                (cartera.pe * tasa_pe) + (cartera.pp * tasa_pp) + cartera.pc;

        int multiplicador = 1;
        switch (type) {
            case "ppt":
                multiplicador = tasa_ppt;
                break;
            case "po":
                multiplicador = tasa_po;
                break;
            case "pe":
                multiplicador = tasa_pe;
                break;
            case "pp":
                multiplicador = tasa_pp;
                break;
        }

        int costeCobre = amount * multiplicador;

        if (totalCobre < costeCobre) {
            Toast.makeText(this, "¡Fondos insuficientes!", Toast.LENGTH_LONG).show();
            return;
        }

        totalCobre -= costeCobre;

        cartera.ppt = totalCobre / tasa_ppt;
        totalCobre %= tasa_ppt;
        cartera.po = totalCobre / tasa_po;
        totalCobre %= tasa_po;
        cartera.pe = totalCobre / tasa_pe;
        totalCobre %= tasa_pe;
        cartera.pp = totalCobre / tasa_pp;
        cartera.pc = totalCobre % tasa_pp;

        guardarDinero(character);
        dialog.dismiss();
    }

    private void guardarDinero(PlayCharacter c) {
        MoneyUpdateRequest req = new MoneyUpdateRequest();
        req.public_money = c.public_money;
        req.private_money = c.private_money;

        apiService.updateMoney(c._id, req).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                cargarPersonajes();
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
            }
        });
    }

    class CharacterAdapter extends RecyclerView.Adapter<CharacterAdapter.ViewHolder> {
        List<PlayCharacter> list;

        CharacterAdapter(List<PlayCharacter> l) {
            this.list = l;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            return new ViewHolder(LayoutInflater.from(parent.getContext()).inflate(R.layout.item_play_character, parent, false));
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            PlayCharacter c = list.get(position);
            holder.tvName.setText(c.name);
            holder.tvInfo.setText(c.race + " • " + c.clase + " (Nvl." + c.level + ")");
            holder.tvPlayer.setText("👤 Jugador: " + (c.user_id != null ? c.user_id.getUsername() : "Desconocido"));

            holder.tvMoney.setText("💎 " + c.public_money.ppt + " | 🪙 " + c.public_money.po + " | 🔋 " + c.public_money.pe + " | ⚪ " + c.public_money.pp + " | 🟠 " + c.public_money.pc);

            if (isDM || (myCharacter != null && myCharacter._id.equals(c._id))) {
                holder.llActions.setVisibility(View.VISIBLE);
                holder.btnView.setOnClickListener(v -> abrirFicha(c));
                holder.btnDel.setOnClickListener(v -> {
                    apiService.deleteCharacter(c._id).enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> r) {
                            cargarPersonajes();
                        }

                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                        }
                    });
                });
            } else {
                holder.llActions.setVisibility(View.GONE);
            }
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvName, tvInfo, tvPlayer, tvMoney;
            LinearLayout llActions;
            Button btnView, btnDel;

            ViewHolder(View v) {
                super(v);
                tvName = v.findViewById(R.id.tvCharName);
                tvInfo = v.findViewById(R.id.tvCharInfo);
                tvPlayer = v.findViewById(R.id.tvCharPlayer);
                tvMoney = v.findViewById(R.id.tvCharMoney);
                llActions = v.findViewById(R.id.llCharActions);
                btnView = v.findViewById(R.id.btnViewSheet);
                btnDel = v.findViewById(R.id.btnDeleteChar);
            }
        }
    }

    class PublicItemAdapter extends RecyclerView.Adapter<PublicItemAdapter.ViewHolder> {
        List<PlayItem> list;

        PublicItemAdapter(List<PlayItem> l) {
            this.list = l != null ? l : new ArrayList<>();
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            TextView tv = new TextView(parent.getContext());
            tv.setPadding(32, 24, 32, 24);
            tv.setTextSize(16f);
            tv.setTextColor(getResources().getColor(android.R.color.white));
            return new ViewHolder(tv);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            PlayItem i = list.get(position);
            String owner = i.ownerName != null ? " (de " + i.ownerName + ")" : "";
            ((TextView) holder.itemView).setText("x" + i.quantity + " " + i.name + owner);
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            ViewHolder(View v) {
                super(v);
            }
        }
    }

    class NoteAdapter extends RecyclerView.Adapter<NoteAdapter.ViewHolder> {
        List<PlayNote> list;

        NoteAdapter(List<PlayNote> l) {
            this.list = l;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            TextView tv = new TextView(parent.getContext());
            tv.setPadding(32, 32, 32, 32);
            tv.setTextSize(16f);
            tv.setTextColor(getResources().getColor(android.R.color.white));
            return new ViewHolder(tv);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            ((TextView) holder.itemView).setText("📜 " + list.get(position).title + "\n" + list.get(position).content);
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            ViewHolder(View v) {
                super(v);
            }
        }
    }

    public static class PlayCharacter {
        String _id;
        String name;
        String race;
        @com.google.gson.annotations.SerializedName("class")
        String clase;
        int level;
        String campaign_id;
        User user_id;

        PlayMoney public_money = new PlayMoney();
        PlayMoney private_money = new PlayMoney();
        List<PlayItem> inventory = new ArrayList<>();
    }

    public static class PlayMoney {
        int ppt = 0;
        int po = 0;
        int pe = 0;
        int pp = 0;
        int pc = 0;
    }

    public static class MoneyUpdateRequest {
        PlayMoney public_money;
        PlayMoney private_money;
    }

    public static class PlayItem {
        String _id;
        String name;
        int quantity;
        boolean isPublic;
        String ownerName;
    }

    public static class PlayNote {
        String _id;
        String title;
        String content;
        boolean isPublic;
    }
}