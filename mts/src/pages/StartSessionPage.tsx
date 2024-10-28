import { Box, Button, Container, Group, Switch, Text, Title } from '@mantine/core';
import { IconHeadphones, IconMicrophone } from '@tabler/icons-react';
import { Select } from '@mantine/core';

export function StartSessionPage(): JSX.Element {
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
            <Text>Without Headphones</Text>
            <Switch
              size="md"
              onLabel={<IconHeadphones size={16} />}
              offLabel={<IconMicrophone size={16} />}
            />
          </Group>
        </Box>

          <Button 
          fullWidth 
          size="md"
          leftIcon={<IconMicrophone size={20} />}
        >
          Start Session
        </Button>
      </Box>
    </Container>
  );
}
