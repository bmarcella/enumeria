export class Http {
  token: string
  constructor (private axios: any,  token: string ){
    this.token = token;
  }
  private getHeaders(secure:boolean){

    const h = (secure) ? {
      // 'Content-type': 'application/json',
       authorization: `Bearer ${this.token}`,
    } : 
    {
      // 'Content-type': 'application/json',
    };
    console.log(h);
  }
  public async get(tokenEndpoint: string, secure : boolean = false ) : Promise<any> {
    try {
       const res =  await this.axios.get(tokenEndpoint, {
        headers: this.getHeaders(secure),
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async getSec(tokenEndpoint: string) : Promise<any> {

    try {
      const response = await this.axios.get(tokenEndpoint, {
        headers: {
           authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }

  }

  public async deleteSec(tokenEndpoint: string) : Promise<any> {
    try {
      const response = await this.axios.delete(tokenEndpoint, {
        headers: {
           authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async postSec(tokenEndpoint: string, data: any) : Promise<any> {
    try {
      const response = await this.axios.post(tokenEndpoint, data, {
        headers: {
          authorization: `Bearer ${this.token}`,
       },
      }, data);
      return response.data;
    } catch (error) {
      throw error;
    }

  }

  public async post(tokenEndpoint: string, data: any, secure : boolean = false) : Promise<any> {
    try {
      const response = await this.axios.post(tokenEndpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async formaData(tokenEndpoint: string, data: any, headers: any) : Promise<any> {
    try {
     // 'Content-Type': 'multipart/form-data',
      const response = await this.axios.post(tokenEndpoint, data, {
        headers: {
     
          ...headers, // Important to set the correct headers
        },
      });
      console.log('File uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }


  public async delete(tokenEndpoint: string, secure : boolean = false)  : Promise<any>{
    try {
      const response = await this.axios.delete(tokenEndpoint,{
        headers: this.getHeaders(secure),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async patch(tokenEndpoint: string, data: any, secure : boolean = false ) : Promise<any>{
    try {
      const response = await this.axios.patch(tokenEndpoint, {
        headers:this.getHeaders(secure),
      }, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async put(tokenEndpoint: string, data: any, secure : boolean = false ) : Promise<any> {
    try {
      const response = await this.axios.put(tokenEndpoint, {
        headers:this.getHeaders(secure),
      }, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

}

export const  SERV_EP = {
  getEntById : "/entreprise/getById/",
  getListEntById : "/entreprise/getListById",
  getCrossToken: "/cross-token/getFullCT/",
  getAllWithAdressPage : "/entreprise/getAllWithAdressPage/",
  editAdresse : "/entreprise/editAdresse/",
  addAdresse : "/entreprise/addAdresse/",
  delEntreprise : "/entreprise/del/",
  editEntreprise : "/entreprise/edit/",
  countEntreprise : "/entreprise/count",
  countAdresse : "/entreprise/adresse/count/",
  editPassword : "/auth/editPassword"
}