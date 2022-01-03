const VOICE_NAME = 'Mei-Jia'

const synth = window.speechSynthesis;
let selectedVoice;

function selectVoice() {
    selectedVoice = synth.getVoices().find(voice => voice.name == VOICE_NAME);
}

selectVoice()
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = selectVoice;
}

function speak(message) {
    if (synth.speaking) {
        // console.error('speechSynthesis.speaking');
        synth.cancel()
    }
    const utterThis = new SpeechSynthesisUtterance(message);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
    utterThis.voice = selectedVoice;
    utterThis.pitch = 1.0;
    utterThis.rate = 1.0;
    synth.speak(utterThis);
}

const chat_bubbles = document.querySelectorAll('.speakable');
for (const chat_bubble of chat_bubbles) {
    chat_bubble.addEventListener('click', function(event) {
        speak(chat_bubble.innerText);
    }, false);
}