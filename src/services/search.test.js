import { describe, it, expect } from 'vitest';
import { filterTasksByQuery } from './search';

const tasks = [
  { id: 'a', title: 'Define API contracts', description: 'REST endpoints' },
  { id: 'b', title: 'Fix login bug', description: 'Users cannot sign in via the API' },
  { id: 'c', title: 'Write docs', description: '' },
];

describe('filterTasksByQuery', () => {
  it('returns all tasks for an empty or whitespace query', () => {
    expect(filterTasksByQuery(tasks, '')).toHaveLength(3);
    expect(filterTasksByQuery(tasks, '   ')).toHaveLength(3);
  });

  it('matches title and description case-insensitively', () => {
    expect(filterTasksByQuery(tasks, 'api').map((t) => t.id)).toEqual(['a', 'b']);
    expect(filterTasksByQuery(tasks, 'REST').map((t) => t.id)).toEqual(['a']);
  });

  it('requires every term to match', () => {
    expect(filterTasksByQuery(tasks, 'api login').map((t) => t.id)).toEqual(['b']);
    expect(filterTasksByQuery(tasks, 'nothing here')).toEqual([]);
  });
});
