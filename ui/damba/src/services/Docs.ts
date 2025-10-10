

import { collection, doc  } from 'firebase/firestore';
import db from "@/services/firebase/FirebaseDB";
const profil = "profil"
const bankImage = "BankPictures";
const bank = "bank";
const bankLease = "BankLease";
const bankComments = "BankComments";
const landlordPictures = "LandlordPictures";
const historicDecision = "HistoricDecision";
const historicSteps = "HistoricSteps";
const task = "BankTasks";
const contracts = "contracts";
const reqPictures = "RequetePictures";
const Expenserequest = "ExpenseRequest";
const otherBankPictures = "OtherBankPictures";
// 
export const contractsDoc  = collection(db, contracts);
export const TaskDoc  = collection(db, task);
export const hStepsDoc   = collection(db, historicSteps);
export const ProfilDoc   = collection(db, profil);
export const BankDoc   = collection(db, bank);
export const BankLeaseDoc   = collection(db, bankLease);
export const hdDoc   = collection(db, historicDecision);
export const bankPicturesDoc = collection(db, bankImage);
export const otherBankPicturesDoc = collection(db, otherBankPictures);
export const LandlordPicturesDoc = collection(db, landlordPictures);
export const bankCommentsDoc = collection(db, bankComments);
export const taskCollection = collection(db, task);
export const ExpenseRequestDoc = collection(db, Expenserequest)
export const ReqPicturesDoc = collection(db, reqPictures);

export const getOtherBankPicturesRef = (id: string ) => {
     return doc(db, otherBankPictures, id);
}

export const getExpenseRequestDoc = (id: string ) => {
     return doc(db, Expenserequest, id);
}

export const getReqPicturesRef = (id: string ) => {
     return doc(db, reqPictures, id);
}

export const getBankDoc = (id: string ) => {
     return doc(db, bank, id);
}

export const getProfilDoc = (id: string ) => {
     return doc(db, profil, id);
}

export const getBankPictureRef = (id: string ) => {
     return doc(db, bankImage, id);
}

export const getLandlordPicturesRef = (id: string ) => {
     return doc(db, landlordPictures, id);
}

export const getBankTask = (id: string ) => {
     return  doc(db, task, id);
}

export const getContratDoc = (id: string ) => {
     return  doc(db, contracts, id);
}