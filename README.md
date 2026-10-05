# 🌍 TravelGuide – AI-Powered Audio Tourist Guide

TravelGuide is an AI-powered tourist guide that provides users with informative and engaging descriptions of tourist destinations and converts them into natural-sounding audio.

The application uses **Google Gemini** to generate destination information and **Murf AI** to convert the generated content into speech.

---

## ✨ Features

- 🗺️ Get information about tourist destinations
- 🤖 AI-generated descriptions using Google Gemini
- 📖 Choose between:
  - Summary
  - Detailed
- 🌐 Generate descriptions in different languages
- 🎙️ Convert AI-generated descriptions into speech using Murf AI
- 🔊 Listen to an audio guide for the selected destination
- ⚡ Simple and user-friendly interface
- 🔐 API keys securely managed using environment variables

---

## 🛠️ Tech Stack

### Frontend
- HTML
- JavaScript
- CSS

### Backend
- Python
- Flask
- Flask-CORS

### AI & APIs
- Google Gemini API
- Murf AI Text-to-Speech API

### Deployment
- Frontend: Vercel
- Backend: Render

---

## 📂 Project Structure

```text
TravelGuide/
│
├── Backend/
│   ├── app.py
│   └── requirements.txt
│
├── Frontend/
│   ├── index.html
│   └── index.js
│
├── .gitignore
└── README.md
```

> ⚠️ The `.env` file is kept locally and should never be uploaded to GitHub.

---

## 🔑 Environment Variables

Create a `.env` file inside the `Backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
MURF_API_KEY=your_murf_api_key
```

The application reads these values securely using environment variables.

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/suman2006-cpu/TravelGuide.git
```

### 2. Navigate to the project

```bash
cd TravelGuide
```

### 3. Navigate to the backend

```bash
cd Backend
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Add your API keys

Create a `.env` file inside the `Backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
MURF_API_KEY=your_murf_api_key
```

### 6. Start the Flask backend

```bash
python app.py
```

The backend will run locally on:

```text
http://127.0.0.1:5000
```

### 7. Run the frontend

Open:

```text
Frontend/index.html
```

in your browser or use a local development server such as VS Code Live Server.

---

## 🔄 How It Works

```text
User selects a destination
          ↓
User selects answer type
          ↓
User selects language
          ↓
Frontend sends request to Flask backend
          ↓
Flask sends the prompt to Google Gemini
          ↓
Gemini generates the destination description
          ↓
Description is sent to Murf AI
          ↓
Murf generates the audio
          ↓
Backend returns description + audio
          ↓
User receives the AI-powered audio guide
```

---

## 🤖 Google Gemini

Google Gemini is used to generate informative tourist descriptions based on:

- Destination
- Answer type
- Selected language

The application supports both concise summaries and detailed explanations.

---

## 🎙️ Murf AI

Murf AI is used to convert the generated tourist description into speech.

The backend sends:

- Generated text
- Voice ID
- Language locale

and receives an audio response that can be played by the frontend.

---

## 🔐 Security

API keys are stored using environment variables and should **never be hardcoded or committed to GitHub**.

Make sure your `.gitignore` contains:

```gitignore
.env
__pycache__/
*.pyc
```

---

## 🌐 Deployment

### Backend

The Flask backend can be deployed using **Render**.

Recommended start command:

```bash
gunicorn --bind 0.0.0.0:$PORT app:app
```

Add the following environment variables in Render:

```text
GEMINI_API_KEY
MURF_API_KEY
```

### Frontend

The frontend can be deployed using **Vercel**.

After deploying the backend, update the frontend API URL to point to the deployed backend instead of:

```text
http://127.0.0.1:5000
```

---

## 📌 Future Improvements

- 📍 Interactive maps
- 🧭 GPS-based destination recommendations
- ⭐ User reviews and ratings
- 🗺️ Route planning
- 🎧 More voice options
- 📱 Mobile-friendly improvements
- 💾 Save favorite destinations
- 🌎 Support for more languages

---

## 👨‍💻 Author

**Suman**

Built as an AI-powered travel and tourism project using modern web technologies and generative AI.

---

## ⭐ If you like this project

Give the repository a ⭐ on GitHub!
