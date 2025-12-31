import requests
import json

# Your local URL
url = "http://localhost:8000/mood"

data = {
    "name": "Test User",
    "moods": ["happy", "excited", "relaxed"],
    "date": "2023-12-31"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")