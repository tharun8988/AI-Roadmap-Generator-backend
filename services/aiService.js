const ai = require("../config/groq"); // rename config/gemini.js to config/groq.js

const SYSTEM_PROMPT = `
You are an expert project planning assistant.

Your job is to generate a practical and logical development roadmap
for a software project.

The roadmap must contain milestones and actionable tasks.

Rules:
- Generate milestones in a logical development order.
- Milestone order must start from 1.
- Task order must start from 1 inside each milestone.
- Milestone titles must be unique.
- Task titles must be unique within a milestone.
- Tasks must be specific and actionable.
- Do not include MongoDB IDs.
- Do not include project IDs.
- Do not include milestone IDs.
- Do not include status fields.
- Do not include owner or collaborator information.

The response must use exactly this JSON structure:

{
    "milestones": [
        {
            "title": "string",
            "description": "string",
            "order": 1,
            "tasks": [
                {
                    "title": "string",
                    "description": "string",
                    "order": 1
                }
            ]
        }
    ]
}

Return only valid JSON.
`;

const generateRoadmap = async (title, description) => {

    const response = await ai.chat.completions.create({

        model: process.env.GROQ_MODEL,

        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: `
Project Title:
${title}

Project Description:
${description}

Generate a development roadmap for this project as JSON.
                `
            }
        ],

        response_format: { type: "json_object" },
        temperature: 0.4
    });

    try {

        const roadmap = JSON.parse(response.choices[0].message.content);

        return roadmap;

    } catch (error) {

        throw new Error("AI returned invalid JSON");
    }
};

module.exports = {
    generateRoadmap
};
