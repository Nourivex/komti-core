/**
 * src/config.js — Konfigurasi terpusat TIKA CORE.
 *
 * Nilai default ada di DEFAULTS. Pengguna bisa override via modal /atur
 * (disimpan di localStorage). Gunakan getConfig() di mana saja untuk
 * membaca konfigurasi aktif yang sudah di-merge.
 */

const STORAGE_KEY = "tika_core_settings";

/** Nilai bawaan — digunakan jika user belum pernah mengubah pengaturan */
export const DEFAULTS = {
    ai: {
        bridgeUrl:   "http://localhost:20128/v1",
        chatPath:    "/chat/completions",
        model:       "tika-model",
        temperature: 0.7,
        maxTokens:   500,
        timeoutMs:   15_000,
    },
    persona: {
        name:        "TIKA",
        institution: "Universitas Harkat Negeri",
        greeting:    "Halo! TIKA CORE online — Asisten resmi Universitas Harkat Negeri. Ada yang bisa saya bantu?",
    },
};

/**
 * Membaca konfigurasi aktif (default di-merge dengan override dari localStorage).
 * @returns {{ ai: typeof DEFAULTS.ai, persona: typeof DEFAULTS.persona }}
 */
export function getConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULTS);
        const saved = JSON.parse(raw);
        return {
            ai: { ...DEFAULTS.ai, ...saved.ai },
            persona: { ...DEFAULTS.persona, ...saved.persona },
        };
    } catch {
        return structuredClone(DEFAULTS);
    }
}

/**
 * Menyimpan override ke localStorage.
 * @param {{ ai?: Partial<typeof DEFAULTS.ai> }} patch
 */
export function saveConfig(patch) {
    try {
        const current = getConfig();
        const merged = {
            ai: { ...current.ai, ...patch.ai },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
        // localStorage mungkin dinonaktifkan
    }
}

/** Reset ke default — hapus semua override dari localStorage */
export function resetConfig() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
}

/**
 * Mengembalikan URL penuh endpoint chat completions 9router.
 * Selalu baca getConfig() agar langsung refleksikan perubahan dari modal /atur.
 */
export function getAiBridgeEndpoint() {
    const { ai } = getConfig();
    const base = ai.bridgeUrl.replace(/\/$/, "");
    return `${base}${ai.chatPath}`;
}

// Alias untuk backward-compatibility dengan kode lama yang membaca CONFIG.ai.*
export const CONFIG = DEFAULTS;
