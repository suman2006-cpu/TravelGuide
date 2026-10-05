// ============================================================
// CONSTANTS
// ============================================================

const VOICES = {
  English: {
    Male: "Matthew",
    Female: "Alicia"
  },

  Hindi: {
    Male: "Aman",
    Female: "Namrita"
  },

  Tamil: {
    Male: "Murali",
    Female: "Iniya"
  },

  Telugu: {
    Male: "Zion",
    Female: "Josie"
  }
};


const LOCALES = {
  English: "en-US",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN"
};


// ============================================================
// STATE
// ============================================================

const state = {
  place: "",
  image: "",
  length: "Summary",
  voice: "Male"
};


// ============================================================
// API
// ============================================================

const GENERATE_AUDIO_GUIDE_API_URL =
  "https://travelguide-backend-35am.onrender.com/generate-audio-guide";


// ============================================================
// DOM ELEMENTS
// ============================================================

const cardsContainer =
  document.querySelector(".cards");

const experiencePanel =
  document.getElementById("experience");

const previewTitle =
  document.getElementById("previewTitle");

const audioSection =
  document.getElementById("audioSection");

const audioPlayer =
  document.getElementById("audioPlayer");

const transcriptText =
  document.getElementById("scriptText");

const generateButton =
  document.getElementById("generateBtn");

const languageSelect =
  document.getElementById("selectLanguage");

const closeButton =
  document.getElementById("closeExperience");

const searchPreviewCard =
  document.getElementById("searchPreviewCard");

const searchPreviewImage =
  document.getElementById("searchPreviewImage");

const searchPreviewTitle =
  document.getElementById("searchPreviewTitle");

const transcriptToggle =
  document.getElementById("transcriptToggle");

const transcriptContent =
  document.getElementById("transcriptContent");

const transcriptArrow =
  document.getElementById("transcriptArrow");


// ============================================================
// SELECT DESTINATION
// ============================================================

function selectDestination(
  place,
  image,
  clickedCard = null
) {

  state.place = place;
  state.image = image;

  // Update title
  previewTitle.textContent = place;

  // Fade cards
  cardsContainer.classList.add("faded");

  // Remove active state
  document
    .querySelectorAll(".place-card")
    .forEach(card => {
      card.classList.remove("active");
    });

  searchPreviewCard.classList.add("hidden");


  // Handle selected card
  if (clickedCard) {

    clickedCard.classList.add("active");

  } else {

    searchPreviewImage.src = image;
    searchPreviewTitle.textContent = place;

    searchPreviewCard.classList.remove("hidden");
    searchPreviewCard.classList.add("active");
  }


  // Reset audio section
  audioSection.classList.add("hidden");

  audioPlayer.src = "";

  transcriptText.textContent = "";

  generateButton.textContent =
    "Generate Audio Guide";

  generateButton.disabled = false;


  // Show experience panel
  experiencePanel.classList.remove("hidden");

  setTimeout(() => {
    experiencePanel.classList.add("visible");
  }, 10);
}


// ============================================================
// DESELECT DESTINATION
// ============================================================

function deselectDestination() {

  experiencePanel.classList.remove("visible");

  setTimeout(() => {

    experiencePanel.classList.add("hidden");

    cardsContainer.classList.remove("faded");

    searchPreviewCard.classList.add("hidden");

    document
      .querySelectorAll(".place-card")
      .forEach(card => {
        card.classList.remove("active");
      });

  }, 300);
}


// ============================================================
// CLOSE BUTTON
// ============================================================

closeButton.addEventListener(
  "click",
  deselectDestination
);


// ============================================================
// CARD CLICKS
// ============================================================

document
  .querySelectorAll(".place-card:not(.search-preview-card)")
  .forEach(card => {

    card.addEventListener("click", () => {

      selectDestination(
        card.dataset.place,
        card.dataset.image,
        card
      );

    });

  });


// ============================================================
// SUMMARY / DETAILED TOGGLE
// ============================================================

const lengthButtons =
  document.querySelectorAll(
    '[data-group="length"] button'
  );

lengthButtons.forEach(button => {

  button.addEventListener("click", () => {

    lengthButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    state.length = button.dataset.value;

  });

});


// ============================================================
// MALE / FEMALE TOGGLE
// ============================================================

const voiceButtons =
  document.querySelectorAll(
    '[data-group="voice"] button'
  );

voiceButtons.forEach(button => {

  button.addEventListener("click", () => {

    voiceButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    state.voice = button.dataset.value;

  });

});


// ============================================================
// GENERATE AUDIO GUIDE
// ============================================================

generateButton.addEventListener(
  "click",
  async () => {

    // Prevent duplicate requests
    generateButton.disabled = true;

    generateButton.textContent =
      "⏳ Generating Audio...";


    try {

      // ------------------------------------------------------
      // Get selected options
      // ------------------------------------------------------

      const selectedLanguage =
        languageSelect.value;

      const selectedVoice =
        state.voice;


      // ------------------------------------------------------
      // Get Murf voice and locale
      // ------------------------------------------------------

      const voiceId =
        VOICES[selectedLanguage]?.[selectedVoice];

      const locale =
        LOCALES[selectedLanguage];


      // ------------------------------------------------------
      // Validate selections
      // ------------------------------------------------------

      if (!voiceId) {
        throw new Error(
          `No ${selectedVoice} voice found for ${selectedLanguage}.`
        );
      }

      if (!locale) {
        throw new Error(
          `No locale found for ${selectedLanguage}.`
        );
      }


      // ------------------------------------------------------
      // Send request to Flask
      // ------------------------------------------------------

      console.log("Sending audio request:", {
        place: state.place,
        answerType: state.length,
        language: selectedLanguage,
        voiceId: voiceId,
        locale: locale
      });


      const response = await fetch(
        GENERATE_AUDIO_GUIDE_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            place: state.place,

            answerType: state.length,

            language: selectedLanguage,

            voiceId: voiceId,

            locale: locale
          })
        }
      );


      // ------------------------------------------------------
      // Read response
      // ------------------------------------------------------

      const data =
        await response.json();


      // ------------------------------------------------------
      // Handle backend errors
      // ------------------------------------------------------

      if (!response.ok) {

        console.error(
          "Backend error:",
          data
        );

        throw new Error(
          data.error ||
          "Audio generation failed."
        );
      }


      // ------------------------------------------------------
      // Display transcript
      // ------------------------------------------------------

      transcriptText.textContent =
        data.description || "";

      audioSection.classList.remove("hidden");


      // ------------------------------------------------------
      // Display audio
      // ------------------------------------------------------

      if (data.audioBase64) {

        audioPlayer.src =
          `data:audio/mpeg;base64,${data.audioBase64}`;

        audioPlayer.load();

        audioPlayer.classList.remove("hidden");

        generateButton.textContent =
          "Listen to Audio";

      } else {

        audioPlayer.classList.add("hidden");

        generateButton.textContent =
          "Audio Not Available";
      }


    } catch (error) {

      console.error(
        "Audio generation error:",
        error
      );

      alert(
        `Generation failed:\n\n${error.message}`
      );

      generateButton.textContent =
        "Generate Audio Guide";

      generateButton.disabled = false;

    }

  }
);


// ============================================================
// TRANSCRIPT TOGGLE
// ============================================================

transcriptToggle.addEventListener(
  "click",
  () => {

    transcriptContent.classList.toggle(
      "hidden"
    );

    transcriptArrow.classList.toggle(
      "rotate-180"
    );

  }
);