import {HumanMessage} from '@langchain/core/messages';
import {ChatGoogleGenerativeAI} from '@langchain/google-genai';
import {HarmBlockThreshold, HarmCategory} from '@google/generative-ai';

import MarkdownIt from 'markdown-it';

import './style.css';

// 🔥 SET `GOOGLE_API_KEY` IN YOUR .env FILE! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥

const form = document.querySelector('form');
const inputText = document.getElementById('input-text'); // Prendo la textarea

const formal = document.getElementById('formal-button');
const informal = document.getElementById('informal-button'); // Corretto ID
const funny = document.getElementById('scherzoso-button'); // Corretto ID
const affettuoso = document.getElementById('affettuoso-button'); // Corretto ID

const output = document.querySelector('.output');
let promptStyle = '';

const handleButtonClick = (style, textPrefix) => {
  
  promptStyle = style;
  form.requestSubmit(); // Attiva la submit con l'evento onsubmit
};

affettuoso.addEventListener('click', () => {
  handleButtonClick(
    "Scrivi un messaggio  affettuoso e gentile, aggiungendo un pizzico di simpatia come se fosse un messaggio per un membro della famiglia a cui si vuole molto bene, Fornisci solo il messaggio di seguito modificato. ",
    "Gentile utente,"
  );
});

formal.addEventListener('click', () => {
  handleButtonClick(
    "Scrivi un messaggio formale e professionale . Il tono deve essere educato e rispettoso, come in un'e-mail di lavoro.Non aggiungere spiegazioni o introduzioni, fornisci solo il messaggio di seguito modificato. ",
    "Gentile utente,"
  );
});

informal.addEventListener('click', () => {
  handleButtonClick(
    "Scrivi un messaggio informale, come se fosse una chat tra amici. Il tono deve essere spontaneo e amichevole, senza risultare troppo impostato. Non fornire spiegazioni o introduzioni, riscrivi solo il messaggio.",
    "Hey!"
  );
});

funny.addEventListener('click', () => {
  handleButtonClick(
    "Scrivi un messaggio spiritoso e ironico . Puoi usare battute leggere, ma senza esagerare.Non aggiungere spiegazioni o introduzioni, riscrivi solo il messaggio.  ",
    ""
  );
});

// Seleziono l'elemento output e creo il pulsante copia

const copyButton = document.createElement('button');

// Stile e testo del pulsante
copyButton.textContent = 'Copia Testo';
copyButton.style.marginTop = '10px';
copyButton.style.padding = '5px 10px';
copyButton.style.cursor = 'pointer';



// Funzione per copiare il testo
copyButton.addEventListener('click', () => {
  if (output.textContent.trim() !== '') {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = output.textContent;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy'); // Metodo alternativo per copiare
    document.body.removeChild(tempTextArea);

    copyButton.textContent = 'Copiato!';
    setTimeout(() => copyButton.textContent = 'Copia Testo', 2000);
  }
});

// Evento submit per inviare il testo con lo stile scelto
form.onsubmit = async ev => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    const contents = [
      new HumanMessage({
        content: [
          { type: "text", text: promptStyle },
          { type: "text", text: inputText.value },
        ],
      }),
    ];

    const vision = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash',
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const streamRes = await vision.stream(contents);
    const buffer = [];
    const md = new MarkdownIt();

    for await (const chunk of streamRes) {
      buffer.push(chunk.content);
      output.innerHTML = md.render(buffer.join(''));
    }
    output.insertAdjacentElement('afterend', copyButton);
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// You can delete this once you've filled out an API key

