import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to handle missing key errors gracefully
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no configurado en settings o variables de entorno.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. SUGGEST OPTIONS ENDPOINT
// Help users brainstorm options for their decision prompt
app.post("/api/suggest-options", async (req, res) => {
  try {
    const { decision } = req.body;
    if (!decision || typeof decision !== "string") {
      res.status(400).json({ error: "La decisión es requerida." });
      return;
    }

    const ai = getAiClient();
    const prompt = `Analiza la siguiente decisión planteada por el usuario e identifica de 2 a 4 opciones o alternativas lógicas y comunes para comparar.
Decisión del usuario: "${decision}"

Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura:
{
  "options": [
    {
      "name": "Nombre corto y claro de la opción (máx 3 palabras)",
      "description": "Una breve descripción de en qué consiste esta opción (máx 20 palabras)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["name", "description"],
              },
            },
          },
          required: ["options"],
        },
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/suggest-options:", error);
    res.status(500).json({ error: error.message || "Error al sugerir opciones con el modelo." });
  }
});

// 2. ANALYZE DECISION ENDPOINT
// Main pipeline: generates analysis (pros/cons with impact, FODA matrix, comparison fields, and score)
app.post("/api/analyze-decision", async (req, res) => {
  try {
    const { decision, options } = req.body;
    if (!decision || typeof decision !== "string") {
      res.status(400).json({ error: "La decisión es requerida." });
      return;
    }
    if (!options || !Array.isArray(options) || options.length < 2) {
      res.status(400).json({ error: "Se requieren al menos 2 opciones para comparar y desempatar." });
      return;
    }

    const ai = getAiClient();
    const formattedOptions = options.map((opt, idx) => `ID: opt_${idx + 1}\nNombre: ${opt.name}\nDescripción: ${opt.description || 'Sin descripción'}`).join("\n\n");

    const systemInstruction = `Eres "El Desempate", un psicólogo y asesor experto en toma de decisiones estratégicas. Tu objetivo es desglosar de manera analítica, objetiva e inteligente las opciones presentadas para una decisión particular.
Para CADA opción, debes generar:
1. Pros y Contras específicos, dándoles un impacto ('high', 'medium', 'low') según su relevancia real en el contexto de la decisión.
2. Un análisis FODA (Fuerzas, Oportunidades, Debilidades, Amenazas / SWOT) interactivo, completo e inspirador. Cada sección de FODA debe tener de 2 a 3 puntos con un título claro y descripción detallada de apoyo.
3. Un puntaje de conveniencia global del 1 al 10 con una clara justificación racional.

También debes crear una "Matriz de Comparación" que evalúe todas las opciones lado a lado bajo 3 o 4 atributos clave de decisión (e.g. Costo, Riesgo, Esfuerzo, Beneficios a largo plazo, etc.). Para cada atributo, asigna un texto resumen y una calificación sintética ('good', 'neutral', 'bad') para cada una de las opciones propuestas de acuerdo con su ID ('opt_1', 'opt_2', etc.).

Finalmente, da una recomendación sincera e imparcial con la opción ganadora ("recommendedOptionName"), una explicación detallada de por qué y los siguientes pasos recomendados. No uses modismos regionales exagerados, sé empático y profesional en español.`;

    const contents = `Tengo que tomar una decisión importante: "${decision}".
Las opciones viables que tengo identificadas son las siguientes:

${formattedOptions}

Realiza el desglose comparativo completo, la matriz de comparación y genera el análisis FODA e indicador de pros y contras para desequilibrar la balanza de manera estratégica.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "El ID asignado de la opción, ej: opt_1, opt_2..." },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  score: { type: Type.INTEGER, description: "Puntaje de conveniencia general de 1 a 10" },
                  scoreExplanation: { type: Type.STRING, description: "Justificación resumida de este puntaje" },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        impact: { type: Type.STRING, description: "Valor permitido: 'high', 'medium' o 'low'" },
                      },
                      required: ["id", "title", "description", "impact"],
                    },
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        impact: { type: Type.STRING, description: "Valor permitido: 'high', 'medium' o 'low'" },
                      },
                      required: ["id", "title", "description", "impact"],
                    },
                  },
                  foda: {
                    type: Type.OBJECT,
                    properties: {
                      fortalezas: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["id", "title", "description"],
                        },
                      },
                      oportunidades: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["id", "title", "description"],
                        },
                      },
                      debilidades: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["id", "title", "description"],
                        },
                      },
                      amenazas: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ["id", "title", "description"],
                        },
                      },
                    },
                    required: ["fortalezas", "oportunidades", "debilidades", "amenazas"],
                  },
                },
                required: ["id", "name", "description", "score", "scoreExplanation", "pros", "cons", "foda"],
              },
            },
            comparisonMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  attribute: { type: Type.STRING, description: "Nombre del aspecto o atributo, por ejemplo: Costo, Viabilidad técnica..." },
                  description: { type: Type.STRING, description: "Descripción breve del atributo en este contexto" },
                  optionValuesMap: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        optionId: { type: Type.STRING, description: "ID de la opción evaluada, ej: opt_1" },
                        text: { type: Type.STRING, description: "Resumen breve de esta opción para este atributo" },
                        rating: { type: Type.STRING, description: "Valor permitido: 'good', 'neutral' o 'bad'" },
                      },
                      required: ["optionId", "text", "rating"],
                    },
                  },
                },
                required: ["attribute", "description", "optionValuesMap"],
              },
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                recommendedOptionName: { type: Type.STRING },
                explanation: { type: Type.STRING },
                nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["recommendedOptionName", "explanation", "nextSteps"],
            },
          },
          required: ["decision", "options", "comparisonMatrix", "recommendation"],
        },
      },
    });

    const text = response.text || "{}";
    const rawData = JSON.parse(text);

    // Map the comparisonMatrix's optionValuesMap array into a dynamic key-value dictionary to match ComparisonRow type
    const mappedRows = rawData.comparisonMatrix.map((row: any) => {
      const optionValues: { [key: string]: { text: string; rating: 'good' | 'neutral' | 'bad' } } = {};
      row.optionValuesMap.forEach((val: any) => {
        optionValues[val.optionId] = {
          text: val.text,
          rating: (val.rating === 'good' || val.rating === 'neutral' || val.rating === 'bad') ? val.rating : 'neutral'
        };
      });

      return {
        attribute: row.attribute,
        description: row.description,
        optionValues
      };
    });

    const finalResult = {
      decision: rawData.decision,
      options: rawData.options,
      comparisonMatrix: mappedRows,
      recommendation: rawData.recommendation
    };

    res.json(finalResult);
  } catch (error: any) {
    console.error("Error in /api/analyze-decision:", error);
    res.status(500).json({ error: error.message || "Error al generar el análisis comparativo." });
  }
});

// 3. SET UP VITE AND SERVER LISTENERS
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
