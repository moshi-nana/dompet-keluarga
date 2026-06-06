const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function geminiJSON(prompt, systemInstruction = '') {
  const res = await fetch(`${BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      ...(systemInstruction && {
        systemInstruction: { parts: [{ text: systemInstruction }] }
      }),
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  })
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(text)
}

export async function geminiVision(base64Image, prompt) {
  const res = await fetch(`${BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  })
  if (!res.ok) throw new Error(`Gemini vision error: ${res.status}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return JSON.parse(text)
}
