import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

function incidentSummarizerPlugin(): Plugin {
  return {
    name: 'incident-summarizer-api',
    configureServer(server) {
      server.middlewares.use('/api/summarize-incident', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No GEMINI_API_KEY in environment' }));
              return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `You are a Senior EHS and Institutional Laboratory Operations Director.
Analyze this laboratory incident report:
Equipment: ${data.equipmentName}
Severity: ${data.severity}
Reporter: ${data.reporterName}
Description: ${data.rawDescription}
Immediate Action: ${data.immediateActionsTaken}

Respond with a JSON object containing:
{
  "executiveSummary": "2-3 concise sentences summarizing event and operational impact",
  "rootCause": "Technical root cause hypothesis",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "biosafetyCompliance": "OSHA / IBC compliance status and quarantine notes",
  "recommendedCAPA": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "disciplinaryAssessment": "Evaluation of operator protocol compliance"
}
Return valid JSON only.`;

            const aiResponse = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              },
            });

            const parsed = JSON.parse(aiResponse.text || '{}');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ...parsed, modelUsed: 'gemini-3.8-flash' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Error processing AI summary' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), incidentSummarizerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
