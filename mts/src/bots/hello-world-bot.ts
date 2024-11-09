import { BotEvent, MedplumClient } from '@medplum/core';
import { createClient } from '@deepgram/sdk';

export async function handler(medplum: MedplumClient, event: BotEvent): Promise<any> {
  // Check if DEEPGRAM_API_KEY exists in bot secrets
  if (!event.secrets['DEEPGRAM_API_KEY']?.valueString) {
    return {
      message: 'Hello world... but no Deepgram API key found!'
    };
  }

  // Get and mask the API key
  const apiKey = event.secrets['DEEPGRAM_API_KEY'].valueString;
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;

  try {
    // Initialize Deepgram with the new v3 SDK pattern
    const deepgram = createClient(apiKey);

    // Transcribe the audio using the v3 SDK URL transcription method
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: "https://dpgr.am/spacewalk.wav"
      },
      {
        model: "nova-2"
      }
    );

    if (error) {
      throw new Error(`Deepgram transcription error: ${error.message}`);
    }

    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;

    if (!transcript) {
      throw new Error('No transcript generated');
    }

    console.log(`Hello world... your Deepgram API key is: ${maskedKey}`);
    console.log(`Transcription: ${transcript}`);
    
    return {
      message: `Hello world... your Deepgram API key is: ${maskedKey}\n\nTranscription: ${transcript}`
    };

  } catch (error) {
    return {
      message: `Hello world... your Deepgram API key is: ${maskedKey}\n\nTranscription failed: ${(error as Error).message}`
    };
  }
}