import { getConfig, saveConfig, resetConfig, DEFAULTS } from "../config.js";

/* ─── Settings Modal ─────────────────────────────────────────────────────── */

function createSettingsModal(onSaved) {
    const overlay = document.createElement("div");
    overlay.className = "settings-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Pengaturan TIKA CORE");

    overlay.innerHTML = `
      <div class="settings-panel">
        <div class="settings-header">
          <div class="settings-title-group">
            <svg class="settings-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
            </svg>
            <h2 class="settings-title">Pengaturan TIKA</h2>
          </div>
          <button class="settings-close" aria-label="Tutup pengaturan">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="settings-body">
          <div class="settings-section">
            <p class="settings-section-label">9ROUTER · AI BRIDGE</p>
            <div class="settings-field">
              <label for="cfg-bridge-url">URL Server</label>
              <div class="settings-input-wrap">
                <input id="cfg-bridge-url" type="url" spellcheck="false"
                  placeholder="http://localhost:20128/v1" />
                <span class="cfg-badge" id="cfg-status">—</span>
              </div>
              <p class="settings-hint">Base URL 9router/AI Bridge (OpenAI-compatible). Endpoint <code>/chat/completions</code> ditambahkan otomatis.</p>
            </div>
            <div class="settings-field">
              <label for="cfg-model">Nama Model</label>
              <input id="cfg-model" type="text" spellcheck="false"
                placeholder="tika-model" />
              <p class="settings-hint">Nama model yang dikirim ke bridge. Sesuaikan dengan model yang di-load di 9router.</p>
            </div>
            <div class="settings-row2">
              <div class="settings-field">
                <label for="cfg-temp">Temperature <span class="cfg-val" id="cfg-temp-val">0.7</span></label>
                <input id="cfg-temp" type="range" min="0" max="1" step="0.05" />
                <p class="settings-hint">Rendah = pasti, Tinggi = kreatif</p>
              </div>
              <div class="settings-field">
                <label for="cfg-tokens">Max Tokens <span class="cfg-val" id="cfg-tokens-val">500</span></label>
                <input id="cfg-tokens" type="range" min="128" max="2048" step="64" />
                <p class="settings-hint">Panjang maksimal respons AI</p>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="settings-btn-reset" id="cfg-reset">Reset Default</button>
          <div class="settings-footer-right">
            <button class="settings-btn-test" id="cfg-test">Tes Koneksi</button>
            <button class="settings-btn-save" id="cfg-save">Simpan</button>
          </div>
        </div>
      </div>
    `;

    // Refs
    const urlInput    = overlay.querySelector("#cfg-bridge-url");
    const modelInput  = overlay.querySelector("#cfg-model");
    const tempSlider  = overlay.querySelector("#cfg-temp");
    const tempVal     = overlay.querySelector("#cfg-temp-val");
    const tokensSlider = overlay.querySelector("#cfg-tokens");
    const tokensVal   = overlay.querySelector("#cfg-tokens-val");
    const statusBadge = overlay.querySelector("#cfg-status");
    const btnReset    = overlay.querySelector("#cfg-reset");
    const btnTest     = overlay.querySelector("#cfg-test");
    const btnSave     = overlay.querySelector("#cfg-save");
    const btnClose    = overlay.querySelector(".settings-close");

    function populate() {
        const cfg = getConfig();
        urlInput.value        = cfg.ai.bridgeUrl;
        modelInput.value      = cfg.ai.model;
        tempSlider.value      = cfg.ai.temperature;
        tempVal.textContent   = cfg.ai.temperature;
        tokensSlider.value    = cfg.ai.maxTokens;
        tokensVal.textContent = cfg.ai.maxTokens;
        statusBadge.textContent = "—";
        statusBadge.className = "cfg-badge";
    }

    tempSlider.addEventListener("input", () => { tempVal.textContent = tempSlider.value; });
    tokensSlider.addEventListener("input", () => { tokensVal.textContent = tokensSlider.value; });

    btnClose.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);

    btnReset.addEventListener("click", () => {
        resetConfig();
        populate();
        btnReset.textContent = "✓ Direset!";
        window.setTimeout(() => { btnReset.textContent = "Reset Default"; }, 1500);
    });

    btnTest.addEventListener("click", async () => {
        const base = urlInput.value.trim().replace(/\/$/, "");
        const endpoint = `${base}/chat/completions`;
        btnTest.disabled = true;
        btnTest.textContent = "Mengecek…";
        statusBadge.textContent = "…";
        statusBadge.className = "cfg-badge";
        try {
            const ctrl = new AbortController();
            window.setTimeout(() => ctrl.abort(), 5000);
            const res = await fetch(endpoint, {
                method: "POST",
                signal: ctrl.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: modelInput.value.trim() || "tika-model",
                    messages: [{ role: "user", content: "ping" }],
                    max_tokens: 1,
                }),
            });
            if (res.ok || res.status === 400) {
                // 400 = bridge menerima request tapi format mungkin kurang
                statusBadge.textContent = "✓ Online";
                statusBadge.className = "cfg-badge cfg-ok";
            } else {
                statusBadge.textContent = `⚠ HTTP ${res.status}`;
                statusBadge.className = "cfg-badge cfg-warn";
            }
        } catch {
            statusBadge.textContent = "✕ Offline";
            statusBadge.className = "cfg-badge cfg-err";
        }
        btnTest.disabled = false;
        btnTest.textContent = "Tes Koneksi";
    });

    btnSave.addEventListener("click", () => {
        saveConfig({
            ai: {
                bridgeUrl:   urlInput.value.trim() || DEFAULTS.ai.bridgeUrl,
                model:       modelInput.value.trim() || DEFAULTS.ai.model,
                temperature: parseFloat(tempSlider.value),
                maxTokens:   parseInt(tokensSlider.value, 10),
            },
        });
        btnSave.textContent = "✓ Tersimpan!";
        window.setTimeout(() => { btnSave.textContent = "Simpan"; }, 1500);
        if (typeof onSaved === "function") onSaved(getConfig());
    });

    function close() {
        overlay.classList.add("settings-closing");
        overlay.addEventListener("animationend", () => overlay.remove(), { once: true });
        document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
        if (e.key === "Escape") close();
    }

    populate();
    document.body.append(overlay);

    // Trigger open animation
    requestAnimationFrame(() => overlay.classList.add("settings-open"));
}

