import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import {GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,} from "@google/generative-ai";



dotenv.config()

// const configuration = new Configuration({
//   apiKey: process.env.AI_API_Key,
// });

// const openai = new OpenAIApi(configuration);

// const openai = new OpenAI({
//     apiKey: process.env.API_KEY,
//   });

// node --version # Should be >= 18
// npm install @google/generative-ai


const app = express();
app.use(cors());
app.use(express.json());

// Specify the model name and the API key
const MODEL_NAME = process.env.Model;
const API_KEY = process.env.API_KEY;

// Create an instance of the Google Generative AI class
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the generative model object
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello guys... this is Surya.",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Define the generation config
    const generationConfig = {
      temperature: 0,
      topK: 1,
      topP: 1,
      maxOutputTokens: 3000,
    };

    // Define the safety settings
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    // Create a chat object
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    // Send and receive messages from the generative model
    const result = await chat.sendMessage(process.env.rules + prompt);
    const response = result.response;

    // Send the response text to the client
    res.status(200).send({
      bot: response.text(),
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).send(error.message || "Something went wrong");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AI server started on http://localhost:${PORT}`));
