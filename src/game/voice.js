export function createVoice({ onStart, onEnd, onSpeechResult }) {
    const synthesis = "speechSynthesis" in window ? window.speechSynthesis : null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    let recognition = null;
    let enabled = true;
    let fallbackTimer = 0;
    let token = 0;

    if (SpeechRecognition) {
        try {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "id-ID";

            recognition.onresult = (event) => {
                const text = event.results[0]?.[0]?.transcript;
                if (text && typeof onSpeechResult === "function") {
                    onSpeechResult(text);
                }
            };
            recognition.onerror = () => {
                // Ignore voice input errors silently
            };
            recognition.onend = () => {
                // Reset listening state
            };
        } catch {
            recognition = null;
        }
    }

    function chooseVoice() {
        if (!synthesis) return null;
        const voices = synthesis.getVoices();
        return voices.find((voice) => voice.lang.toLowerCase().startsWith("id"))
            ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("ms"))
            ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
            ?? voices[0]
            ?? null;
    }

    function finish(currentToken) {
        if (currentToken !== token) return;
        window.clearTimeout(fallbackTimer);
        onEnd();
    }

    return {
        isSupported: Boolean(synthesis),
        isMicSupported: Boolean(recognition),
        setEnabled(value) {
            enabled = value;
            if (!enabled) this.cancel();
        },
        listen() {
            if (!recognition) return false;
            try {
                this.cancel();
                recognition.start();
                return true;
            } catch {
                return false;
            }
        },
        stopListen() {
            try {
                recognition?.stop();
            } catch { /* noop */ }
        },
        speak(text, rate = 1.02) {
            if (!enabled) return false;
            this.cancel();
            const currentToken = token;
            onStart();
            const estimate = Math.max(1400, Math.min(11000, text.length * 58));
            fallbackTimer = window.setTimeout(() => finish(currentToken), estimate);

            if (!synthesis) return false;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "id-ID";
            utterance.rate = rate;
            utterance.pitch = 1.08;
            const voice = chooseVoice();
            if (voice) utterance.voice = voice;
            utterance.onend = () => finish(currentToken);
            utterance.onerror = () => finish(currentToken);
            synthesis.speak(utterance);
            return true;
        },
        cancel() {
            token += 1;
            window.clearTimeout(fallbackTimer);
            try { recognition?.stop(); } catch { /* noop */ }
            synthesis?.cancel();
            onEnd();
        },
        destroy() {
            this.cancel();
        },
    };
}

