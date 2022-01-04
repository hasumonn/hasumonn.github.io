// Synthesize speech from chat bubbles using Web Speech API.
// Use formatting-based pitch and rate shifting.

const ENABLE_SYNTHESIS = true;
const VOICE_NAME = 'Samantha';
const SPEAKABLE_CLASS = '.speakable';
const BOLD_TAGS = new Set(['b', 'strong', 'h4']);

const BOLD_PITCH = 0.7;
const BOLD_RATE = 0.9;
const REGULAR_PITCH = 1.1;
const REGULAR_RATE = 1.0;

const synth = window.speechSynthesis;
synth.onvoiceschanged = selectVoice;
let selectedVoice;

const chatBubbles = document.querySelectorAll(SPEAKABLE_CLASS);
for (const chatBubble of chatBubbles) {
  chatBubble.addEventListener('click', function(event) {
    const snippets = getSnippets(chatBubble);
    const condensedSnippets = condenseSnippets(snippets);
    console.log(condensedSnippets);
    if (ENABLE_SYNTHESIS) {
      speak(condensedSnippets);
    }
  }, false);
}

// -- Function Definitions -- //

function selectVoice() {
  selectedVoice = synth.getVoices().find(voice => voice.name == VOICE_NAME);
}

// Load the synth speaking queue with pitch- and rate- shifted utterances based
// on text snippets containing bold/non-bold text.
function speak(snippets) {
  if (synth.speaking) {
    synth.cancel();
  }

  for (const snippet of snippets) {
    const utterance = new SpeechSynthesisUtterance(snippet.text);
    utterance.voice = selectedVoice;
    utterance.pitch = snippet.bold ? BOLD_PITCH : REGULAR_PITCH;
    utterance.rate = snippet.bold ? BOLD_RATE : REGULAR_RATE;
    synth.speak(utterance);
  }
}

// Use DFS to collect text elements in-order. Annotate text contained within
// specified tags so that they can be uttered with an alternative pitch and
// rate.
function getSnippets(rootElement) {
  const snippets = [];

  const stack = [rootElement];
  while (stack.length) {
    const curr = stack.pop();

    if (curr.localName && BOLD_TAGS.has(curr.localName)) {
      // Treat node as leaf, and all innerText as bold.
      snippets.push({ bold: true, text: curr.innerText });
    } else {
      // All other value-containing nodes are regular text.
      if (curr.nodeValue) {
        snippets.push({ bold: false, text: curr.nodeValue });
      }
      // Non-bold nodes should be expanded. Append nodes in reverse for in-order
      // traversal.
      for (let i = curr.childNodes.length - 1; i >= 0; i--) {
        stack.push(curr.childNodes[i]);
      }
    }
  }

  return snippets;
}

// Group non-bold text elements together for improved fluency.
function condenseSnippets(snippets) {
  const condensedSnippets = [];
  for (const snippet of snippets) {
    const lastSnippet = condensedSnippets[condensedSnippets.length - 1];
    if (!snippet.bold && lastSnippet && !lastSnippet.bold) {
      lastSnippet.text = lastSnippet.text + snippet.text;
    } else {
      condensedSnippets.push(snippet);
    }
  }
  return condensedSnippets;
}
