import { getDambaFiles } from '@/services/helper';
import IDE from '@/views/IDE'
import { ServerFile } from '@/views/IDE/fileHelper';
import { useEffect, useState } from 'react'



function DambaEditorView() {
    const [files, setFiles] = useState<ServerFile []>();
    useEffect(()=>{
        getDambaFiles().then((res : ServerFile [] )=>{
          setFiles(res);
        })
    },[]);
    return (<>
    { files && <IDE serverFiles={files}></IDE> }
    </>)
}

export default DambaEditorView
