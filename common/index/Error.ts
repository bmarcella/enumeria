
export default class Error {
  type:string;
  code?: number;
  constructor(private error: boolean, private message: string, code?: number, private data?: any ) {
    this.type = (this.error) ? "danger": "success";
    if(!code)
    this.code = (this.error) ? 200 : 500;
    else 
    this.code = code;
  }
}