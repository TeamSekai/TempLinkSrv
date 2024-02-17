import { stub } from 'std/testing/mock';
import { assertEquals } from 'std/assert/assert_equals';
import { assertThrows } from 'std/assert_throws';

import { uint8ArrayOf } from '../util/arrays.ts';
import { UUIDv4 } from '../authentication/UUIDv4.ts';
import { BearerToken } from './BearerToken.ts';
import { PassCode } from '../authentication/PassCode.ts';
import { TokenError } from './errors.ts';

const UUID_STRING = '39862482-dac0-4a0f-82b0-41d00fb72cb0';

const PASS_CODE_BYTES = uint8ArrayOf<26>([
    0x02,
    0x57,
    0xab,
    0x25,
    0x6c,
    0x90,
    0x37,
    0x67,
    0xfe,
    0xdb,
    0x37,
    0x74,
    0xfd,
    0xcd,
    0x77,
    0x61,
    0xc8,
    0x55,
    0x5d,
    0xae,
    0xe6,
    0xfd,
    0xab,
    0xfc,
    0x74,
    0xbc,
]);

const TOKEN = 'Tl0_OYYkgtrASg+CsEHQD7cssAJXqyVskDdn/ts3dP3Nd2HIVV2u5v2r/HS8';

Deno.test('BearerToken.ts', async (fileTest) => {
    const stubUUIDv4_random = stub(UUIDv4, 'random', () => new UUIDv4(UUID_STRING));
    const stubPassCode_random = stub(PassCode, 'random', () => PassCode.forBytes(PASS_CODE_BYTES));

    await fileTest.step('PassCode', async (classTest) => {
        await classTest.step('forBytes', () => {
            assertThrows(() => PassCode.forBytes([0x12, 0x34]), RangeError);
        });

        await classTest.step('random', () => {
            assertEquals(PassCode.random().bytes, PASS_CODE_BYTES);
        });
    });

    await fileTest.step('BearerToken', async (classTest) => {
        await classTest.step('forString', () => {
            assertThrows(
                () => BearerToken.forString('Tl0_........................................................'),
                TokenError,
                'regular expression',
            );
            assertThrows(
                () => BearerToken.forString('Tl1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
                TokenError,
                'version',
            );
        });

        await classTest.step('generate', () => {
            const token = BearerToken.generate();
            assertEquals(token.toString(), TOKEN);
            assertEquals(BearerToken.forString(TOKEN), token);
            assertEquals(token.version, '0');
            assertEquals(token.user, new UUIDv4(UUID_STRING));
            assertEquals(token.passCode, PassCode.forBytes(PASS_CODE_BYTES));
        });
    });

    stubUUIDv4_random.restore();
    stubPassCode_random.restore();
});
