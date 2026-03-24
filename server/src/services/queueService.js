import PQueue from 'p-queue';

const concurrency = parseInt(process.env.QUEUE_CONCURRENCY) || 2;
const interval = parseInt(process.env.QUEUE_INTERVAL) || 1000;

export const queue = new PQueue({ concurrency, interval, intervalCap: concurrency });

queue.on('active', () => {
  console.log(`[Queue] Processing task. Size: ${queue.size}, Pending: ${queue.pending}`);
});

queue.on('idle', () => {
  console.log('[Queue] All tasks completed. Queue is idle.');
});

/**
 * Adds a task function to the queue and returns its result.
 * @param {Function} task - Async function to execute
 * @returns {Promise<*>} Result of the task
 */
export async function addToQueue(task) {
  console.log(`[Queue] Adding task. Current queue size: ${queue.size}`);
  return queue.add(task);
}
