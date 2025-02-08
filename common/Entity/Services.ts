import { CanvasBox } from './CanvasBox';
import { Contributor } from './Contributor';
export default interface Service {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  Contributors?: Contributor[];
  canvasBoxes: CanvasBox[];
}
