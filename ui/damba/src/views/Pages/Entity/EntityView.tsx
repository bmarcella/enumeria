import { EntityProvider } from '@/providers/EntityProvider'
import { fetchEntitiesByServiceId } from '@/services/Service'
import EntityViewDiagram from './EntityViewDiagram'

function EntityView() {
    
  return (
    <div>
        <>
            <EntityProvider fetchEntitiesByServiceId={fetchEntitiesByServiceId}> 
                    <EntityViewDiagram/>
           </EntityProvider> 
       </>
    </div>
  )
}

export default EntityView