
import { GoogleGenAI } from "@google/genai";
import { SocialFormat, ResizeRequest } from "../types";
import { FORMAT_DETAILS } from "../constants";

export const processImage = async (request: ResizeRequest): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const formatInfo = FORMAT_DETAILS[request.format];
  const targetRatio = request.format === SocialFormat.CUSTOM 
    ? `${request.customWidth}:${request.customHeight}` 
    : formatInfo.ratio;

  const prompt = `
    You are a professional image editor. 
    Task: Resize and adjust this image for a ${formatInfo.label} with an aspect ratio of ${targetRatio}.
    Instructions:
    1. If the image doesn't fit the aspect ratio, use "outpainting" to intelligently fill the background and extend the scene to maintain a natural look.
    2. Do not just stretch or squash the image. 
    3. Ensure the main subject of the image remains centered and clear.
    4. Maintain the original style, lighting, and textures in the extended areas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: request.image.split(',')[1], // Remove prefix data:image/png;base64,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: targetRatio as any,
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("Nenhuma imagem foi gerada pela IA.");
    }

    return imageUrl;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
