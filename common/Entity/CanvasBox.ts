import { CanvasBoxAtributes } from "./CanvasBoxAtributes";


export interface CanvasBox  {
  id:string;
  entityName : string,
  stereotype?: string,
  createdBy?: string,
  updatedBy?: string,
  attributes? : CanvasBoxAtributes []
  visibility : VisibilityTypeClass;
  isAbstract? : boolean;
  isAuth? : boolean;
  extends ? : CanvasBox;
  username?: string,
  password?: string,
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export enum VisibilityTypeClass {
  PUBLIC = "public",
  PRIVATE = "private",
  PROTECTED="protected",
  IMPLEMENTATION="implementation",
}
