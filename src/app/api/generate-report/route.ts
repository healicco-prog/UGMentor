import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SCAN_PROMPTS: Record<string, string> = {
  ECG: `You are a medical education AI assistant. Analyze this ECG image and generate a structured educational report for a medical student. Format your response with these exact sections:

**Rhythm Analysis:** [describe the rhythm]
**Rate:** [estimated heart rate]
**Axis:** [electrical axis assessment]
**P-Wave / PR Interval:** [P-wave morphology and PR interval]
**QRS Complex:** [QRS width and morphology]
**ST Segment & T-Wave:** [any ST or T-wave changes]
**Impression:** [overall diagnostic impression]
**Educational Note:** [1-2 key learning points about this ECG pattern]
**My Interpretation:** [A concise, professional medical summary of the findings, written as if entering into a patient's chart. Use professional medical terminology.]
**Clinical Correlation & Plan:** [A concise professional paragraph outlining how these findings correlate with typical presentations and the recommended next steps/management plan.]

Be detailed but educational. If the image quality is poor, note that and provide general educational content about common ECG patterns.`,

  'X-Ray': `You are a medical education AI assistant. Analyze this chest X-ray image and generate a structured educational report for a medical student. Format your response with these exact sections:

**Technical Quality:** [assess rotation, penetration, inspiration]
**Trachea & Mediastinum:** [midline, mediastinal width, hilar positions]
**Cardiac Silhouette:** [heart size, CTR estimate, borders]
**Lung Fields:** [describe both lungs zone by zone - any opacity, consolidation, effusion]
**Pleura & Diaphragm:** [costophrenic angles, diaphragm domes]
**Bony Structures:** [ribs, clavicles, vertebrae]
**Impression:** [overall diagnostic impression]
**Educational Note:** [1-2 key learning points]
**My Interpretation:** [A concise, professional medical summary of the findings, written as if entering into a patient's chart.]
**Clinical Correlation & Plan:** [A concise professional paragraph outlining how these findings correlate with typical presentations and the recommended next steps.]

Be systematic and educational. Note if image quality limits assessment.`,

  'CT Scan': `You are a medical education AI assistant. Analyze this CT scan image and generate a structured educational report for a medical student. Format your response with these exact sections:

**Window Settings:** [identify appropriate window — brain/lung/bone/abdomen]
**Parenchyma:** [describe tissue density and signal characteristics]
**Ventricular System / Hollow Organs:** [size, symmetry, any abnormality]
**Vascular Structures:** [major vessels, any pathology]
**Bone Windows:** [cortex, any fractures or lesions]
**Soft Tissue:** [mass effect, enhancement patterns, surrounding structures]
**Impression:** [overall diagnostic impression]
**Educational Note:** [1-2 key learning points about CT interpretation]
**My Interpretation:** [A concise, professional medical summary of the findings, written as if entering into a patient's chart.]
**Clinical Correlation & Plan:** [A concise professional paragraph outlining how these findings correlate with typical presentations and the recommended next steps.]

Be systematic. Note if image quality limits assessment.`,

  MRI: `You are a medical education AI assistant. Analyze this MRI image and generate a structured educational report for a medical student. Format your response with these exact sections:

**Sequence Identification:** [identify T1/T2/FLAIR/DWI/other]
**Signal Characteristics:** [describe signal intensities — bright/dark areas]
**T2/FLAIR Findings:** [hyperintense or hypointense areas]
**Diffusion-Weighted Imaging:** [restricted diffusion pattern if applicable]
**Enhancement Pattern:** [gadolinium enhancement if visible]
**Mass Effect / Midline Shift:** [any compression or displacement]
**Impression:** [overall diagnostic impression]
**Educational Note:** [1-2 key learning points about MRI interpretation]
**My Interpretation:** [A concise, professional medical summary of the findings, written as if entering into a patient's chart.]
**Clinical Correlation & Plan:** [A concise professional paragraph outlining how these findings correlate with typical presentations and the recommended next steps.]

Be systematic and educational.`,

  'Laboratory Report': `You are a medical education AI assistant. Analyze this laboratory report image and generate a structured educational report for a medical student. Format your response with these exact sections:

**Report Identification:** [identify test type — CBC, LFT, RFT, TFT, etc.]
**Reference Range Comparison:** [compare values to normal ranges]
**Key Abnormalities:** [list any values outside normal range with clinical significance]
**Clinical Significance:** [what these results mean clinically]
**Critical Values:** [any values requiring urgent attention]
**Pattern Recognition:** [identify any recognizable clinical pattern]
**Impression:** [overall interpretation of the laboratory findings]
**Educational Note:** [1-2 key learning points about interpreting these tests]
**My Interpretation:** [A concise, professional medical summary of the findings, written as if entering into a patient's chart.]
**Clinical Correlation & Plan:** [A concise professional paragraph outlining how these findings correlate with typical presentations and the recommended next steps.]

Be precise with numbers if visible. Note if the image is unclear.`,

  Other: `You are a medical education AI assistant. Analyze this medical report/investigation image and generate a structured educational report for a medical student. Format your response with these exact sections:

**Report Type Identified:** [identify the type of investigation]
**Key Findings:** [describe the main findings visible]
**Clinical Significance:** [what these findings mean clinically]
**Comparison:** [note if comparison with prior studies would be helpful]
**Specialist Input:** [recommend specialist review if appropriate]
**Impression:** [overall interpretation]
**Educational Note:** [1-2 key learning points]
**My Interpretation:** [A concise, professional medical summary of the findings, written as if entering into a patient's chart.]
**Clinical Correlation & Plan:** [A concise professional paragraph outlining how these findings correlate with typical presentations and the recommended next steps.]

Be systematic and educational.`,
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return Response.json(
        { error: 'GEMINI_API_KEY is not configured. Please add your API key to .env.local' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const scanType = formData.get('scanType') as string;
    const selectedFinding = formData.get('selectedFinding') as string;

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = SCAN_PROMPTS[scanType] || SCAN_PROMPTS['Other'];
    const fullPrompt = prompt;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: fullPrompt },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the structured response into sections
    const sections = parseReportSections(text);

    return Response.json({ report: sections, rawText: text });
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    return Response.json({ error: message }, { status: 500 });
  }
}

function parseReportSections(text: string): Array<{ label: string; value: string }> {
  const lines = text.split('\n').filter(l => l.trim());
  const sections: Array<{ label: string; value: string }> = [];

  let currentLabel = '';
  let currentValue = '';

  for (const line of lines) {
    // Match **Label:** pattern
    const match = line.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
    if (match) {
      if (currentLabel) {
        sections.push({ label: currentLabel, value: currentValue.trim() });
      }
      currentLabel = match[1].trim();
      currentValue = match[2].trim();
    } else if (currentLabel && line.trim()) {
      currentValue += ' ' + line.trim();
    }
  }

  // Push the last section
  if (currentLabel) {
    sections.push({ label: currentLabel, value: currentValue.trim() });
  }

  // If parsing failed (no structured sections), return raw text as one section
  if (sections.length === 0) {
    sections.push({ label: 'AI Analysis', value: text });
  }

  return sections;
}
