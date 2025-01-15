
import { Request, Response } from "express";
import { Categorie } from "../entity/Categorie";


const services = {
home : async (req: Request, res: Response) => {
const categorieRepository = req.DB.getTreeRepository(Categorie);
const categorie = new Categorie();
categorie.name = req.body.name;
categorie.icon = req.body.icon;
categorie.description = req.body.description;
categorie.type_categorie = req.body.type;
categorie.type_ent = req.body.type_ent;
console.log(req.body);
if(req.body.parent && req.body.parent!=""){
  const c = await categorieRepository.findOneBy({ id: req.body.parent });
  if (c) {
   categorie.parent = c; 
  }
}
const cat = await categorieRepository.save(categorie);
res.send(cat);
},

list : async (req: Request, res: Response) => {
    const categorieRepository = req.DB.getTreeRepository(Categorie);
    const categories = await categorieRepository.findTrees();
    res.send(categories);
},
listByTypeCat : async (req: Request, res: Response) => {
try{
  const categorieRepository = req.DB.getRepository(Categorie);
  const categories = await categorieRepository.find({
    where: { type_categorie: req.params.name }
  });
  return res.send(categories);
} catch (error) {
  console.log(error)
  return res.status(404).send(error);
}
},
del : async (req: Request, res: Response) => {
  const categorieRepository = req.DB.getTreeRepository(Categorie);
  const c = await categorieRepository.findOneBy({ id: req.params.id });
  if (c) {
   const c = await categorieRepository.delete(req.params.id);
    res.send(c);
  } else {
    throw new Error(`ID: ${req.params.id} not found !`); 
  }
}
};
export default services;
