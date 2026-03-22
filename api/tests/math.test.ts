import { add, mockService } from './add';

describe('add function', () => {
  it('should return the sum of two numbers', () => {
    const result = add(2, 3);

    expect(result).toBe(5);
  });

  test('should return mocked user', () => {
    const user = mockService.getUser();

    expect(user.name).toBe('Bob');
  });
});
