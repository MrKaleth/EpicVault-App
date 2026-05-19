package com.example.epicvault_v2.network;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    private static Retrofit retrofit = null;

    public static Retrofit getClient() {
        if (retrofit == null) {
            // 10.0.2.2 es el localhost del emulador
            retrofit = new Retrofit.Builder()
                    .baseUrl("http://10.0.2.2:4000/")
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}