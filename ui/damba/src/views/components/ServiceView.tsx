import { useAppServiceStore } from "@/stores/ServiceStore"
import ShowServices from "./ShowServices"
import { EntityProvider } from "@/providers/EntityProvider"
import EntityView from "./EntityView"
import { fetchEntitiesByServiceId } from "@/services/Service"


interface Props {

}
function ServiceView() {
 const services = useAppServiceStore((s) => s.services)
 const service = useAppServiceStore((s) => s.service);
 console.log(service);
  return (
    <>
    {service && <>
         <EntityProvider  fetchEntitiesByServiceId={fetchEntitiesByServiceId}>
             <EntityView/>
         </EntityProvider>
    </>}
     { !service && <>
         <ShowServices/>
    </>}
       
    </>
  )
}

export default ServiceView