/* eslint-disable react/no-children-prop */
import React, { useEffect, useState } from 'react'
import { EntityScene } from '../Canvas/entityScene'
import JsonDiagram from '../Canvas/JsonDiagram'
import { useEntityStore } from '@/stores/useEntityStore'
import AddProject from './AddProject';
import AddEntityForm from '../Form/entity/AddEntityForm';
import { useWindowSize } from '@/utils/hooks/useWindowSize';

function EntityView() {
const entities = useEntityStore((s) => s.entities);
console.log(entities);
     const [scene, setScene] = useState<EntityScene>()
     const { width, height} = useWindowSize();
       useEffect(() => {
        if(entities.length>0){
           setScene({ canvasBoxes: entities } as EntityScene)
        }
  }, [entities]);
  return (
    <>  { scene &&
           <>
            <div className=" mb-2">
                        <span className=" text-xs">
                        <AddProject
                            size={ { width: width*0.90, height: height*0.90 } }
                            children={<AddEntityForm />}
                            title={'Add Entity'}
                            btnText={'Create your first entity'}
                        />
                        </span>
              </div>
              <JsonDiagram scene={scene}></JsonDiagram>
                
           </>
        }
        { entities.length==0 && 
        <>
            <div className="flex items-center justify-center h-full w-full">
                    <div className="mr-4 mb-1">
                        <span className=" ml-1 text-xs">
                        <AddProject
                            size={ { width: width*0.90, height: height*0.90 } }
                            children={<AddEntityForm />}
                            title={'Add Entity'}
                            btnText={'Create your first entity'}
                        />
                        </span>
                    </div>
             </div>

        </>
        }
    </>
  )
}

export default EntityView