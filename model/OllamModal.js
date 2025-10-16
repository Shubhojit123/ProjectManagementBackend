const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

exports.ollamaChatModal = async ({ context = {}, userPrompt = "", role = "User" }) => {
  try {
    console.log(context)
    const systemMessage = {
      role: "system",
      content: `just give answer from the data`
    };

    const userMessage = {
      role: "user",
      content: `Question: ${userPrompt}
Context: ${context}
Role: ${role}
Answer in a normal, readable text format, like a formal response dont add extra words and keep the asnwer consized
 dont give answer if the query is not related to the data you have .`
    };

    const completion = await openai.chat.completions.create({
      model: "llama3.2:latest",
      messages: [systemMessage, userMessage],
      temperature: 0.1
    });

    const result = completion.choices[0].message.content.trim();

    const formattedResult = result.replace(/\\n/g, "\n");
    return { result: formattedResult };


  } catch (error) {
    return {
      result: `Sorry, an error occurred while processing your request: ${error.message}`
    };
  }
};
