export interface ICrud {
  add?:(req: any,res: any)=>{};
  del?:(req: any,res: any)=>{};
  show?:(req: any,res: any)=>{};
  edit?:(req: any,res: any)=>{};
}