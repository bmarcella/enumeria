/* eslint-disable @typescript-eslint/no-explicit-any */
import { addDoc, CollectionReference, deleteDoc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { BankLeaseDoc, bankPicturesDoc, getBankDoc, getExpenseRequestDoc, getLandlordDoc, hdDoc, hStepsDoc, LandlordPicturesDoc, otherBankPicturesDoc, ReqPicturesDoc, TaskDoc } from "../Docs";
import { BankImage } from "@/views/bank/show/components/ImageGallery";
import { ref, deleteObject, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "./FirebaseStorage";
import {  StepDecision } from "@/views/Entity";
import { ReqImage } from "@/views/request/components/ImageReqComp";
import { ContractSignedImage } from "@/views/bank/show/components/ImageContratSigned";

export const getBankById = async (bankId: string) => {
    const bankRef = getBankDoc(bankId);
    const docSnap = await getDoc(bankRef);
  
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
     } else {
       return null;
     }
  };
  export const updateBankById = async (bankId: string, data: any) => {
    try {
     const docRefs = getBankDoc(bankId) as any;
           await updateDoc(docRefs, data);
           return true;
      } catch (error) {
       console.error("Error updating document: ", error);
       throw new Error("Error updating document: " + error);
       return false;
    }
  };

  export const addStepsHistory = async ( data: any) => {
    try {
         const docRef = await addDoc(hStepsDoc, data);
        return docRef.id;
      } catch (error) {
       console.error("Error adding document: ", error);
       throw new Error("Error adding document: " + error);
       return false;
    }
  };

  export const addBankTask = async ( data: any) => {
    try {
        const docRef = await addDoc(TaskDoc, data);
        return docRef.id;
      } catch (error) {
       console.error("Error adding document: ", error);
       throw new Error("Error adding document: " + error);
       return false;
    }
  };


  export const addDecisionHistory = async ( data: any) => {
    try {
         const docRef = await addDoc(hdDoc, data);
        return docRef.id;
      } catch (error) {
       console.error("Error adding document: ", error);
       throw new Error("Error adding document: " + error);
       return false;
    }
  };

  export const addBankLease= async ( data: any) => {
    try {
         const docRef = await addDoc(BankLeaseDoc, data);
        return docRef.id;
      } catch (error) {
       console.error("Error adding document: ", error);
       throw new Error("Error adding document: " + error);
       return false;
    }
  };

  export  const getBankStepsHistory = async (bankId: string) => {
    const stepsRef = hStepsDoc as CollectionReference<StepDecision>;
    const q = query(stepsRef, where('bankId', '==', bankId));
    const querySnapshot = await getDocs(q);
    const objs = querySnapshot.docs.map(doc => {
        const id = doc.id;
        const obj  = {
            id,
        ...doc.data(),
        } as StepDecision;
        obj.id = id;
        return obj;
    });
    return objs; 
};

  export  const getBankImages = async (bankId: string) => {
          const picturesRef = bankPicturesDoc as CollectionReference<BankImage>;
          const q = query(picturesRef, where('bankId', '==', bankId));
          const querySnapshot = await getDocs(q);
          const images = querySnapshot.docs.map(doc => {
              const id = doc.id;
              const imgBank = {
                  id,
              ...doc.data(),
              } as BankImage;
              imgBank.id = id;
              return imgBank;
          });
          return images; 
};

export  const getReqImages = async (reqId: string) => {
  const picturesRef = ReqPicturesDoc as CollectionReference<ReqImage>;
  const q = query(picturesRef, where('reqId', '==', reqId));
  const querySnapshot = await getDocs(q);
  const images = querySnapshot.docs.map(doc => {
      const id = doc.id;
      const img = {
          id,
      ...doc.data(),
      } as ReqImage;
      img.id = id;
      return img;
  });
  return images; 
};
export  const getOtherImages = async (id: string) => {
    const picturesRef = otherBankPicturesDoc as CollectionReference<ContractSignedImage>;
    const q = query(picturesRef, where('bankId', '==', id));
    const querySnapshot = await getDocs(q);
    const images = querySnapshot.docs.map(doc => {
        const id = doc.id;
        const img = {
            id,
        ...doc.data(),
        } as ContractSignedImage;
        img.id = id;
        return img;
    });
    return images; 
};

export  const getLordImages = async (lordId: string) => {
    const picturesRef = LandlordPicturesDoc as CollectionReference<BankImage>;
    const q = query(picturesRef, where('lordId', '==', lordId));
    const querySnapshot = await getDocs(q);
    const images = querySnapshot.docs.map(doc => {
        const id = doc.id;
        const img = {
            id,
        ...doc.data(),
        } as BankImage;
        img.id = id;
        return img;
    });
    return images; 
};

 export const deleteImageFromStorage = async (imageUrl: string) => {
        const decodedPath = decodeURIComponent(
          imageUrl.split('/o/')[1].split('?')[0]
        );
        const imageRef = ref(storage, decodedPath);
        await deleteObject(imageRef);

};

export const uploadImageToStorage = async (file: File, path: string , where="banks") => {
    try {
        const d = new Date().toDateString();
        const fileName = `${d}_${file.name}`;
        const fileRef = ref(storage, `${where}/${path}/ ${fileName}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        return { url, fileName };
    } catch (error) {
        throw new Error('Error uploading image: ' + error);
    }  
};

export const deleteBank = async (bankId: string ) => {
  const docRef = getBankDoc(bankId);
  await deleteDoc(docRef);
};

export const deleteReqType = async (id: string ) => {
  const docRef = getExpenseRequestDoc(id);
  await deleteDoc(docRef);
};

export const deleteLord = async (bankId: string ) => {
  const docRef = getLandlordDoc(bankId);
  await deleteDoc(docRef);
};

