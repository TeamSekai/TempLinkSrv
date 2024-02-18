import { assertEquals } from 'std/assert/assert_equals';
import { JobQueue } from './JobQueue.ts';

function timeout(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

Deno.test('JobQueue', async () => {
    const queue = new JobQueue();
    let result = '0';
    queue.add(async () => {
        await timeout(20);
        result += '1';
    });
    queue.add(async () => {
        await timeout(30);
        result += '2';
    });
    queue.add(async () => {
        await timeout(10);
        result += '3';
    });
    await timeout(100);
    assertEquals(result, '0123');
    assertEquals(queue.length, 0);
});
