/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

type Ctor<T> = new (...args: any[]) => T;

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

export class DambaRepository<DS = any> {
  private DataSource: DS;

  public static _instance: DambaRepository<any>;

  private entity?: any;

  constructor(ds: DS) {
    this.DataSource = ds;
  }

  init<E>(T: Ctor<E>, tree = false): ORM<E> | ORMTREE<E> {
    const repo = this.getRepository<E>(T);
    return !tree ? new ORM<E>(repo) : new ORMTREE<E>(repo);
  }

  getRepository<E>(e: Ctor<E>) {
    if (this.DataSource) {
      return (this.DataSource as any).getRepository(e);
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
    tree = false,
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, tree);
    const statement = await crud.save(data);
    return statement;
  };

  public DCount = async (
    T: new (...args: any[]) => any,
    preds?: any,
  ): Promise<number> => {
    const crud = this.init<typeof T>(T, false);
    const statement = preds ? crud.count(preds) : crud.count();
    return statement;
  };

  public DUpdate = async (
    T: new (...args: any[]) => any,
    where: any,
    data: any,
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
    tree = false,
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, tree);
    all = !predicates ? true : all;
    return predicates ? crud.get(all, predicates) : crud.get(all);
  };

  /**
   * Generic data fetch helper for TypeORM entities, it allows to load unique data.
   *
   * 🔹 Parameters:
   * @param T      — The Entity class (constructor) you want to query.
   * @param preds  — (Optional) TypeORM-style filter or "where" object.
   * @param tree   — If true, uses tree repository behavior.
   */

  public DGet1 = async <E>(
    T: Ctor<E>,
    predicates?: any,
    tree = false,
  ): Promise<E> => {
    return this.DGet(T, predicates, false, tree);
  };

  /**
   * Generic data fetch helper for TypeORM entities, it allows to load array of data.
   * 🔹 Parameters:
   * @param T      — The Entity class (constructor) you want to query.
   * @param preds  — (Optional) TypeORM-style filter or "where" object.
   * @param tree   — If true, uses tree repository behavior.
   */
  public DGetAll = async <E>(
    T: Ctor<E>,
    predicates?: any,
    tree = false,
  ): Promise<E[]> => {
    return this.DGet(T, predicates, true, tree);
  };

  public DDelete = async (
    T: new (...args: any[]) => any,
    preds?: any,
    tree = false,
  ): Promise<any> => {
    const crud = this.init<typeof T>(T, tree);
    const statement = preds ? crud.del(preds) : crud.del();
    return statement;
  };

  async QBGetAll(
    T: new (...args: any[]) => any,
    name?: string,
    select?: any[],
    where?: { value: string; data: any },
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
    where?: { value: string; data: any },
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
      (r: any) => r.propertyName === relation,
    );
  }

  // ─── Existence ───────────────────────────────────────────────────────────────

  /**
   * Returns true if at least one row matches the predicate.
   */
  public DExists = async (
    T: new (...args: any[]) => any,
    where: any,
  ): Promise<boolean> => {
    return this.getRepository<typeof T>(T).exist({ where });
  };

  // ─── Bulk ────────────────────────────────────────────────────────────────────

  /**
   * Save an array of entities in a single call.
   */
  public DSaveMany = async <E>(
    T: Ctor<E>,
    data: Partial<E>[],
  ): Promise<E[]> => {
    return this.getRepository<E>(T).save(data as any[]);
  };

  /**
   * Insert or update based on conflict columns.
   * @param conflictPaths — column names that determine uniqueness (e.g. ['id'] or ['email'])
   */
  public DUpsert = async (
    T: new (...args: any[]) => any,
    data: any | any[],
    conflictPaths: string[],
  ): Promise<any> => {
    return this.getRepository<typeof T>(T).upsert(data, conflictPaths);
  };

  // ─── Fetch helpers ───────────────────────────────────────────────────────────

  /**
   * Find entities by an array of primary-key values.
   */
  public DFindByIds = async <E>(T: Ctor<E>, ids: any[]): Promise<E[]> => {
    return this.getRepository<E>(T).findByIds(ids);
  };

  /**
   * Find one or many entities and eagerly load the given relations.
   * @param all — true → find all, false → find one
   */
  public DGetWithRelations = async <E>(
    T: Ctor<E>,
    where: any,
    relations: string[],
    all = false,
  ): Promise<E | E[] | null> => {
    const repo = this.getRepository<E>(T);
    return all
      ? repo.find({ where, relations })
      : repo.findOne({ where, relations });
  };

  // ─── Pagination ──────────────────────────────────────────────────────────────

  /**
   * Paginated fetch. Returns items + total count in one query.
   * @param page  — 1-based page number
   * @param limit — rows per page
   */
  public DGetPage = async <E>(
    T: Ctor<E>,
    options: {
      where?: any;
      relations?: string[];
      order?: any;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    items: E[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const [items, total] = await this.getRepository<E>(T).findAndCount({
      where: options.where,
      relations: options.relations,
      order: options.order,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  };

  // ─── Soft delete / restore ───────────────────────────────────────────────────

  /**
   * Soft-delete rows matching the predicate (sets deletedAt).
   * Entity must use @DeleteDateColumn.
   */
  public DSoftDelete = async (
    T: new (...args: any[]) => any,
    where: any,
  ): Promise<any> => {
    return this.getRepository<typeof T>(T).softDelete(where);
  };

  /**
   * Restore soft-deleted rows matching the predicate.
   */
  public DRestore = async (
    T: new (...args: any[]) => any,
    where: any,
  ): Promise<any> => {
    return this.getRepository<typeof T>(T).restore(where);
  };

  // ─── Raw SQL ─────────────────────────────────────────────────────────────────

  /**
   * Execute a raw SQL query against the DataSource.
   * @param sql    — parameterised SQL string, e.g. "SELECT * FROM users WHERE id = $1"
   * @param params — bound parameter values
   */
  public DQuery = async <R = any>(
    sql: string,
    params?: any[],
  ): Promise<R[]> => {
    return (this.DataSource as any).query(sql, params);
  };

  // ─── QueryBuilder extras ──────────────────────────────────────────────────────

  /**
   * Run a QueryBuilder and return a single mapped entity (or null).
   */
  async QBGetOne<E>(
    T: new (...args: any[]) => any,
    name?: string,
    build?: (qb: any) => any,
  ): Promise<E | null> {
    let QB = this.QueryBuilder(T, name);
    if (build) QB = build(QB);
    return QB.getOne();
  }

  /**
   * Run a QueryBuilder and return the row count.
   */
  async QBCount(
    T: new (...args: any[]) => any,
    name?: string,
    where?: { value: string; data: any },
  ): Promise<number> {
    let QB = this.QueryBuilder(T, name);
    if (where) QB = QB.where(where.value, where.data);
    return QB.getCount();
  }

  /**
   * Paginated QueryBuilder — returns mapped entities + total count.
   */
  async QBGetPage<E>(
    T: new (...args: any[]) => any,
    name?: string,
    options: {
      select?: any[];
      where?: { value: string; data: any };
      order?: { column: string; direction?: "ASC" | "DESC" };
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{ items: E[]; total: number; page: number; totalPages: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    let QB = this.QueryBuilder(T, name);
    if (options.select) QB = QB.select(options.select);
    if (options.where) QB = QB.where(options.where.value, options.where.data);
    if (options.order)
      QB = QB.orderBy(options.order.column, options.order.direction ?? "ASC");
    QB = QB.skip((page - 1) * limit).take(limit);
    const [items, total] = await QB.getManyAndCount();
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
}
