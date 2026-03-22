export function add(a: number, b: number): number {
  return a + b;
}

export const mockService = {
  getUser: jest.fn().mockReturnValue({ id: 1, name: 'Bob' }),
};
