
# Mood Logging Website

## Overview

This website is used to automate mood logging through Telegram conversations.
It allows users to record moods by sending messages in a selected Telegram chat.
The system processes these messages using a Telegram bot and stores the data through a backend service.

---

## How It Works

1. A Telegram bot is created using **BotFather**.
2. The bot API key is configured in the backend.
3. Users send messages to the selected Telegram chat.
4. The backend receives the messages from Telegram and processes them.
5. Mood data is stored and made available through the web interface.

---

## Features

* Telegram-based mood input
* Web interface for users
* Backend service to receive and store data from Telegram
* Uses Telegram Bot API for message handling

---

## Requirements

* Telegram account
* Telegram bot created via BotFather
* Bot API key
* Backend environment configured to receive Telegram updates
* Web server for the user interface

---

## Setup Summary

1. Create a Telegram bot using BotFather and save the API key.
2. Configure the API key in the backend settings.
3. Set the Telegram webhook or polling method to receive messages.
4. Run the backend service.
5. Access the web interface to view logged moods.

---

## Notes

* Users must send messages only in the configured chat for data to be logged.
* The bot must have permission to read messages in the selected chat.
* This project focuses on logging and storing mood data, not message moderation.
