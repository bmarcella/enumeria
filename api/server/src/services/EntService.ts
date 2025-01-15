
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { ILike, In } from "typeorm";
import { Adresse } from "../entity/Adresse";
import { EntApp } from "../entity/EntApp";
import { EntAppToken } from "../entity/EntAppToken";
import { Entreprise } from "../entity/Entreprise";
import { secretKey } from "./CTService";

export const monkata_auth_url = "auth";
const services = {
  changeLogo: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: { userId: keycloakId }
      });
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  update: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: { userId: keycloakId }
      });
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  delete: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const id = req.params.id;
      console.log("ID_ENT -> ",id);
      const entrepriseRepository = req.DB.getRepository(Entreprise);

      const one = await entrepriseRepository.findOne({
        where: { id : id  },
        relations: ["adresses"]
      });

      if (one.keycloakId !== keycloakId ) res.status(500).send({ message: "Vous ne pouvez pas supprimer cette entreprise!" });
      const adresseRepository = req.DB.getRepository(Adresse);

      if (one.adresses.length > 0) {
          await adresseRepository.remove(one.adresses);
      }
      await entrepriseRepository.remove(one); 
      res.send({ message: "success" });
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  getAllForAdmin: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: { userId: keycloakId }
      });
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  getAll: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: { userId: keycloakId }
      });
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  getAllWithAdress: async (req: Request, res: Response) => {  
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: { userId: keycloakId },
        relations: ["adresses"] 
      });
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  add: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const cents = await entrepriseRepository.count({
        where: { userId: keycloakId }
      });
      let   ents = new Entreprise();
      ents.name = req.body.name;
      ents.categorie = req.body.categorie;
      ents.description = req.body.description;
      ents.telephone_a = req.body.telephone_a;
      ents.telephone_b = req.body.telephone_b;
      ents.email_contact = req.body.email_contact;
      let  add = new Adresse();
      const adRepository = req.DB.getRepository(Adresse);
      add.name = (cents>0) ?"Area_"+ new Date() : "Central";
      add.default = (cents>0) ? true : false;
      add.country = req.body.adresse.country;
      add.etat = req.body.adresse.state;
      add.rue = req.body.adresse.street;
      add.etat = req.body.adresse.state;
      add = await adRepository.save(add);
      ents.userId = keycloakId;
      ents.adresses = [add];
      ents = await entrepriseRepository.save(ents);
      try {
        const ae = new EntApp();
        ae.appName = req.body.appName;
        ae.entId = ents.id;
        ae.tokenEA = services.generateToken ({ appName:req.body.appName, entId : ents.id });
        const eRepository = req.DB.getRepository(EntApp);
        await eRepository.save(ae);
      } catch(e) {
        console.log(e);
      }
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  // function to add APP Ent
  addEntApp: async (req: Request, res: Response) => {
    let  ae = new EntApp();
    ae.appName = req.body.appName;
    ae.entId = req.body.idEnt;
    ae.tokenEA = services.generateToken ({ appName:req.body.appName, entId :req.body.idEnt  });
    const eRepository = req.DB.getRepository(EntApp);
    ae = await eRepository.save(ae);
    res.send(ae);
  },
  getEntApp: async (req: Request, res: Response) => {
    const id = req.body.idEnt;
    const eRepository = req.DB.getRepository(EntApp);
    const aes = await eRepository.findAll({
      where : { entId: id }
    });
    res.send(aes);
  },
  generateToken: (ae: any) => {
    const token = jwt.sign({ ...ae, timestamp: new Date().getTime() }, secretKey);
    return token;
  },
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ent = await entrepriseRepository.findOne({
        where: { id }
      });
      res.send(ent);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  getByIdSec: async (req: Request, res: Response) => {
    try {
      const id = Number(req.payloadEnt.obj.entId);
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ent = await entrepriseRepository.findOne({
        where: { id },
        relations: ["adresses"] 
      });
      if(ent.id == id ) { 
        res.status(200).send(ent);
      } else {
        res.status(401).send({ message:"Something went wrong"});
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }
  },

  getListById: async (req: Request, res: Response) => {
    try {
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: {
            id: In(req.body.ids) 
        }
    });
      res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  getAllWithAdressPage: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.payload?.sub;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ents = await entrepriseRepository.find({
        where: { userId: keycloakId },
        relations: ["adresses"] 
      });

      return res.send(ents);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  editAdresse: async (req: Request, res: Response) => {
    try {
      const adRepository = req.DB.getRepository(Adresse);
      const id = req.params.id ;
      let ad : Adresse = await adRepository.findOne({
        where: {
            id 
        }
    });
    console.log("DATA", req.body);
    ad.name = req.body.name;
    ad.country = req.body.country;
    ad.ville = req.body.ville;
    ad.rue = req.body.rue;
    ad.etat = req.body.etat;
    ad = await adRepository.save(ad);
    res.send(ad);
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  addAdresse: async (req: Request, res: Response) => {
  try {
      const entRepository = req.DB.getRepository(Entreprise);
      const ent = await entRepository.findOne({
        where: { id: req.params.id }
      });
      const adRepository = req.DB.getRepository(Adresse);
      let ad = new  Adresse ();
      ad.name = req.body.name;
      ad.country = req.body.country;
      ad.ville = req.body.ville;
      ad.rue = req.body.rue;
      ad.etat = req.body.etat;
      ad.default = false;
      ad.entreprise = ent;
      ad = await adRepository.save(ad);
      return res.send(ad);
  } catch (error) {
      console.log(error)
      return res.status(500).send(error);
  }

  },
  edit: async (req: Request, res: Response) => {
    try {
      const entRepository = req.DB.getRepository(Entreprise);
      const keycloakId = req.payload?.sub;
      const id = req.params.id;
          let ents : Entreprise = await entRepository.findOne({
        where: { id }
      });

      if (ents.userId != keycloakId) res.status(500).send({ message : "UNAUTHORIZE", id_user : ents.userId, keycloakId : keycloakId  }); 
      const part = true ;
      if(part){
      ents.compagnie_size = req.body.compagnie_size;
      ents.website = req.body.website ;
      ents.telephone_a = req.body.telephone_a;
      ents.telephone_b = req.body.telephone_b;
      ents.email_contact = req.body.email_contact;
      ents.year_founded = req.body.year_founded;
      }

      if(part){
        ents.description = req.body.description;
        ents.slogan = req.body.slogan;
        ents.objectif = req.body.objectif;
        ents.vision = req.body.vision;
      }

      ents = await entRepository.save(ents);
      res.send(ents);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
  count: async (req: Request, res: Response) => {
    try {
      const keycloakId = req.params.id;
      const entrepriseRepository = req.DB.getRepository(Entreprise);
      const ent = await entrepriseRepository.count({
        where: { userId: keycloakId }
      });
      console.log(ent)
      res.send({count: ent});
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },
  countAdresse: async (req: Request, res: Response) => {
    try {
    const keycloakId = req.params.id;
    const wh = "t1.entreprise.id = t2.id AND t2.userId='"+keycloakId+"'"; 
    const post = await req.DB.getRepository(Adresse)
    .createQueryBuilder("t1")
    .from(Entreprise, "t2") // Jointure cartésienne
    .where(wh) // Clause WHERE basée sur une colonne commune
    .getCount();
     return res.send({post});
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }

  },

  getEntByPage: async (req: Request, res: Response) => {
    const NPage = 10;
    const page = Number(req.params.page);
    const skip = (page - 1) * NPage;
    const { query } = req.body;
    try {
      const jobsRepository = req.DB.getRepository(Entreprise);
      const queryBuilder = jobsRepository.createQueryBuilder('entreprise');
       if (query) {
        queryBuilder.where( { name: ILike(`%${query}%`)  });
        console.log("CALL IT :"+query);
        // queryBuilder.orWhere( {description : Like(`%${query}%`) });
       } 
      const  objs : Entreprise [] = await queryBuilder
      .orderBy("entreprise.created_at", "DESC")
      .skip(skip)
      .take(NPage)
      .getMany();
    const objs2 = await queryBuilder.getCount();
    const totalPage =  Math.ceil(objs2/NPage);
    const pages = [];
    for(let i = 1; i<= totalPage; i++) {
      pages.push(i);
    }
    const pagination = { totalObj : objs2, totalPage, pages, currentPage: page };
    res.send({ objs, pagination});
    } catch (error) {
      console.log(error)
      return res.status(500).send(error);
    }
  },

  setApprove: async (req: Request, res: Response) => {
    const jobsRepository = req.DB.getRepository(Entreprise);
    const id: any = req.params.id;
    const state: any = Boolean(req.params.state);
    let obj: Entreprise = await jobsRepository.findOne({
      where: { id : id }
    });
    if (!obj) return  res.status(404).send({ message: "Entreprise non trouvé"});
    obj.approuved = state ;
    obj = await jobsRepository.save(obj);
    res.status(200).send(obj);
  },

  loginEnt: async (req: Request, res: Response) => {
    const id: any = req.params.idEnt;
    const keycloakId = req.payload?.sub;
    const app: any = req.params.appName;
    console.log(keycloakId);
    if(!keycloakId)  return res.status(404).send({ message: "Unauthorized Access",keycloakId });
    const eRepository = req.DB.getRepository(Entreprise);
    const ent: Entreprise = await eRepository.findOne({
      where: { id : id }
    });
    if (!ent) return  res.status(404).send({ message: "Entreprise non trouvé"});

    if (ent.userId != keycloakId) return res.status(404).send({ message: "Unauthorized Access"});
    
    const jobsRepository = req.DB.getRepository(EntApp);
  
    let obj:EntApp  = await jobsRepository.findOne({
      where: {
         entId : id,
         appName : app
        }
    });  
    if (!obj){
      try {
        const ae = new EntApp();
        ae.appName = app;
        ae.entId = ent.id;
        ae.tokenEA = services.generateToken ({ appName:req.body.appName, entId : ent.id });
        const eRepository = req.DB.getRepository(EntApp);
        obj = await eRepository.save(ae);
      } catch(e) {
        return  res.status(500).send({ message: "Erreur serveur "});
      }
    }

    if (!obj.id)  res.status(500).send({ message: "Erreur serveur "});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try {
      const aetRepository = req.DB.getRepository(EntAppToken);
      let aet: EntAppToken = new EntAppToken ();
      aet.id_user = keycloakId;
      aet.EntAppId = obj.id;
      aet.token = services.generateToken ({ obj });
      aet = await aetRepository.save(aet);
      res.status(200).send({appEnt: obj , token: aet });
    } catch (error) {
      res.status(500).send(error);
    }
  
  },
  countEnt: async (req: Request, res: Response) => {
    try {
      const id = Number(req.payloadEnt.obj.entId);
      const wh = "t1.entreprise.id = t2.id AND t1.entreprise.id='"+id+"'";
      const post = await req.DB.getRepository(Adresse)
      .createQueryBuilder("t1")
      .from(Entreprise, "t2") // Jointure cartésienne
      .where(wh) // Clause WHERE basée sur une colonne commune
      .getCount();
       return res.send({ad: post});
      } catch (error) {
        console.log(error)
        return res.status(500).send(error);
      }

  },
 
};
export default services;
