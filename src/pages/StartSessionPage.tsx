import { Button, Container, Title } from '@mantine/core';
import { QuestionnaireForm } from '@medplum/react';
import { useNavigate } from 'react-router-dom';

export function StartSessionPage(): JSX.Element {
  const navigate = useNavigate();

  const sessionQuestionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    title: 'Therapy Session Recording',
    item: [
      {
        linkId: 'patient',
        text: 'Patient',
        type: 'reference',
        required: true
      },
      {
        linkId: 'session-type',
        text: 'Session Type',
        type: 'choice',
        answerOption: [
          { valueString: 'Initial Consultation' },
          { valueString: 'Follow-up' },
          { valueString: 'Emergency Session' }
        ]
      },
      {
        linkId: 'session-recording',
        text: 'Session Recording',
        type: 'attachment'
      }
    ]
  };

  return (
    <Container>
      <Title>Start Therapy Session</Title>
      <QuestionnaireForm
        questionnaire={sessionQuestionnaire}
        onSubmit={(response) => {
          // Handle the QuestionnaireResponse
          // Bot will be triggered automatically
          navigate('/sessions');
        }}
      />
    </Container>
  );
}
