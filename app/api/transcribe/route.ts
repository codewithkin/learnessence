import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const entry = form.get("file");

    if (!entry || !(entry instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const file = entry as File;

    // Validate size (max 10MB)
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large. Max 10MB allowed." }, { status: 413 });
    }

    // Ensure OPENAI_API_KEY is set
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Forward the file to OpenAI's audio transcription endpoint
    const forwardForm = new FormData();
    // file is a web File and has a name property
    forwardForm.append("file", file, file.name || "recording.webm");
    // You can change the model if needed. 'whisper-1' is the public Whisper model name.
    forwardForm.append("model", "whisper-1");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: forwardForm,
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("OpenAI transcription error:", resp.status, text);
      return NextResponse.json({ error: "Transcription failed", details: text }, { status: 502 });
    }

    const json = await resp.json();
    // Return the transcription JSON through
    return NextResponse.json(json);
  } catch (err) {
    console.error("/api/transcribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
