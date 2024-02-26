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

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello guys... this is Surya.",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // Specify the model name and the API key
    const MODEL_NAME = "gemini-1.0-pro";
    const API_KEY = process.env.API_KEY;

    // Create an instance of the Google Generative AI class
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Get the generative model object
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Define the generation config
    const generationConfig = {
      temperature: 0, // Higher values means the model will take more risks.
      topK: 1, // alternative to sampling with temperature, called nucleus sampling
      topP: 1, // alternative to sampling with temperature, called nucleus sampling
      maxOutputTokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
    };

    // Define the safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    // Create a chat object
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    // Send and receive messages from the generative model
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    // Send the response text to the client
    res.status(200).send({
      bot: response.text(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});

app.listen(5000, () => console.log("AI server started on http://localhost:5000"));
