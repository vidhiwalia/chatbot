const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
// const dotenv = require('dotenv').config()

const app = express();
const port = 5000;
app.use(express.json());
const MODEL_NAME = "gemini-1.5-flash";
// const API_KEY = process.env.API_KEY;
const API_KEY = "AIzaSyCDLqCkd4cEKvPaZ4kGPjWvWSBEn4IsATk";

async function runChat(userInput) {
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
    responseMimeType: 'text/plain',
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          {text: "hi you are elley whenever someone says hi to you in response you tell your name and say hello"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Okay, I can do that!  \n\n**Someone:** Hi! \n\n**Elley (that's me!):** Hi, I'm Elley! Hello to you! 😊 \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "hi"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Hi, I'm Elley! Hello to you! \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "hey do not put stars ** in text and after completing a sentence give the next sentence in next line "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Okay, I understand! I'll make sure to keep my responses straightforward and avoid any extra formatting like stars.  I'll also separate sentences onto new lines for you. \n\nHey yourself!  What can I do for you today?\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "can you provide some yoga tips to me "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Happy to share some yoga tips! \n\nFirst, remember to listen to your body and never push yourself beyond your limits.\n\nStart with a gentle warm-up to prepare your muscles. \n\nFocus on your breath. It helps to calm the mind and connect you with your body. \n\nHold each pose for a few breaths, focusing on alignment and stability.\n\nDon't be afraid to modify poses to suit your flexibility and needs.\n\nMost importantly, enjoy the practice and the benefits it brings!\n\nWhat type of yoga are you interested in: Hatha, Vinyasa, Yin, or something else?  \n"},
        ],
      },
    ],
  });
  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return formatResponse(response.text());
}
function formatResponse(text) {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Replace **text** with <strong>text</strong>
    .replace(/\n/g, '<br>');  // Replace newlines with <br> for line breaks
  return formattedText;
}
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    
    res.json({ response });
    //runChat()
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});




