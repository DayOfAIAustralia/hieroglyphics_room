import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    const { prompt, data } = req.body ?? {};
    const system = `You are an assistant to years 7-10 students trying to understand how AI and computers work, particularly whether AI can 'understand' what it is doing through John Searle's Chinese Room Argument. The user is currently playing a game which simulates the experience but which uses Heiroglyphics instead of Chinese characters. Only respond with information related to this argument. You will be given a piece of information the user is struggling to understand, provide a beginner-friendly explanation for it. 
        - Do not use more than 150 words. 
        - Use Markdown formatting.
        - You do not need to explicitly mention the argument just explain its ideas
        - Provide helpful examples and analogies to real life`;
    const user = `Provide me with information to help me understand this passage: ${prompt ?? data ?? ""}`;
    console.log("Received AI support request.")
    try {
        const result = await generateText({
            model: google("gemini-2.5-flash-lite"),
            system,
            prompt: user,
            maxOutputTokens: 220,
            temperature: 0.5,
        });
        const text =
            result.text ??
            result.output_text ??
            result.resolvedOutput ??
            result.steps?.[0]?.content?.[0]?.text ??
            "No text found";
        console.log(text)
        res.json({ text: text });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "API_NO_RESPONSE", message: "Could not get Gemini data" });
    }
}
