
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateObjectives = async (title: string): Promise<string> => {
  if (!title) return "Sila isi tajuk program terlebih dahulu.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai guru SSEMJ. Berikan 3 objektif program yang sangat ringkas, profesional dan padat dalam Bahasa Melayu untuk: "${title}". 
      PENTING: 
      1. Hadkan kandungan di bawah 500 aksara.
      2. Jangan berikan sebarang ayat pengenalan atau penutup. 
      3. Terus berikan hasil dalam bentuk senarai bernombor:
      1) [Objektif 1]
      2) [Objektif 2]
      3) [Objektif 3]`,
    });
    return response.text?.trim() || "Gagal menjana idea.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ralat semasa menjana idea AI.";
  }
};

export const generateSummary = async (title: string): Promise<string> => {
  if (!title) return "Sila isi tajuk program terlebih dahulu.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Bertindak sebagai guru SSEMJ. Berikan 3 rumusan dan impak positif yang sangat ringkas bagi: "${title}". 
      PENTING: 
      1. Hadkan kandungan di bawah 500 aksara.
      2. Jangan berikan sebarang ayat pengenalan atau penutup. 
      3. Terus berikan hasil dalam bentuk senarai bernombor:
      1) [Impak 1]
      2) [Impak 2]
      3) [Impak 3]`,
    });
    return response.text?.trim() || "Gagal menjana idea.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ralat semasa menjana idea AI.";
  }
};
