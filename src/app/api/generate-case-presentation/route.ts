import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic, presentationType, clinicalFeatures, fileParts } = body;

    if (!topic || !presentationType) {
      return NextResponse.json({ error: 'Topic and Presentation Type are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert **medical educator, clinician, academic writer, and case presentation assistant** for undergraduate healthcare students.
Your task is to generate a **structured, clinically realistic, academically useful, and presentation-ready case presentation** based on the selected:

* **Course**: ${course}
* **Subject**: ${subject}
* **Topic / Diagnosis / Syndrome**: ${topic}
* **Case Presentation Type**: ${presentationType}
${clinicalFeatures ? `* **Clinical Features**: ${clinicalFeatures}` : ''}
${fileParts && fileParts.length > 0 ? '* **Uploaded Clinical Notes**: (See attached files)' : ''}

The generated case presentation must be:
* directly related to the selected Topic / Diagnosis / Syndrome
${(clinicalFeatures || (fileParts && fileParts.length > 0)) ? '* specifically tailored to incorporate the provided Clinical Features and uploaded Notes into the history, exam, and management. DO NOT invent a random case if specific features/notes are provided. Base the case entirely on the provided patient data.' : ''}
* adapted to the selected Case Presentation Type
* appropriate for the selected Course and Subject
* suitable for undergraduate students (MBBS / BDS / BSc Nursing)
* clinically coherent, exam-oriented, and internally consistent
* useful for assignments, bedside case presentations, viva, seminar, ward rounds, and portfolio use

---
# CORE INSTRUCTION
Generate a clinical case presentation centered on the selected Topic. The structure and depth must be strictly determined by the selected Case Presentation Type.
The format, level of detail, and tone must change depending on the selected Case Presentation Type.
Make it feel like a real patient scenario. Ensure internal consistency between history, exams, and labs.
Use clear headings (Markdown format), logical flow, concise clinical language, and relevant positive/negative findings.

---
# DECISION RULE: CASE PRESENTATION TYPE DRIVES THE OUTPUT
Adapt strictly to: ${presentationType}

1. SHORT CASE PRESENTATION
Focus: identification, chief complaints, brief history, key exam, summary, diagnosis, brief management.
2. LONG CASE PRESENTATION
Focus: full detailed academic clinical case presentation with detailed history, examination, investigations, diagnosis, management, and discussion.
3. SEMINAR STYLE CASE PRESENTATION
Focus: classroom presentation. Include Introduction, Case, Investigations, Management, and a detailed Discussion of the Topic (definition, etiology, path, features, treatment, guidelines).
4. WARD ROUND PRESENTATION
Focus: crisp and practical for ward rounds. Patient status, active problems, current treatment, plan for the day.
5. NURSING CASE PRESENTATION
Focus: BSc Nursing. Combine medical diagnosis with nursing assessment, nursing diagnoses, and a detailed Nursing Care Plan.
6. PROBLEM-BASED CASE DISCUSSION
Focus: clinical reasoning, differentials, problem list, why investigations were ordered, pitfalls, red flags.
7. CUSTOM TYPE
If it is a custom type, adapt to the closest matching format and include standard case elements.

---
# INVESTIGATION RULES
Divide into routine and specific. Include plausible results. Align with diagnosis.

# MANAGEMENT RULES
Include immediate, pharmacological, non-pharmacological, surgical, follow-up, and patient counseling.

---
Now generate the case presentation using the inputs provided. Do not include any introductory chatter, just output the requested Markdown document directly starting with a title.`;

    let generateArgs: any = [prompt];
    
    if (fileParts && fileParts.length > 0) {
      generateArgs = [prompt, ...fileParts];
    }

    const result = await model.generateContent(generateArgs);
    const text = result.response.text();

    return NextResponse.json({ presentation: text });

  } catch (error: any) {
    console.error('Error generating case presentation:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate presentation.' }, { status: 500 });
  }
}
