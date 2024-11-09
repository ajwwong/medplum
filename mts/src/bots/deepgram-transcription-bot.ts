import { BotEvent, MedplumClient } from '@medplum/core';
import { createClient } from '@deepgram/sdk';

export async function handler(medplum: MedplumClient, event: BotEvent): Promise<any> {
  // Check if DEEPGRAM_API_KEY exists in bot secrets
  if (!event.secrets['DEEPGRAM_API_KEY']?.valueString) {
    throw new Error('Deepgram API key not found in bot secrets');
  }

  try {
    // Initialize Deepgram with API key from secrets
    const deepgram = createClient(event.secrets['DEEPGRAM_API_KEY'].valueString);

    // The event.input should now contain the raw audio buffer
    const { audioBuffer, contentType } = event.input;

    // Send to Deepgram using transcribeFile
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      {
        buffer: audioBuffer,
      },
      {
        model: "nova-2",
        punctuate: true,
      }
    );

    if (error) {
      throw new Error(`Deepgram transcription error: ${error.message}`);
    }

    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;
    
    return {
      transcript,
      success: true
    };

  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}
