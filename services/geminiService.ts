import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssistantResponse, AnalysisOption } from "../types";

const SYSTEM_INSTRUCTION = `
# ROL
Sen "Akademik Asistan Pro" adında, üst düzey bir akademik editör ve içerik üreticisisin. İki temel modun var:

1. **İÇERİK ÜRETİMİ (DRAFTING):** Verilen bir konu hakkında sıfırdan, APA 7 standartlarına uygun, akademik dille yazılmış, yapılandırılmış (Giriş, Gelişme, Sonuç) bir makale taslağı oluşturursun. Bu modda analiz raporu boş olabilir.

2. **METİN ANALİZİ (EDITING):** Mevcut bir metni alır ve seçilen "Ajanlar" (Kriterler) doğrultusunda analiz edip yeniden yazarsın.

# AJAN YETENEKLERİ (Sadece Analiz Modunda Aktif)
- **Resmi Dil Ajanı:** Pasif ses, nesnellik ve akademik ton kontrolü.
- **Sözcük Ekonomisi Ajanı:** Gereksiz kelimelerin temizlenmesi.
- **Akış Kontrol Ajanı:** Bağlaçlar ve mantıksal geçişler.
- **APA 7 Ajanı:** Kaynakça ve atıf kontrolü.

# ÇIKTI FORMATI (JSON ZORUNLULUĞU)
Her zaman SADECE aşağıdaki JSON formatını döndür:

{
  "generated_text": "Üretilen veya düzenlenen metnin son hali buraya.",
  "analysis": [
    {
      "type": "Hata Tipi (Örn: APA Eksikliği)",
      "issue": "Kısa Hata Tanımı",
      "original": "Hatalı Orijinal Parça",
      "suggestion": "Öneri/Düzeltme",
      "location": "Konum"
    }
  ]
}
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    generated_text: { type: Type.STRING },
    analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          issue: { type: Type.STRING },
          original: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          location: { type: Type.STRING },
        },
        required: ["type", "issue", "original", "suggestion", "location"],
      },
    },
  },
  required: ["generated_text", "analysis"],
};

export const processRequest = async (
  input: string,
  mode: 'DRAFTING' | 'ANALYSIS',
  selectedAgents: AnalysisOption[]
): Promise<AssistantResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı.");
    }

    const ai = new GoogleGenAI({ apiKey });

    let userPrompt = "";
    
    if (mode === 'DRAFTING') {
      // Üretim Modu: Sadece konuya odaklan, analiz ajanlarını zorunlu tutma.
      userPrompt = `GÖREV: İÇERİK ÜRETİMİ (DRAFTING)
      
      KONU: ${input}
      
      TALİMAT: Yukarıdaki konu hakkında akademik literatüre uygun, nesnel ve profesyonel bir makale taslağı yaz. Başlıklar kullan. generated_text alanına metni yaz. Analiz dizisini boş bırakabilirsin.`;
    } else {
      // Analiz Modu: Seçilen ajanları devreye sok.
      const activeAgents = selectedAgents.filter(a => a.selected).map(a => a.label).join(", ");
      
      userPrompt = `GÖREV: METİN ANALİZİ VE DÜZENLEME (EDITING)
      
      METİN: ${input}
      
      AKTİF AJANLAR: ${activeAgents || "Tüm Standart Kontroller"}
      
      TALİMAT: Metni yukarıdaki ajanların kriterlerine göre analiz et ve yeniden düzenle. İyileştirilmiş metni 'generated_text' alanına, bulunan hataları 'analysis' dizisine yaz.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.3, 
      },
    });

    if (!response.text) {
      throw new Error("Yapay zeka yanıt oluşturamadı.");
    }

    const result = JSON.parse(response.text) as AssistantResponse;
    return result;

  } catch (error) {
    console.error("Gemini Hatası:", error);
    throw error;
  }
};
