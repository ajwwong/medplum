import { Box, Button, Container, Group, Switch, Text, Title } from '@mantine/core';
import { IconHeadphones, IconMicrophone, IconPlayerRecord, IconPlayerStop, IconPlayerPlay, IconFileText } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { useMedplum } from '@medplum/react';
import { Media, Task } from '@medplum/fhirtypes';

// Add your Deepgram API key
const DEEPGRAM_API_KEY = '93df6774b2f565ee5cb40354faa45ab528eee9a2';

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
      const media = await medplum.readResource('Media', mediaId);
      
      if (!media.content?.data) {
        throw new Error('No audio data found');
      }

      // Convert base64 to blob
      const binaryData = atob(media.content.data);
      const arrayBuffer = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }
      const audioBlob = new Blob([arrayBuffer], { type: media.content.contentType });

      // Send to Deepgram
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': media.content.contentType || 'audio/webm'
        },
        body: audioBlob
      });

      const data = await response.json();
      const transcript = data.results?.channels[0]?.alternatives[0]?.transcript;

      if (transcript) {
        // Create a Task resource with the transcript
        const task: Task = {
          resourceType: 'Task',
          status: 'completed',
          intent: 'order',
          description: 'Therapy Session Transcript',
          note: [{
            text: transcript
          }],
          output: [{
            type: {
              text: 'Transcript'
            },
            valueString: transcript
          }]
        };

        await medplum.createResource(task);
        console.log('Transcript saved:', transcript);
      }
    } catch (err) {
      console.error('Error generating note:', err);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Box p="xl" sx={(theme) => ({
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.gray[2]}`,
      })}>
        <Title order={1} mb="xl">Therapy Session</Title>
        
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
        </Group>
      </Box>
    </Container>
  );
}
