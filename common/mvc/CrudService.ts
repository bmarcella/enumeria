/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const Crud = {
  init :  <T> (DB: any, ENT: new (...args: any[]) => any) => {
     const repo = DB.getRepository(ENT);
     return new ORM<T>(repo);
  },
};

class ORM <T> {
  constructor(private repository: any) {}
  
  async save (data: T)  : Promise<Awaited<T>>  {
    return await this.repository.save(data);
  }

  saveAsync (data: T)  : Promise<Awaited<T>>  {
    return  this.repository.save(data);
  }



  async get ( all: boolean = false, pred?: any) : Promise< T[] | Awaited<T>>  {
    return await (all) ? this.repository.find(pred) : this.repository.findOne(pred) ;
  }


  async del  (pred?: any)  {
    return await  this.repository.delete(pred) ;
  }

  async count  ( pred?: any) : Promise<Awaited<any>>   {
    const total = await (pred) ? this.repository.count(pred) : this.repository.count() ;
    return total;
  }

}

export  const  DSave = async <T> (DB: any,ENT: new (...args: any[]) => any, data: T, asc: boolean = true ) :  Promise< T | Awaited<T>>  => {
  return new Promise(async (resolve) => {
     const crud = Crud.init(DB, ENT);
       const obj = (asc) ? await crud.saveAsync(data) : await crud.save(data);
        resolve(obj as T);
    });
}


export  const  DGet = async <T> (DB: any,ENT: new (...args: any[]) => any, all: boolean, prep: any ) : Promise< T[] | T> => {
  return new Promise(async (resolve) => {
     const crud = Crud.init(DB, ENT);
       const obj =  await crud.get(all, prep) as T[] | T;
        resolve(obj);
    });
}

