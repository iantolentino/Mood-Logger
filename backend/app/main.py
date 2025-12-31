from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from .telegram import send_to_telegram

app = FastAPI(title="Mood Logger API")

# Enable CORS for your GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with your GitHub Pages URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoodData(BaseModel):
    name: str
    moods: List[str]
    date: str = None  # Optional, will be auto-filled if not provided

@app.get("/")
def read_root():
    return {"message": "Mood Logger API is running"}

@app.post("/mood")
async def log_mood(data: MoodData):
    try:
        # If date not provided, use today's date
        if not data.date:
            data.date = datetime.now().strftime("%Y-%m-%d")
        
        # Basic validation
        if not data.name.strip():
            raise HTTPException(status_code=400, detail="Name is required")
        
        if not data.moods or len(data.moods) == 0:
            raise HTTPException(status_code=400, detail="At least one mood is required")
        
        # Send to Telegram
        success = send_to_telegram(data.name, data.moods, data.date)
        
        if success:
            return {"status": "success", "message": "Mood logged successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send to Telegram")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))