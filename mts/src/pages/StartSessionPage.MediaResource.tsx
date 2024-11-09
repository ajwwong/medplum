import { Box, Button, Container, Group, Switch, Text, Title } from '@mantine/core';
import { IconHeadphones, IconMicrophone, IconPlayerRecord, IconPlayerStop, IconPlayerPlay, IconFileText, IconRobot } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { useMedplum } from '@medplum/react';
import { Media, Task } from '@medplum/fhirtypes';
import { createClient } from '@deepgram/sdk';

export function StartSessionPage(): JSX.Element {
  const medplum = useMedplum();
  const [isRecording, setIsRecording] = useState(false);
  const [useHeadphones, setUseHeadphones] = useState(false);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          
          // Create Media resource for the audio recording
          const mediaResource: Media = {
            resourceType: 'Media',
            status: 'completed',
            type: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/media-type',
                code: 'audio',
                display: 'Audio Recording'
              }]
            },
            content: {
              contentType: 'audio/webm',
              data: base64data,
            },
            createdDateTime: new Date().toISOString(),
            deviceName: 'Web Browser Audio Recorder'
          };

          const media = await medplum.createResource(mediaResource);
          setMediaId(media.id);
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const stopSession = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAudio = async () => {
    if (!mediaId) return;

    try {
      const media = await medplum.readResource('Media', mediaId);
      if (media.content?.data) {
        const binaryData = atob(media.content.data);
        const arrayBuffer = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          arrayBuffer[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: media.content.contentType });
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        
        audio.onloadeddata = () => {
          console.log('Audio loaded and ready to play');
        };
        
        audio.onended = () => {
          URL.revokeObjectURL(audio.src);
        };
        
        await audio.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  };

  const generateNote = async () => {
    if (!mediaId) return;

    try {
      const result = await medplum.executeBot('deepgram-transcription-bot', {
        resourceType: 'Media',
        id: mediaId
      });

      console.log('Transcript saved:', result.transcript);
    } catch (err) {
      console.error('Error generating note:', err);
    }
  };

  const generateNoteDirectDeepgram = async () => {
    if (!mediaId) return;

    try {
      // Get the media resource from Medplum
      const media = await medplum.readResource('Media', mediaId);
      if (!media.content?.data) return;

      // Convert base64 to binary
      const binaryData = atob(media.content.data);
      const arrayBuffer = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }

      // Create blob and get array buffer for Deepgram
      const blob = new Blob([arrayBuffer], { type: media.content.contentType });
      const audioBuffer = await blob.arrayBuffer();

      // Initialize Deepgram client
      const deepgram = createClient('93df6774b2f565ee5cb40354faa45ab528eee9a2' || '');

      // Send to Deepgram using transcribeFile
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        {
          buffer: audioBuffer,
        },
        {
          model: "nova-2",
        }
      );

      if (error) {
        throw new Error(`Deepgram transcription error: ${error.message}`);
      }

      const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;
      console.log('Direct Deepgram transcript:', transcript);

    } catch (err) {
      console.error('Error generating note through direct Deepgram:', err);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Box p="xl" sx={(theme) => ({
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.gray[2]}`,
      })}>
        <Title order={1} mb="xl">Therapy w/Bubba Session</Title>
        
        <Box mb="xl">
          <Title order={2} size="h4" mb="md">Session Setup</Title>
          <Group position="apart" align="center">
            <Text>Using Headphones</Text>
            <Switch
              size="md"
              checked={useHeadphones}
              onChange={(e) => setUseHeadphones(e.currentTarget.checked)}
              onLabel={<IconHeadphones size={16} />}
              offLabel={<IconMicrophone size={16} />}
            />
          </Group>
        </Box>

        <Group spacing="md" direction="column" grow>
          <Button 
            fullWidth 
            size="md"
            color={isRecording ? 'red' : 'blue'}
            leftIcon={isRecording ? <IconPlayerStop size={20} /> : <IconPlayerRecord size={20} />}
            onClick={isRecording ? stopSession : startSession}
          >
            {isRecording ? 'End Session' : 'Start Session'}
          </Button>

          {mediaId && !isRecording && (
            <Button
              fullWidth
              size="md"
              color="green"
              leftIcon={<IconPlayerPlay size={20} />}
              onClick={playAudio}
            >
              Play Audio
            </Button>
          )}
          
          {mediaId && !isRecording && (
            <Button
              fullWidth
              size="md"
              color="teal"
              loading={false}
              leftIcon={<IconFileText size={20} />}
              onClick={generateNote}
            >
              Generate Note
            </Button>
          )}
          
          {mediaId && !isRecording && (
            <Button
              fullWidth
              size="md"
              color="grape"
              loading={false}
              leftIcon={<IconRobot size={20} />}
              onClick={generateNoteDirectDeepgram}
            >
              Generate Note (Direct Deepgram)
            </Button>
          )}
        </Group>
      </Box>
    </Container>
  );
}
