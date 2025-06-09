import { NextRequest, NextResponse } from "next/server";
import { openai } from "@imagine/ai/openai";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const base64Audio = body.audio;
  
  if (!base64Audio) return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
  
  const audio = Buffer.from(base64Audio, "base64");
  const tmpDir = path.join(process.cwd(), "tmp");

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  const filePath = path.join(tmpDir, "input.wav");

  try {
    fs.writeFileSync(filePath, audio);
    console.log(`Audio file written to ${filePath}, size: ${audio.length} bytes`);
    
    const readStream = fs.createReadStream(filePath);
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1"
    });

    try {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up");
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }

    return NextResponse.json({
      text: data.text
    });
  } catch (error) {
    console.error("Error processing audio file:", error);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up after failure:", cleanupError);
    }
    
    return NextResponse.json({ 
      error: "Error processing audio file", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}