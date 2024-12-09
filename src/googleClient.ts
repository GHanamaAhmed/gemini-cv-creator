import { VertexAI } from "@google-cloud/vertexai";
import credentials from "../google-cloud.json";

const vertexai = require("@google-cloud/vertexai");

// Initialize Vertex AI instance
export const vertex_ai = new VertexAI({
  project: credentials.project_id,
  googleAuthOptions: {
    credentials,
  },
});

const model = "gemini-1.5-flash-001";

// Configure the generative model
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    candidateCount: 1,
    maxOutputTokens: 8192,
    temperature: 0, // Ensure deterministic output for structured data
    topP: 1,
    topK: 1,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
});

// Function to generate professional CV content with HTML template
export async function generateCVContentWithTemplate(
  profession: string,
  skills: string[],
  experience: string,
  education: string,
  contact: string
): Promise<string> {
  try {
    // Define the structured prompt for generating CV content
    const prompt = `
      You are a professional CV writer. Your task is to generate a detailed CV for the following profession:
      Profession: ${profession}

      Skills: ${skills.join(", ")}

      Experience: ${experience}

      Education: ${education}

      Contact Information: ${contact}

      Format the output as a structured JSON object with the following keys:
      - contactInfo: { email, phone }
      - summary: string
      - skills: string[]
      - workExperience: [{ company, location, role, duration, description }]
      - education: [{ institution, location, degree, graduationYear }]
      - certifications: [{ name, issuer, year }] (if applicable)
      - projects: [{ title, description }] (if applicable)
      - languages: [string] (if applicable)
    `;

    // Prepare the request
    const req = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    // Stream the response
    const streamingResp = await generativeModel.generateContentStream(req);
    const res = await streamingResp.response;

    // Aggregate the JSON response content
    let structuredData: any = null;
    if (res.candidates) {
      structuredData = JSON.parse(
        res.candidates
          .map((candidate) => candidate.content.parts[0]?.text)
          .join("")
      );
    }

    // Ensure the structured data is valid
    if (!structuredData) {
      throw new Error("Failed to parse structured data.");
    }

    // Construct the HTML using the structured data
    const htmlOutput = `
      <div class="container">
        <div class="header">
          <div class="full-name">
            <span class="first-name">${
              structuredData.contactInfo.firstName
            }</span> 
            <span class="last-name">${
              structuredData.contactInfo.lastName
            }</span>
          </div>
          <div class="contact-info">
            <span class="email">Email: </span>
            <span class="email-val">${structuredData.contactInfo.email}</span>
            <span class="separator"></span>
            <span class="phone">Phone: </span>
            <span class="phone-val">${structuredData.contactInfo.phone}</span>
          </div>
          <div class="about">
            <span class="position">${profession}</span>
            <span class="desc">${structuredData.summary}</span>
          </div>
        </div>
        <div class="details">
          <div class="section">
            <div class="section__title">Experience</div>
            <div class="section__list">
              ${structuredData.workExperience
                .map(
                  (exp: any) => `
                  <div class="section__list-item">
                    <div class="left">
                      <div class="name">${exp.company}</div>
                      <div class="addr">${exp.location}</div>
                      <div class="duration">${exp.duration}</div>
                    </div>
                    <div class="right">
                      <div class="name">${exp.role}</div>
                      <div class="desc">${exp.description}</div>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
          <div class="section">
            <div class="section__title">Education</div>
            <div class="section__list">
              ${structuredData.education
                .map(
                  (edu: any) => `
                  <div class="section__list-item">
                    <div class="left">
                      <div class="name">${edu.institution}</div>
                      <div class="addr">${edu.location}</div>
                      <div class="duration">${edu.graduationYear}</div>
                    </div>
                    <div class="right">
                      <div class="name">${edu.degree}</div>
                    </div>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
          <div class="section">
            <div class="section__title">Skills</div>
            <div class="skills">
              ${skills
                .map((skill) => `<div class="skills__item">${skill}</div>`)
                .join("")}
            </div>
          </div>
          ${
            structuredData.projects
              ? `<div class="section">
                  <div class="section__title">Projects</div>
                  <div class="section__list">
                    ${structuredData.projects
                      .map(
                        (project: any) => `
                      <div class="section__list-item">
                        <div class="name">${project.title}</div>
                        <div class="text">${project.description}</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
        </div>
      </div>
    `;

    return htmlOutput.trim();
  } catch (error) {
    console.error("Error generating CV content:", error);
    throw new Error("Failed to generate CV content with template");
  }
}

export async function generateCVContentWithTemplate2(
  profession: string,
  skills: string[],
  experience: string,
  education: string,
  contact: string,
  template: string
): Promise<string> {
  try {
    // Define the structured prompt for generating CV content
    const prompt = `
      You are a professional CV writer. Generate a detailed CV for the given profession, using the provided information.
      Ensure the output strictly matches the HTML structure and classes of the given template.

      Profession: ${profession}
      Skills: ${skills.join(", ")}
      Experience: ${experience}
      Education: ${education}
      Contact Information: ${contact}
      Template: ${template}

      Return the HTML output only, without extra text or explanations.
    `;

    // Prepare the request
    const req = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    // Stream the response
    const streamingResp = await generativeModel.generateContentStream(req);

    // Ensure we await the resolved value of streamingResp.response
    const res = await streamingResp.response;
    // Aggregate the response content
    let output = "";
    if (res.candidates) {
      res.candidates.forEach((candidate) => {
        candidate.content.parts.forEach((part) => {
          output += part.text + "\n";
        });
      });
    }
    return output.trim();
  } catch (error) {
    console.error("Error generating CV content:", error);
    throw new Error("Failed to generate CV content with template");
  }
}
