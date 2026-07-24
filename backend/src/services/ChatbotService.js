require("dotenv").config();
const ProductService = require("./ProductService");

class ChatboatService {

  async chatService(contents) {
    try {
      const { GoogleGenAI } = await import("@google/genai");

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      return response.text;
    } catch (error) {
      console.error("AI Error:", error.message);
      return "⚠️ **API Key Error:** Your Google Cloud project doesn't have access to Gemini API (or the free quota is 0). Please ensure you have enabled the Generative Language API in Google Cloud and linked a billing account if required by your region.";
    }
  }

  async askProductQuestion(productId, userQuestion) {
    try {

      const product = await ProductService.findProductById(productId);

      if (!product) {
        return "Sorry, the product you're asking about does not exist.";
      }

      const firstVariant = product.variants?.[0] || {};
      const firstOffer = firstVariant.offers?.[0] || {};

      const specs =
        firstVariant.specifications instanceof Map
          ? Object.fromEntries(firstVariant.specifications)
          : firstVariant.specifications || {};

      const highlights =
        product.highlights instanceof Map
          ? Object.fromEntries(product.highlights)
          : product.highlights || {};

      const productDetails = `
Product Name: ${product.title || ""}

Description:
${product.description || ""}

Color:
${firstVariant.color || ""}

Selling Price:
₹${firstOffer.sellingPrice || "Not Available"}

MRP:
₹${firstOffer.mrpPrice || "Not Available"}

Stock:
${firstOffer.stock || "Not Available"}

Specifications:
${JSON.stringify(specs, null, 2)}

Highlights:
${JSON.stringify(highlights, null, 2)}
`;


      const { GoogleGenAI } = await import("@google/genai");

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const prompt = `
You are Near Look AI Shopping Assistant.

Rules:
1. Answer ONLY using the product information provided.
2. Never make up specifications, prices, colors, or features.
3. If information is unavailable, reply:
   "This information is not available for this product."
4. Keep answers short and clear.
5. Mention exact values whenever available.

PRODUCT INFORMATION:

${productDetails}

CUSTOMER QUESTION:

${userQuestion}

ANSWER:
`;

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      const answer = response.text;


      return answer;

    } catch (error) {
      console.error("====================================");
      console.error("FULL AI ERROR:");
      console.error(error.message || error);
      console.error("====================================");

      return "⚠️ **API Key Error:** Your Google Cloud project doesn't have access to Gemini API (or the free quota is 0). Please ensure you have enabled the Generative Language API in Google Cloud and linked a billing account if required by your region.";
    }
  }
}

module.exports = new ChatboatService();