import { assertEquals } from 'std/assert/assert_equals';

import { Authentication } from './Authentication.ts';
import { VolatileStorage } from '../database/VolatileStorage.ts';
import { BearerToken } from '../api/BearerToken.ts';

Deno.test('Authentication', async (classTest) => {
    await classTest.step('Testing tokens has been registered or not', async () => {
        const authentication = new Authentication(new VolatileStorage());
        const registeredToken = await authentication.generateToken();
        const unregisteredToken = BearerToken.generate();
        assertEquals(await authentication.testToken(registeredToken), true);
        assertEquals(await authentication.testToken(unregisteredToken), false);
    });
});
