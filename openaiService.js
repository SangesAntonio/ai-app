export async function callOpenAIAssistant() {       
  const API_KEY = import.meta.env.VITE_OPENAI_API;
  const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;
  const prompt = document.getElementById("prompt-text").value;
  
  if (!prompt.trim()) {
      alert("Inserisci un prompt valido!");
      return;
  }
  const currentDate = new Date().toISOString().split('T')[0]; // Ottiene la data attuale in formato YYYY-MM-DD
  try {
      // 1️⃣ Creare un nuovo thread
      const threadResponse = await fetch("https://api.openai.com/v1/threads", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2"
          }
      });
  
      const threadData = await threadResponse.json();
      if (!threadData.id) throw new Error("Errore nella creazione del thread.");
      const threadId = threadData.id;
      console.log("Thread creato:", threadId);
  
      // 2️⃣ Aggiungere un messaggio al thread
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2"
          },
          body: JSON.stringify({
              role: "user",
              content: prompt +`. Oggi è ${currentDate}`
          })
      });
  
      const messageData = await messageResponse.json();
      console.log("Messaggio aggiunto:", messageData);
  
      // 3️⃣ Avviare la Run sull'assistente
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2"
          },
          body: JSON.stringify({
              assistant_id: ASSISTANT_ID
          })
      });
  
      const runData = await runResponse.json();
      if (!runData.id) throw new Error("Errore nella creazione della Run.");
      const runId = runData.id;
      console.log("Run avviata:", runId);
  
      // 4️⃣ Polling per verificare lo stato della Run
      let runStatus = "in_progress";
      while (runStatus === "in_progress" || runStatus === "queued") {
          await new Promise(resolve => setTimeout(resolve, 2000));
  
          const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${API_KEY}`,
                  "OpenAI-Beta": "assistants=v2"
              }
          });
  
          const statusData = await statusResponse.json();
          console.log("Stato della Run:", statusData);
          runStatus = statusData.status;
      }
  
      if (runStatus !== "completed") throw new Error("La Run non è stata completata correttamente.");
  
      // 5️⃣ Recuperare il messaggio di risposta
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "OpenAI-Beta": "assistants=v2"
          }
      });
      console.log(messagesResponse);
  
      
      const messagesData = await messagesResponse.json();
      const lastMessage = messagesData.data[messagesData.data.length - 1].content;

     
      console.log("Tutti i messaggi:", messagesData);

      let jsonResponse;

      
        // Se non è una stringa, usalo direttamente
        jsonResponse = lastMessage;
      

      // Supponiamo che "messagesData" sia l'oggetto JSON ricevuto
const assistantMessage = jsonResponse.data;


  // Accedi al primo elemento dell'array "content" e alla sua proprietà "text.value"
  const rawResponse = assistantMessage.content[0].text.value;
  
  // Se il contenuto è una stringa JSON valida, lo puoi parsare
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch (error) {
    console.error("Errore nel parsing del JSON:", error);
    parsedResponse = rawResponse; // o gestisci diversamente l'errore
  }
  
  console.log("Risposta dell'assistente:", parsedResponse);
  // Ora puoi utilizzare parsedResponse come desideri


      console.log("Messaggio parsato:", jsonResponse);
      displayResponse(jsonResponse);
  } catch (error) {
      console.log("Errore nella richiesta:", error);
      alert("Si è verificato un errore!");
  }
  }
  
  
  function displayResponse(data) {
      const resultDiv = document.getElementById("response-container");
      console.log(data)
      /*resultDiv.innerHTML = `
          <p><strong>Data Inizio:</strong> ${data.data_inizio}</p>
          <p><strong>Data Fine:</strong> ${data.data_fine}</p>
          <p><strong>Magnitudo:</strong> ${data.magnitudo}</p>
          <p><strong>Profondità:</strong> ${data.profondita} km</p>
          <p><strong>Magnitudo Massima Richiesta:</strong> ${data.magnitudo_massima_richiesta ? 'Sì' : 'No'}</p>
      `;*/
  }