/* ─── Main UI ────────────────────────────────────────────────────────────── */

export function createUI(mount) {
    const shell = document.createElement("section");
    shell.className = "tika-shell is-loading";
    shell.innerHTML = `
    <div class="avatar-stage" aria-label="Orb holografik TIKA CORE" hidden>
      <div class="avatar-canvas" aria-hidden="true"></div>
      <div class="presence-pill"><span class="presence-dot"></span><span class="presence-label">Menyiapkan TIKA…</span></div>
      <div class="avatar-bubble" aria-live="polite">Halo! Saya TIKA AI.</div>
      <div class="core-label" aria-hidden="true">
        <strong>TIKA</strong><span>AI CORE · HARKAT NEGERI</span>
      </div>
      <div class="sound-waves" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    </div>
    <section class="chat-zone" aria-label="Percakapan dengan TIKA" hidden>
      <div class="chat-scroll" aria-live="polite"></div>
      <div class="suggestion-row" aria-label="Pertanyaan cepat"></div>
      <form class="composer">
        <button class="icon-btn sound-btn" type="button" aria-label="Nonaktifkan suara" aria-pressed="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Zm12.5-2.5a6 6 0 0 1 0 9M15 10a3 3 0 0 1 0 4"/></svg>
        </button>
        <button class="icon-btn mic-btn" type="button" aria-label="Bicara lewat mikrofon" title="Bicara (Mikrofon)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/></svg>
        </button>
        <label class="message-field">
          <span class="sr-only">Tulis pesan</span>
          <input type="text" maxlength="180" autocomplete="off" placeholder="Tanya TIKA… (ketik /atur untuk pengaturan)" disabled>
        </label>
        <button class="send-btn" type="submit" aria-label="Kirim pesan" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Zm3.5 7H17L7 6.3 8.5 11Zm0 2L7 17.7 17 13H7.5Z"/></svg>
        </button>
      </form>
    </section>
    <div class="start-overlay">
      <div class="start-copy">
        <img src="/logo_harkat.png" class="harkat-logo-large" alt="Logo Universitas Harkat Negeri" />
        <p class="eyebrow">UNIVERSITAS HARKAT NEGERI</p>
        <h1>TIKA CORE</h1>
        <p class="start-prompt">Mengaktifkan core…</p>
        <button class="start-btn" type="button" disabled>Aktifkan TIKA</button>
      </div>
    </div>
  `;
    mount.replaceChildren(shell);

    const stage        = shell.querySelector(".avatar-stage");
    const chatZone     = shell.querySelector(".chat-zone");
    const canvasMount  = shell.querySelector(".avatar-canvas");
    const overlay      = shell.querySelector(".start-overlay");
    const startButton  = shell.querySelector(".start-btn");
    const startPrompt  = shell.querySelector(".start-prompt");
    const input        = shell.querySelector("input");
    const sendButton   = shell.querySelector(".send-btn");
    const soundButton  = shell.querySelector(".sound-btn");
    const micButton    = shell.querySelector(".mic-btn");
    const composer     = shell.querySelector(".composer");
    const suggestions  = shell.querySelector(".suggestion-row");
    const chatScroll   = shell.querySelector(".chat-scroll");
    const avatarBubble = shell.querySelector(".avatar-bubble");
    const presenceLabel = shell.querySelector(".presence-label");

    // Detect /atur command on real-time keyup so it intercepts before submit
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim() === "/atur") {
            e.preventDefault();
            input.value = "";
            createSettingsModal();
        }
    });

    return {
        shell,
        stage,
        canvasMount,
        onStart(handler) {
            startButton.addEventListener("click", handler);
        },
        onSubmit(handler) {
            composer.addEventListener("submit", (event) => {
                event.preventDefault();
                const value = input.value.trim();
                if (!value) return;
                // Intersep perintah /atur
                if (value === "/atur") {
                    input.value = "";
                    createSettingsModal();
                    return;
                }
                input.value = "";
                handler(value);
            });
        },
        onSoundToggle(handler) {
            soundButton.addEventListener("click", handler);
        },
        onMicClick(handler) {
            micButton.addEventListener("click", handler);
        },
        setListening(listening) {
            micButton.classList.toggle("is-listening", listening);
        },
        setInputValue(text) {
            input.value = text;
        },
        showReady(backgroundUrl) {
            stage.style.backgroundImage = `linear-gradient(180deg, rgba(9,9,11,0.04), rgba(9,9,11,0.22)), url("${backgroundUrl}")`;
            stage.hidden = false;
            chatZone.hidden = false;
            shell.classList.remove("is-loading");
            startPrompt.textContent = "Core online. Aku siap mendengarkan.";
            startButton.disabled = false;
            presenceLabel.textContent = "Core online";
        },
        showError() {
            startPrompt.textContent = "Core belum berhasil dimuat.";
            startButton.textContent = "Coba lagi";
            startButton.disabled = false;
        },
        enterConversation() {
            overlay.hidden = true;
            input.disabled = false;
            sendButton.disabled = false;
            micButton.disabled = false;
            window.setTimeout(() => input.focus({ preventScroll: true }), 120);
        },
        setBusy(busy) {
            input.disabled = busy;
            sendButton.disabled = busy;
            composer.classList.toggle("is-busy", busy);
        },
        addMessage(role, text) {
            const row = document.createElement("div");
            row.className = `message-row ${role}`;
            const bubble = document.createElement("div");
            bubble.className = "message-bubble";
            bubble.textContent = text;
            row.append(bubble);
            chatScroll.append(row);
            while (chatScroll.children.length > 6) chatScroll.firstElementChild.remove();
            requestAnimationFrame(() => chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: "smooth" }));
        },
        setSuggestions(items, handler) {
            suggestions.replaceChildren();
            items.slice(0, 3).forEach((text) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "suggestion-chip";
                button.textContent = text;
                button.addEventListener("click", () => handler(text), { once: true });
                suggestions.append(button);
            });
        },
        setAvatarLine(text) {
            avatarBubble.textContent = text;
        },
        setStatus(text, active = false) {
            presenceLabel.textContent = text;
            shell.classList.toggle("is-speaking", active);
        },
        setSoundEnabled(enabled) {
            soundButton.setAttribute("aria-pressed", String(enabled));
            soundButton.setAttribute("aria-label", enabled ? "Nonaktifkan suara" : "Aktifkan suara");
            soundButton.classList.toggle("is-muted", !enabled);
        },
        destroy() {
            mount.replaceChildren();
        },
    };
}
