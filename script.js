import { callOpenAIAssistant } from "./openaiService.js";


document.getElementById("applyFilter").addEventListener("click", async () => {
  try {
    const result = await callOpenAIAssistant();
    console.log("Risposta OpenAI:", result);
    // Puoi aggiornare il DOM con i risultati ottenuti
  } catch (error) {
    console.error(error);
  }
});
