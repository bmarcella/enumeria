/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

type EntityCtor<T> = new (...args: any[]) => T;

class ORM<T> {
  constructor(private repository: any) {}

  async save(data: T): Promise<T> {
    return this.repository.save(data);
  }

  async get(all = false, pred?: any): Promise<T[] | T | null> {
    return all ? this.repository.find(pred) : this.repository.findOne(pred);
  }

  async del(pred?: any): Promise<any> {
    return this.repository.delete(pred);
  }

  async count(pred?: any): Promise<number> {
    return pred ? this.repository.count(pred) : this.repository.count();
  }

  async update(where: any, data: T): Promise<any> {
    return this.repository.update(where, data);
  }
}

class ORMTREE<T> {
  constructor(private repository: any) {}

  async get(pred?: any): Promise<T[] | T> {
    return this.repository.findTrees(pred);
  }

  async save(data: T): Promise<T> {
    return this.repository.save(data);
  }

  async del(pred?: any): Promise<any> {
    return this.repository.delete(pred);
  }

  async count(pred?: any): Promise<number> {
    return pred ? this.repository.count(pred) : this.repository.count();
  }

  async update(where: any, data: T): Promise<any> {
    return this.repository.update(where, data);
  }
}

export class DambaRepository<DS> {
  private DataSource: DS;

  public static _instance: DambaRepository<any>;

  private entity?: any;

  constructor(ds: DS) {
    this.DataSource = ds;
  }

  init<E>(T: EntityCtor<E>, tree = false): ORM<E> | ORMTREE<E> {
    const repo = this.getRepository<E>(T);
    return !tree ? new ORM<E>(repo) : new ORMTREE<E>(repo);
  }

  getRepository<E>(E: EntityCtor<E>) {
    if (this.DataSource) {
      return (this.DataSource as any).getRepository(E);
    }
    throw new Error("Datasource is undefined");
  }

  public QueryBuilder(T: new (...args: any[]) => any, name?: string) {
    return name
      ? this.getRepository<typeof T>(T).createQueryBuilder(name)
      : this.getRepository<typeof T>(T).createQueryBuilder();
  }

  setEntity(T: any) {
    this.entity = T; // fixed: assign instead of calling
  }

  public static init(DS: any): DambaRepository<typeof DS> {
    if (!this._instance) {
      this._instance = new DambaRepository<typeof DS>(DS);
    }
    return this._instance;
  }

  public DSave = async (
    T: new (...args: any[]) => any,
    data: any,
    tree = false
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, tree);
    const statement = await crud.save(data);
    return statement;
  };

  public DCount = async (
    T: new (...args: any[]) => any,
    preds?: any
  ): Promise<number> => {
    const crud = this.init<typeof T>(T, false);
    const statement = preds ? crud.count(preds) : crud.count();
    return statement;
  };

  public DUpdate = async (
    T: new (...args: any[]) => any,
    where: any,
    data: any
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, false);
    const statement = await crud.update(where, data);
    return statement;
  };

  /**
   * Generic data fetch helper for TypeORM entities.
   *
   * 🔹 Parameters:
   * @param T      — The Entity class (constructor) you want to query.
   * @param preds  — (Optional) TypeORM-style filter or "where" object.
   * @param all    — If true, returns all; else, one.
   * @param tree   — If true, uses tree repository behavior.
   */
  public DGet = async (
    T: new (...args: any[]) => any,
    predicates?: any,
    all = false,
    tree = false
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, tree);
    all = !predicates ? true : all;
    const statement = predicates ? crud.get(all, predicates) : crud.get(all);
    return statement;
  };

  public DDelete = async (
    T: new (...args: any[]) => any,
    preds?: any,
    tree = false
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, tree);
    const statement = preds ? crud.del(preds) : crud.del();
    return statement;
  };

  async QBGetAll(
    T: new (...args: any[]) => any,
    name?: string,
    select?: any[],
    where?: { value: string; data: any }
  ) {
    let QB = this.QueryBuilder(T, name);
    if (select) {
      QB = QB.select(select);
    }
    if (where) {
      QB = QB.where(where.value, where.data);
    }
    return QB.getRawMany();
  }

  async QBUpdate(
    T: new (...args: any[]) => any,
    set: any,
    where?: { value: string; data: any }
  ) {
    let QB = this.QueryBuilder(T).update().set(set);
    if (where) {
      QB = QB.where(where.value, where.data);
    }
    return QB.execute();
  }

  public getRelation(T: new (...args: any[]) => any, relation: string) {
    const repository = this.getRepository<typeof T>(T);
    return repository.metadata.relations.find(
      (r: any) => r.propertyName === relation
    );
  }
}
