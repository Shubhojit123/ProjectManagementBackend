const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.GOOGLE_API_KEY,
});

exports.DeepchatModal  = async function ({ context = {}, userPrompt = "please give me reliable and chatbot-like response", role = "User" }) {
  try {
    const systemMessage = {
      role: "system",
content: `You are a role-based task manager assistant.
- Always respond in a chatbot-friendly conversational format.
- Do not include explanations, code blocks, or markdown.
- Never reveal sensitive information (emails, passwords, internal IDs) unless the user's role permits it.
- Respect privacy and role-based permissions at all times.
- Provide clear, concise, and actionable responses based on the user's role and context.`
    };

    const userMessage = {
      role: "user",
      content: `${userPrompt}\nContext: ${JSON.stringify(context)}\nRole: ${role}`
    };

    const completion = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [systemMessage, userMessage]
    });

    let result = completion.choices[0].message.content.trim();

    const firstBrace = result.indexOf("{");
    const lastBrace = result.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON found in AI response");
    }
    const jsonString = result.slice(firstBrace, lastBrace + 1);

    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error in chatModal:", error.response?.data || error.message);
    throw error;
  }
};
