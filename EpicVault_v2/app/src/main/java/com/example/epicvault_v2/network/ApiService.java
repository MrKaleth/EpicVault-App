package com.example.epicvault_v2.network;

import com.example.epicvault_v2.models.Campaign;
import com.example.epicvault_v2.models.DetailedCampaign;
import com.example.epicvault_v2.models.InviteRequest;
import com.example.epicvault_v2.models.JoinCodeRequest;
import com.example.epicvault_v2.models.LoginRequest;
import com.example.epicvault_v2.models.Notification;
import com.example.epicvault_v2.models.RegisterRequest;
import com.example.epicvault_v2.models.User;
import com.example.epicvault_v2.models.UserUpdateResponse;
import com.example.epicvault_v2.ui.CampaignPlayActivity;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface ApiService {
    @POST("api/login")
    Call<User> login(@Body LoginRequest request);

    @POST("api/register")
    Call<User> register(@Body RegisterRequest request);

    @PUT("usuarios/{id}")
    Call<UserUpdateResponse> updateUser(
            @Path("id") String userId,
            @Body okhttp3.RequestBody body
    );

    @GET("api/notificaciones/{userId}")
    Call<java.util.List<Notification>> getNotifications(@Path("userId") String userId);

    @PUT("api/notificaciones/leidas-todas/{userId}")
    Call<Void> markAllAsRead(@Path("userId") String userId);

    @retrofit2.http.GET("api/campanas/usuario/{userId}")
    Call<java.util.List<Campaign>> getMyCampaigns(@retrofit2.http.Path("userId") String userId);

    @retrofit2.http.POST("api/campanas/join/code")
    Call<Void> joinByCode(@retrofit2.http.Body JoinCodeRequest request);

    @retrofit2.http.Multipart
    @retrofit2.http.POST("api/campanas")
    Call<Campaign> createCampaign(
            @retrofit2.http.Part("name") okhttp3.RequestBody name,
            @retrofit2.http.Part("description") okhttp3.RequestBody description,
            @retrofit2.http.Part("dungeon_master") okhttp3.RequestBody dungeon_master,
            @retrofit2.http.Part okhttp3.MultipartBody.Part cover_image
    );

    @retrofit2.http.GET("api/campanas/{id}")
    Call<DetailedCampaign> getCampaignById(@retrofit2.http.Path("id") String campaignId);

    @retrofit2.http.DELETE("api/campanas/{id}")
    Call<Void> deleteCampaign(@retrofit2.http.Path("id") String campaignId);

    @retrofit2.http.GET("api/amigos/buscar")
    Call<java.util.List<User>> searchUsers(@retrofit2.http.Query("q") String query);

    @retrofit2.http.POST("api/campanas/{id}/invite")
    Call<Void> inviteUser(@retrofit2.http.Path("id") String campaignId, @retrofit2.http.Body InviteRequest request);

    @retrofit2.http.POST("api/campanas/{id}/expulsar")
    Call<Void> removePlayer(
            @retrofit2.http.Path("id") String campaignId,
            @retrofit2.http.Body InviteRequest body // Reutilizamos InviteRequest porque tiene dmId y userId
    );

    @retrofit2.http.POST("api/campanas/{id}/cancelar-invitacion")
    Call<Void> cancelInvite(
            @retrofit2.http.Path("id") String campaignId,
            @retrofit2.http.Body InviteRequest body
    );

    @retrofit2.http.Multipart
    @retrofit2.http.PUT("api/campanas/{id}")
    Call<okhttp3.ResponseBody> updateCampaign(
            @retrofit2.http.Path("id") String id,
            @retrofit2.http.Part("name") okhttp3.RequestBody name,
            @retrofit2.http.Part("description") okhttp3.RequestBody description,
            @retrofit2.http.Part okhttp3.MultipartBody.Part cover_image
    );


    @retrofit2.http.GET("api/personajes/campaign/{id}")
    Call<java.util.List<CampaignPlayActivity.PlayCharacter>> getCharactersByCampaign(@retrofit2.http.Path("id") String campaignId);

    @retrofit2.http.POST("api/personajes")
    Call<Void> createCharacter(@retrofit2.http.Body CampaignPlayActivity.PlayCharacter character);

    @retrofit2.http.DELETE("api/personajes/{id}")
    Call<Void> deleteCharacter(@retrofit2.http.Path("id") String characterId);

    @retrofit2.http.PATCH("api/personajes/{id}/money")
    Call<Void> updateMoney(@retrofit2.http.Path("id") String characterId, @retrofit2.http.Body CampaignPlayActivity.MoneyUpdateRequest moneyData);

    @retrofit2.http.POST("api/personajes/{id}/inventory")
    Call<Void> addToInventory(@retrofit2.http.Path("id") String characterId, @retrofit2.http.Body CampaignPlayActivity.PlayItem item);

    @retrofit2.http.DELETE("api/personajes/{id}/inventory/{itemId}")
    Call<Void> removeFromInventory(@retrofit2.http.Path("id") String characterId, @retrofit2.http.Path("itemId") String itemId);

    @retrofit2.http.GET("api/notas/campaign/{id}")
    Call<java.util.List<CampaignPlayActivity.PlayNote>> getCampaignNotes(@retrofit2.http.Path("id") String campaignId);

    @retrofit2.http.POST("api/notas")
    Call<Void> createNote(@retrofit2.http.Body CampaignPlayActivity.PlayNote note);
}