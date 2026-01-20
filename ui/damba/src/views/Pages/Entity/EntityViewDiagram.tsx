/* eslint-disable react/no-children-prop */
import React, { useEffect, useState } from 'react'
import { useEntityStore } from '@/stores/useEntityStore'
import { useWindowSize } from '@/utils/hooks/useWindowSize'
import { EntityScene } from '@/views/Canvas/entityScene'
import JsonDiagram from '@/views/Canvas/JsonDiagram'
import AddProject from '@/views/components/Layout/ShowPopupOnClick'
import AddEntityForm from '@/views/Form/entity/AddEntityForm'
import { useModuleStore } from '@/stores/useModuleStore'

function EntityViewDiagram() {
    const entities = useEntityStore((s) => s.entities)
    const [scene, setScene] = useState<EntityScene>()
    const { width, height } = useWindowSize()
    const module = useModuleStore((s) => s.module)
    useEffect(() => {
        // console.log(entities)
        setScene(undefined)
        if (entities.length > 0) {
            setScene({ canvasBoxes: entities } as EntityScene)
        }
    }, [entities, module])
    return (
        <>
            {' '}
            {scene && (
                <>
                    <div className=" mb-2">
                        <span className=" text-xs">
                            <AddProject
                                size={{
                                    width: width * 0.9,
                                    height: height * 0.9,
                                }}
                                children={<AddEntityForm />}
                                title={'Add Entity'}
                                btnText={'Create your first entity'}
                            />
                        </span>
                    </div>
                    <JsonDiagram scene={scene}></JsonDiagram>
                </>
            )}
            {!scene && (
                <>
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="mr-4 mb-1">
                            <span className=" ml-1 text-xs">
                                <AddProject
                                    size={{
                                        width: width * 0.9,
                                        height: height * 0.9,
                                    }}
                                    children={<AddEntityForm />}
                                    title={'Add Entity'}
                                    btnText={'Create your first entity 2'}
                                />
                            </span>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default EntityViewDiagram
