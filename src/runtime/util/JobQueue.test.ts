import { assertEquals } from 'std/assert/assert_equals';
import { JobQueue } from './JobQueue.ts';

function timeout(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

Deno.test('JobQueue', async () => {
    const queue = new JobQueue();
    let result = '0';
    queue.run(async () => {
        await timeout(20);
        result += '1';
    }).then(() => result += 'a');
    queue.run(async () => {
        await timeout(30);
        result += '2';
    }).then(() => result += 'b');
    queue.run(async () => {
        await timeout(10);
        result += '3';
    }).then(() => result += 'c');
    await timeout(100);
    assertEquals(result, '01a2b3c');
    assertEquals(queue.length, 0);
});
