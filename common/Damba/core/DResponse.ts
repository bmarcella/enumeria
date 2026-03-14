export default interface DResponse<T = any> {
  status: number;
  data: T;
  message?: string;
  error?: any;
}
