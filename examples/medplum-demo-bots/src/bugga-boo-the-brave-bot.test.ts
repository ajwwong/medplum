import { Bot, Reference } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { expect, test, describe } from 'vitest';
import { handler } from './bugga-boo-the-brave-bot';

describe('Bugga Boo Bot', () => {
  const medplum = new MockClient();

  test('Basic test', async () => {
    const bot: Reference<Bot> = { reference: 'Bot/123' };
    const input = 'Hello';
    const contentType = 'text/plain';
    const secrets = {};
    const result = await handler(medplum, { bot, input, contentType, secrets });
    expect(result).toBe(true);
  });
});
