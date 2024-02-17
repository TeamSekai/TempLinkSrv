import { Authentication } from './Authentication.ts';
import { VolatileStorage } from '../database/VolatileStorage.ts';
import { BearerToken } from '../api/BearerToken.ts';
import { assertEquals } from 'https://deno.land/std@0.215.0/assert/assert_equals.ts';

Deno.test('Authentication', async (classTest) => {
    await classTest.step('Testing tokens has been registered or not', async () => {
        const authentication = new Authentication(new VolatileStorage());
        const registeredToken = await authentication.generateToken();
        const unregisteredToken = BearerToken.generate();
        assertEquals(await authentication.testToken(registeredToken), true);
        assertEquals(await authentication.testToken(unregisteredToken), false);
    });
});
