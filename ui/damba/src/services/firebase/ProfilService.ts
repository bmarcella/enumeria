/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDoc } from "firebase/firestore";
import { getProfilDoc } from "../Docs";

export const getProfilById = async (id: string) => {
       const ref = getProfilDoc(id);
       const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
           return { id: docSnap.id, ...docSnap.data() };
         } else {
           return null;
         }
  };