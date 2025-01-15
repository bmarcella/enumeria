import { corsOptions } from '../cors/index';
import { servicesApp } from '../index/Frontend';
import { Service } from '../index/services';
const EurekaTools = <Eureka>(E: new (...args: any[]) => Eureka, p?: any): any => {

  const EurekaStart = (EurekaClient: any): Promise<Eureka> => {
    return new Promise((resolve, reject) => {
      EurekaClient.start((error: any) => {
        if (error) reject(error)
        else {
          resolve(EurekaClient);
        }
      });
    })
  }
  const EurekaClose = (eurekaClient: any) => {
    eurekaClient.stop(() => {
      console.log('Déconnecté de Eureka, arrêt du service');
      process.exit();
    });
  };

  const config = SERVICE_CONFIG(p);
  const EurekaClient = new E(config);
  return {
    EurekaClient,
    EurekaStart,
    EurekaClose
  };
}


const EurekaConfig = (p: any) => {
  return {
    host: p.EUREKA_HOST+"" ,
    port: Number(p.EUREKA_PORT),
    servicePath: p.EUREKA_PATH + "",
  }
}
const SERVICE_CONFIG = (p: any): any => {
  const EC = EurekaConfig(p);
  const config = {
    instance: {
      app: p.SERVICE_NAME + "",
      hostName: p.HOST + "",
      ipAddr: "dynamic",
      port: {
        '$': Number(p.PORT), // Le port sur lequel votre service s'exécute
        '@enabled': true,
      },
      vipAddress: p.SERVICE_NAME + "",
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: EC,
  };
  return  config;
}


const setProxies = <E, Eureka>(p: any, ET: any, express: any, cors: any, eurekaClient: any, _s?: Service[], createProxyMiddleware?: any) => {

  ET.EurekaStart(ET.EurekaClient).then((eurekaClient: Eureka) => {
    let app = express();
    _s?.forEach(s => {

      //  fetchServiceUrl(s.name, eurekaClient);
      app.use(s.path, (req: any, res: any, next: any) => {
        let instances = ET.EurekaClient.getInstancesByAppId(s.name);
        let serviceUrl = '';
        if (instances.length > 0) {
          const instance = instances[0];
          serviceUrl = `http://${instance.hostName}:${instance.port.$}`;
        }
        if (serviceUrl) {
          const proxy = createProxyMiddleware({
            target: serviceUrl,
            changeOrigin: false,
          });
          proxy(req, res, next);
        } else {
          res.status(502).send('Service ' + s.name + ' indisponible : ' + serviceUrl);
        }
      });

    });


    const port = p.PORT;
    const dev = Number(p.DEV);
    if(dev==1)
    app.use(cors(corsOptions));
    else
    app.use(cors());


    app.get('/applications', (req: any, res: any) => {
      res.status(200).send(servicesApp);
    });

    app.get('/application/:name', (req: any, res: any) => {
      res.status(200).send(servicesApp[req.params.name]);
    });

    app.listen(port, () => {
      console.log(`[server]: Server ${p.SERVICE_NAME} is running at http://localhost:${port}`);
    });
    process.on('SIGINT', () => { ET.EurekaClose(eurekaClient) });
    process.on('SIGTERM', () => { ET.EurekaClose(eurekaClient) });
    console.log('Eureka client started');
  }).catch((error: any) => {
    console.log(error);
  });

}

const Run = <Eureka>(p: any, ET: any, app: any) => {
  ET.EurekaStart(ET.EurekaClient).then((eurekaClient: Eureka) => {
    const port = p.PORT;
    app.listen(port, () => {
      console.log(`[server]: Server ${p.SERVICE_NAME} is running at http://localhost:${port}`);
    });
    process.on('SIGINT', () => { ET.EurekaClose(eurekaClient) });
    process.on('SIGTERM', () => { ET.EurekaClose(eurekaClient) });
    console.log('Eureka client started');
  }).catch((error: any) => {
    console.log(error);
  });
}

export { EurekaTools, Run, Service, SERVICE_CONFIG, setProxies };

