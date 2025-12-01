

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const Crud = {
  init: (DB: any, T: new (...args: any[]) => any, tree = false) => {
    const repo = DB.getRepository(T);
    return (!tree) ? new ORM<typeof T>(repo) : new ORMTREE<typeof T>(repo);
  },
  getRepository: (DB: any, T: new (...args: any[]) => any) => {
    return DB.getRepository(T);
  }
};

class ORM<T> {
  constructor(private repository: any) { }
  async save(data: T): Promise<Awaited<T>> {
    return this.repository.save(data);
  }
  async get(all: boolean = false, pred?: any): Promise<T[] | Awaited<T>> {
    return (all) ? this.repository.find(pred) : this.repository.findOne(pred);
  }
  async del(pred?: any) {
    return this.repository.delete(pred);
  }
  async count(pred?: any): Promise<Awaited<any>> {
    return (pred) ? this.repository.count(pred) : this.repository.count();
  }
  async update(where: any, data: T): Promise<Awaited<T>> {
    return this.repository.update(where, data);
  }
}

class ORMTREE<T> {
  constructor(private repository: any) { }

  async get(pred?: any): Promise<T[] | Awaited<T>> {
    return await this.repository.findTrees(pred);
  }
  async save(data: T): Promise<Awaited<T>> {
    return await this.repository.save(data);
  }
  async del(pred?: any) {
    return this.repository.delete(pred);
  }
  async count(pred?: any): Promise<Awaited<any>> {
    return (pred) ? this.repository.count(pred) : this.repository.count();
  }
  async update(where: any, data: T): Promise<Awaited<T>> {
    return this.repository.update(where, data);
  }
}


export const DSave = (DB: any, T: new (...args: any[]) => any, data: InstanceType<typeof T>, tree: boolean = false): Promise<typeof T> => {
  return new Promise<typeof T>(async (resolve) => {
    const crud = Crud.init(DB, T, tree);
    const statement = await crud.save(data) as typeof T;
    resolve(statement);
  });
};


export const DGet = (DB: any, T: new (...args: any[]) => any, preds?: any, all: boolean = false, tree: boolean = false): Promise<any> => {
  return new Promise<any>(async (resolve) => {
    const crud = Crud.init(DB, T, tree);
    const statement = ((preds) ? crud.get(all, preds) : crud.get(all))
    resolve(statement);
  });
};

export const DCount = (DB: any, T: new (...args: any[]) => any, preds?: any ): Promise<any> => {
  return new Promise<any>(async (resolve) => {
    const crud = Crud.init(DB, T, false);
    const statement = ((preds) ? crud.count(preds): crud.count())
    resolve(statement);
  });
};

export class DambaRepository<DS> {
  private DataSource: DS;
  public static _instance: DambaRepository<any>;
  private entity :  any;

  constructor(private ds: DS) {
    this.DataSource = ds;
  }

  public  QueryBuilder (T: new (...args: any[]) => any, name?: string) {
     return (name) ? Crud.getRepository(this.DataSource, T).createQueryBuilder(name) : 
     Crud.getRepository(this.DataSource, T).createQueryBuilder() ;
  }

  setEntity(T: any){
      this.entity(T)
  }

  public static init(DS: any): DambaRepository<typeof DS> {
    if (!this._instance) {
      this._instance = new DambaRepository<typeof DS>(DS);
    }
    return this._instance;
  }

  public DSave = (T: new (...args: any[]) => any, data: InstanceType<typeof T>, tree: boolean = false): Promise<typeof T> | unknown => {
    return new Promise<typeof T>(async (resolve) => {
      const crud = Crud.init(this.DataSource, T, tree);
      const statement = await crud.save(data) as typeof T;
      resolve(statement);
    });
  };

 public  DCount = ( T: new (...args: any[]) => any, preds?: any ): Promise<any> => {
  return new Promise<any>(async (resolve) => {
    const crud = Crud.init(this.DataSource, T, false);
    const statement = ((preds) ? crud.count(preds): crud.count())
    resolve(statement);
  });
};

  public DUpdate = (T: new (...args: any[]) => any, where: any, data: InstanceType<typeof T>): Promise<typeof T> | unknown => {
    return new Promise<typeof T>(async (resolve) => {
      const crud = Crud.init(this.DataSource, T, false) as ORM<InstanceType<typeof T>> ;
      const statement = await crud.update(where, data) as typeof T;
      resolve(statement);
    });
  };





  /**
   * Generic data fetch helper for TypeORM entities.
   *
   * 🔹 Parameters:
   * @param T      — The Entity class (constructor) you want to query.  
   *                 Example: `User`, `Organization`, `Role`, etc.
   *
   * @param preds  — (Optional) A TypeORM-style filter or "where" object.  
   *                 Example: `{ where: { email: 'bmarcella91@gmail.com' } }`
   *                 Pass `undefined` if you want all records.
   *
   * @param all    — (Optional, default = false)  
   *                 If `true`, returns all matching rows.  
   *                 If `false`, returns only one (the first match).
   *
   * @param tree   — (Optional, default = false)  
   *                 If `true`, enables tree repository mode (for hierarchical entities).
   *
   * 🔹 Returns:
   * A Promise resolving to:
   *  - a single entity object if `all = false`
   *  - an array of entities if `all = true`
   *
   * ✅ Example usage:
   * const user = await DGet(User, { where: { email: 'test@example.com' } });
   * const orgs = await DGet(Organization, { where: { active: true } }, true);
   */
  public DGet = (
    T: new (...args: any[]) => any,
    preds?: any,
    all: boolean = false,
    tree: boolean = false
  ): Promise<any> => {
    return new Promise<any>(async (resolve) => {
      const crud = Crud.init(this.DataSource, T, tree);
      const statement = preds ? crud.get(all, preds) : crud.get(all);
      resolve(statement);
    });
  };

  public DDelete = (
    T: new (...args: any[]) => any,
    preds?: any,
    tree: boolean = false
  ): Promise<any> => {
    return new Promise<any>(async (resolve) => {
      const crud = Crud.init(this.DataSource, T, tree);
      const statement = preds ? crud.del(preds) : crud.del();
      resolve(statement);
    });
  };

  // 

  async QBGetAll(T: new (...args: any[]) => any, name?: string, select?: any[], where?: { value: string , data : any }){
    let QB = this.QueryBuilder(T, name);
    if(select) {
      QB = QB.select(select)
    }
    if(where) {
      QB = QB.where(where.value, where.data)
    }
   return  await QB.getRawMany();
  }

   async QBUpdate(T: new (...args: any[]) => any, set: any,  where?: { value: string , data : any } ){
    let QB = this.QueryBuilder(T).update().set(set);
    if(where) {
      QB = QB.where(where.value, where.data);
    }
   return  await QB.execute();
  }



}
