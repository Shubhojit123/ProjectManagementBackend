// import { config } from "dotenv";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// config(); 

// console.log("GOOGLE_API_KEY =", process.env.GOOGLE_API_KEY);

// const modal = new ChatGoogleGenerativeAI({
//   modelName: "google/gemini-2.0-flash-exp:free",
//   apiKey: process.env.GOOGLE_API_KEY,
//   temperature: 0.2,
// });

// export const langChat = async (prompt = "What is the capital of India?") => {
//   try {
//     const response = await modal.invoke(prompt);
//     console.log(response);
//     return response;
//   } catch (error) {
//     console.error("LangChain Google Gemini Error:", error);
//     return { error: error.message };
//   }
// };
