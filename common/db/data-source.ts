

export const AppDataSource = <DataSource, Entity> (DT: new (...args: any[]) => any, p: any , entities: Entity, subscribers?:[], migrations?:[]) => { 
  return new Promise<DataSource> ((resolve, reject) => {
   console.log(p);
   new DT({
      type: "postgres",
      host: p.DB_HOST+'',
      port: Number(p.DB_PORT),
      username: p.DB_USER+'',
      password: p.DB_PASSWORD+'',
      database: p.DB_NAME+'',
      synchronize: true,
      logging: true,
      entities,
      subscribers,
      migrations
     }).initialize()
     .then((bd: any) => {
        resolve(bd);
     })
     .catch((error: any) => reject(error));
  });
  };