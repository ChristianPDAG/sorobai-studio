from supabase import create_client
import os
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY
)
