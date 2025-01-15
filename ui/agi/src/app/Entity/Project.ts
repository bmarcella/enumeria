import { Contributor } from './Contributor';
import Services from './Services';

export default interface Projects {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  Contributors?: Contributor[];
  services: Services[];
}
