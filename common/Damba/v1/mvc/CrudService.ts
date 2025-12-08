/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

type EntityCtor<T> = new (...args: any[]) => T;

const Crud = {
  init<T>(DB: any, T: EntityCtor<T>, tree = false): ORM<T> | ORMTREE<T> {
    const repo = DB.getRepository(T);
    return !tree ? new ORM<T>(repo) : new ORMTREE<T>(repo);
  },

  getRepository<T>(DB: any, T: EntityCtor<T>) {
    return DB.getRepository(T);
  },
};

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

/**
 * Standalone helpers (DB + Entity)
 */

export const DSave = async <T>(
  DB: any,
  T: EntityCtor<T>,
  data: T,
  tree = false
): Promise<T> => {
  const crud = Crud.init<T>(DB, T, tree);
  const statement = await crud.save(data);
  return statement as T;
};

export const DGet = async <T>(
  DB: any,
  T: EntityCtor<T>,
  preds?: any,
  all = false,
  tree = false
): Promise<T | T[] | null> => {
  const crud = Crud.init<T>(DB, T, tree);
  const statement = preds ? crud.get(all, preds) : crud.get(all);
  return statement as T | T[] | null;
};

export const DCount = async <T>(
  DB: any,
  T: EntityCtor<T>,
  preds?: any
): Promise<number> => {
  const crud = Crud.init<T>(DB, T, false);
  const statement = preds ? crud.count(preds) : crud.count();
  return statement;
};

/**
 * DambaRepository: DataSource-bound version
 */

export class DambaRepository<DS> {
  private DataSource: DS;
  public static _instance: DambaRepository<any>;
  private entity?: any;

  constructor(ds: DS) {
    this.DataSource = ds;
  }

  public QueryBuilder(T: new (...args: any[]) => any, name?: string) {
    return name
      ? Crud.getRepository(this.DataSource, T).createQueryBuilder(name)
      : Crud.getRepository(this.DataSource, T).createQueryBuilder();
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
    const crud = Crud.init(this.DataSource, T, tree);
    const statement = await crud.save(data);
    return statement;
  };

  public DCount = async (
    T: new (...args: any[]) => any,
    preds?: any
  ): Promise<number> => {
    const crud = Crud.init(this.DataSource, T, false);
    const statement = preds ? crud.count(preds) : crud.count();
    return statement;
  };

  public DUpdate = async (
    T: new (...args: any[]) => any,
    where: any,
    data: any
  ): Promise<any> => {
    const crud = Crud.init(this.DataSource, T, false) as ORM<any>;
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
    const crud = Crud.init(this.DataSource, T, tree);
    const statement = predicates ? crud.get(all, predicates) : crud.get(all);
    return statement;
  };

  public DDelete = async (
    T: new (...args: any[]) => any,
    preds?: any,
    tree = false
  ): Promise<any> => {
    const crud = Crud.init(this.DataSource, T, tree);
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

  public getRelation( T: new (...args: any[]) => any, relation: string, ) {
       const repository = Crud.getRepository(this.DataSource, T);
      return repository.metadata.relations.find((r: any) => r.propertyName === relation);
  }
}
