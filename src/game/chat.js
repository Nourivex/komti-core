import { CONFIG, getAiBridgeEndpoint } from "../config.js";

export const HARKAT_KNOWLEDGE = `
[INFORMASI RESMI UNIVERSITAS HARKAT NEGERI]
Nama Perguruan Tinggi: Universitas Harkat Negeri (Hasil penyatuan Poltek Harber & STMIK YMI Tegal).
Slogan/Visi Utama: "Membentuk lulusan unggul berkarakter kepemimpinan yang dapat memberikan dampak nyata bagi masyarakat." / "Rumah Pembelajar Berdaya dengan ekosistem terhubung untuk mengangkat harkat negeri melalui kontribusi nyata."

Lokasi Kampus:
1. Kampus Mataram: Jl. Mataram No.9, Pesurungan Lor, Kec. Margadana, Kota Tegal, Jawa Tengah 52147
2. Kampus Pendidikan: Jl. Pendidikan No.1, Pesurungan Lor, Kec. Margadana, Kota Tegal, Jawa Tengah 52142
3. Kampus Kalisoga: Desa Slatri, Kabupaten Brebes, Jawa Tengah 52262

Kontak & Layanan:
- Hotline Konseling: +62 877-2211-2002
- Website Utama: https://harkatnegeri.ac.id
- Portal PMB: https://pmb.harkatnegeri.ac.id/
- SIAKAD: https://siakad.harkatnegeri.ac.id/
- SISKERMA: https://siskerma.harkatnegeri.ac.id/

Layanan Daring: E-Learning/LMS, E-Library, Tracer Study, Layanan Konseling, UKM.
`;

const QUICK_PROMPTS = [
    "Tentang Harkat Negeri",
    "Lokasi Kampus",
    "Pendaftaran PMB",
];

function includesAny(text, words) {
    return words.some((word) => text.includes(word));
}

export function getInitialSuggestions() {
    return QUICK_PROMPTS;
}

export async function fetchAiBridgeReply(userMessage) {
    const endpoint = getAiBridgeEndpoint();

    const systemPrompt = `Kamu adalah ${CONFIG.persona.name}, AI Assistant resmi ${CONFIG.persona.institution}.
Gunakan pengetahuan dasar berikut untuk menjawab pertanyaan pengguna dengan sopan, ramah, dan akurat:
${HARKAT_KNOWLEDGE}

Prinsip Jawaban:
1. Jika ditanya tentang Universitas Harkat Negeri, sejarah, kampus, alamat, atau PMB, utamakan data dari fakta resmi di atas.
2. Jawab secara singkat, ramah, dan profesional. Jangan memberikan informasi palsu.
3. Selalu bersikap membantu mahasiswa dan calon mahasiswa.`;

    const controller = new AbortController();
    const timerId = window.setTimeout(() => controller.abort(), CONFIG.ai.timeoutMs);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model: CONFIG.ai.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: CONFIG.ai.temperature,
                max_tokens: CONFIG.ai.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`9router HTTP ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.choices?.[0]?.message?.content || data.reply || data.text;

        if (!replyText) {
            throw new Error("Format respon 9router tidak valid");
        }

        return {
            text: replyText,
            mood: "bright",
            suggestions: ["Alamat Kampus", "Program PMB", "Fasilitas Kampus"],
        };
    } catch (err) {
        if (err.name !== "AbortError") {
            console.warn(`[TIKA] 9router (${endpoint}) tidak dapat dijangkau, fallback ke basis pengetahuan lokal.`, err.message);
        }
        return null;
    } finally {
        window.clearTimeout(timerId);
    }
}

export function createFallbackReply(input) {
    const original = input.trim();
    const text = original.toLocaleLowerCase("id-ID");

    if (includesAny(text, ["harkat", "universitas", "kampus", "tentang"])) {
        return {
            text: "Universitas Harkat Negeri adalah perguruan tinggi terapan hasil penyatuan Poltek Harber & STMIK YMI Tegal yang membentuk lulusan unggul berkarakter kepemimpinan.",
            mood: "bright",
            suggestions: ["Lokasi Kampus", "Kontak PMB", "SIAKAD"],
        };
    }

    if (includesAny(text, ["alamat", "lokasi", "mataram", "pendidikan", "brebes", "tegal"])) {
        return {
            text: "Universitas Harkat Negeri memiliki 3 Kampus: Kampus Mataram (Kota Tegal), Kampus Pendidikan (Kota Tegal), dan Kampus Kalisoga (Kab. Brebes).",
            mood: "bright",
            suggestions: ["Kontak Telepon", "Pendaftaran PMB", "Visi Misi"],
        };
    }

    if (includesAny(text, ["pmb", "daftar", "pendaftaran", "mahasiswa baru"])) {
        return {
            text: "Penerimaan Mahasiswa Baru (PMB) dapat diakses secara online melalui portal resmi https://pmb.harkatnegeri.ac.id/.",
            mood: "bright",
            suggestions: ["Alamat Kampus", "Hotline Konseling", "Siapa kamu?"],
        };
    }

    if (includesAny(text, ["kontak", "telepon", "phone", "wa", "konseling"])) {
        return {
            text: "Hubungi Hotline Konseling & Layanan Informasi kami di +62 877-2211-2002.",
            mood: "bright",
            suggestions: ["Lokasi Kampus", "Portal PMB", "Website Utama"],
        };
    }

    if (includesAny(text, ["halo", "hai", "hello", "pagi", "siang", "malam"])) {
        return {
            text: "Halo! Saya TIKA, AI Assistant Universitas Harkat Negeri. Ada yang bisa saya bantu hari ini?",
            mood: "bright",
            suggestions: ["Tentang Harkat Negeri", "Lokasi Kampus", "Pendaftaran PMB"],
        };
    }

    if (includesAny(text, ["siapa kamu", "namamu", "nama kamu", "tika"])) {
        return {
            text: "Aku TIKA, asisten kecerdasan buatan dari Universitas Harkat Negeri yang siap membantumu memberikan informasi seputar kampus.",
            mood: "bright",
            suggestions: ["Tentang Harkat Negeri", "Lokasi Kampus", "Pendaftaran PMB"],
        };
    }

    return {
        text: `Terima kasih! Mengenai "${original.slice(0, 40)}", kamu juga bisa mengunjungi website resmi kami di https://harkatnegeri.ac.id. Ada informasi lain yang ingin ditanyakan?`,
        mood: "soft",
        suggestions: ["Lokasi Kampus", "Informasi PMB", "Kontak Telepon"],
    };
}

export async function createReply(input) {
    // 1. Coba 9router AI Bridge (lihat src/config.js untuk URL & pengaturan)
    const aiBridgeResult = await fetchAiBridgeReply(input);
    if (aiBridgeResult) {
        return aiBridgeResult;
    }

    // 2. Fallback basis pengetahuan lokal Harkat Negeri
    return createFallbackReply(input);
}
