package com.suttro.app

object SuttroConfig {
    const val BASE_URL = "https://suttro.app"
    const val WEB_URL = "https://suttro.app"
    const val SUPABASE_URL = "https://api.suttro.app"
    const val SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NTQ2NDY4MCwiZXhwIjo0OTMxMTM4MjgwLCJyb2xlIjoiYW5vbiJ9.wGPBBE4OIh1TJGNugW_SnE9zCJ0zQm7u8gh-6W5Q6Qs"
    const val GOOGLE_WEB_CLIENT_ID = "748036338449-vnd32n4cgau7e9ksu2321q6ka1r2ajcu.apps.googleusercontent.com"

    // localStorage key used by Supabase JS client — derived from hostname
    // api.suttro.app → hostname.split('.')[0] = "api"
    const val SUPABASE_STORAGE_KEY = "sb-api-auth-token"

    const val USER_AGENT_SUFFIX = "SuttroApp"
}
