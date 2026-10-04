from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
import requests
import tempfile
import base64
import os
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)


# ============================================================
# API KEYS
# ============================================================

MURF_API_KEY = os.getenv("MURF_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not MURF_API_KEY:
    raise RuntimeError("MURF_API_KEY environment variable is missing.")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is missing.")


client = genai.Client(api_key=GEMINI_API_KEY)


# ============================================================
# PROMPTS
# ============================================================

PROMPTS = {
    "Summary": """
You are a professional tourist guide.

Provide a high-level overview of "{place}" in {language}.

Focus on:
- The historical significance
- Why the place is famous
- Key architectural or cultural highlights

Keep the explanation concise, engaging, and easy to follow.
Avoid excessive details and dates.
Limit the response to around 200 words.

Respond ONLY in {language}.
""",

    "Detailed": """
You are a professional tourist guide.

Provide a detailed and immersive explanation of "{place}" in {language}.

Cover:
- Historical background and timeline
- Architectural design and unique features
- Cultural importance and notable events
- Interesting facts and visitor insights

Explain concepts clearly and in a storytelling manner.
Include relevant details and examples to create a rich experience.
Limit the response to around 400 words.

Respond ONLY in {language}.
"""
}


# ============================================================
# GENERATE GEMINI DESCRIPTION
# ============================================================

def generate_description(place, answer_type, language):

    if answer_type not in PROMPTS:
        raise ValueError("Invalid answer type.")

    prompt = PROMPTS[answer_type].format(
        place=place,
        language=language
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text.strip()


# ============================================================
# GENERATE MURF AUDIO
# ============================================================

def generate_speech(text, voice_id, locale):

    url = "https://global.api.murf.ai/v1/speech/stream"

    headers = {
        "api-key": "ap2_16440a6e-719a-4c4c-8b46-301714ee3d95",
        "Content-Type": "application/json"
    }

    payload = {
        "voice_id": voice_id,
        "text": text,
        "locale": locale,
        "model": "FALCON",
        "format": "MP3",
        "sampleRate": 24000,
        "channelType": "MONO"
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=120
    )

    if response.status_code != 200:
        print("Murf Error:")
        print(response.status_code)
        print(response.text)

        raise RuntimeError(
            f"Murf API failed with status {response.status_code}"
        )

    temp_audio = tempfile.NamedTemporaryFile(
        suffix=".mp3",
        delete=False
    )

    try:
        with open(temp_audio.name, "wb") as audio_file:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    audio_file.write(chunk)

        return temp_audio.name

    finally:
        temp_audio.close()


# ============================================================
# API ROUTE
# ============================================================

@app.route("/generate-audio-guide", methods=["POST"])
def generate_audio_guide():

    try:

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "error": "Request body is missing or invalid JSON."
            }), 400

        # ----------------------------------------------------
        # Get values from frontend
        # ----------------------------------------------------

        place = data.get("place")
        answer_type = data.get("answerType")
        language = data.get("language")
        voice_id = data.get("voiceId")
        locale = data.get("locale")

        # ----------------------------------------------------
        # Validate values
        # ----------------------------------------------------

        missing = []

        if not place:
            missing.append("place")

        if not answer_type:
            missing.append("answerType")

        if not language:
            missing.append("language")

        if not voice_id:
            missing.append("voiceId")

        if not locale:
            missing.append("locale")

        if missing:
            return jsonify({
                "error": "Missing required fields.",
                "missing": missing
            }), 400

        print("\n========== AUDIO REQUEST ==========")
        print("Place:", place)
        print("Answer Type:", answer_type)
        print("Language:", language)
        print("Voice ID:", voice_id)
        print("Locale:", locale)
        print("===================================\n")

        # ----------------------------------------------------
        # Generate text using Gemini
        # ----------------------------------------------------

        text_description = generate_description(
            place,
            answer_type,
            language
        )

        print("Gemini description generated successfully.")

        # ----------------------------------------------------
        # Generate audio using Murf
        # ----------------------------------------------------

        audio_path = generate_speech(
            text_description,
            voice_id,
            locale
        )

        print("Murf audio generated successfully.")

        # ----------------------------------------------------
        # Read audio
        # ----------------------------------------------------

        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()

        encoded_audio = base64.b64encode(
            audio_bytes
        ).decode("utf-8")

        # Delete temporary file
        try:
            os.remove(audio_path)
        except OSError:
            pass

        # ----------------------------------------------------
        # Send response to frontend
        # ----------------------------------------------------

        return jsonify({
            "description": text_description,
            "audioBase64": encoded_audio
        })

    except Exception as e:

        print("\n========== BACKEND ERROR ==========")
        print(str(e))
        print("===================================\n")

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )