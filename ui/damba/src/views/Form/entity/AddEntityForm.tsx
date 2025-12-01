/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { CanvasBoxFormWizard } from "./CanvasBoxFormWizard";
import { CanvasBoxFormValues } from "./canvasBoxSchema";
import { useSessionUser } from "@/stores/authStore";
import { addEntityApi, updateEntityApi } from "@/services/canvasBox";
import { CanvasBox, CanvasBoxDiagramConfig, CanvasBoxMapConfig } from "../../../../../../common/Entity/CanvasBox";


function AddEntityForm() {
  const [canvasBox, setCanvasBox] = useState<CanvasBox>();
  const user = useSessionUser((state) => state.user);

   const handleSaveStep = async (step: number, values: CanvasBoxFormValues) => {
    try {
        if (step === 1) {
      // CREATE on server
      const payload = {
        entityName: values.entityName,
        stereotype: values.stereotype,
        description: values.description,
        extendsId: values.extendsId,
        ...user.currentSetting
      } as Partial<CanvasBox>
      const created = await addEntityApi(payload); // your API call
      setCanvasBox(created);
    } else {
      if (!canvasBox) return; // should not happen if step 1 succeeded
      // UPDATE on server – you can decide how much you send
      const payload: Partial<CanvasBoxFormValues> = {};
      if (step === 2) {
        payload.mapConfig = values.mapConfig as CanvasBoxMapConfig;
      } else if (step === 3) {
        payload.diagramConfig = values.diagramConfig as CanvasBoxDiagramConfig;
      } else if (step === 4) {
        payload.attributes = values.attributes;
      } else if (step === 5) {
        payload.classification = values.classification;
        // parse rules JSON if needed
        // payload.rules = values.rules ? JSON.parse(values.rules) : undefined;
        payload.mixins = values.mixins;
      }
      await updateEntityApi(canvasBox.id, payload); // your API call
    }
    } catch (error: any) {
       console.log(error)
       throw error;
    }
  
  };

 const handleFinish = async (values: CanvasBoxFormValues) => {
    
  };

  const onCancel = async () => {
    
  };
  return (
    <>
    <div>
        <CanvasBoxFormWizard
          onSaveStep={handleSaveStep}
          onFinish={handleFinish}
          onCancel={onCancel}
        />
    </div>
    </>
   
  )
}

export default AddEntityForm