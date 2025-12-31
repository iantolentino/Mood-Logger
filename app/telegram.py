import os
import requests
from datetime import datetime

def send_to_telegram(name: str, moods: list, date_str: str) -> bool:
    """Send formatted message to Telegram"""
    
    # Get environment variables
    BOT_TOKEN = os.getenv("BOT_TOKEN")
    CHAT_ID = os.getenv("CHAT_ID")
    
    if not BOT_TOKEN or not CHAT_ID:
        print("ERROR: BOT_TOKEN or CHAT_ID not set")
        return False
    
    # Format date for display (MM/DD/YYYY)
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        formatted_date = date_obj.strftime("%m/%d/%Y")
    except:
        formatted_date = date_str
    
    # Create message
    message = f"*{name} Mood Today ({formatted_date})*\n\n"
    for mood in moods:
        message += f"• {mood}\n"
    
    # Send to Telegram
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        print(f"Message sent successfully to Telegram")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Failed to send to Telegram: {e}")
        return False