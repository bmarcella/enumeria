
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    User,
} from '@/@types/auth'
import FirebaseAuth from './firebase/FirebaseAuth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, updateProfile,   sendEmailVerification, } from 'firebase/auth'
import { addDoc, CollectionReference, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { Proprio } from '@/views/Entity'
import {  getApp } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { USER_ROLE } from '@/views/shared/schema';
import { ProfilDoc } from './Docs'


export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

export async function getProprioById(id: string) {
    try {
        const Ref = ProfilDoc as CollectionReference<Proprio>;
        const q = query(Ref, where('id_user', '==', id));
        const querySnapshot = await getDocs(q);
        const users: (Proprio & { id: string })[] = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        if (users.length === 0 ) {
            throw new Error('No entity for this User');
        }
        if (users.length > 1 ) {
            throw new Error('User has more than one entity');
        }
        return users[0];
    }  catch (error) {
        console.error('Error fetching user by ID:', error);
        throw new Error('User has no associated entity');
    }
}



export async function apiSignIn(data: SignInCredential) {
    try {
        const resp = await signInWithEmailAndPassword(FirebaseAuth, data.email, data.password) ;
        const user = resp.user;
        const token = await resp.user.getIdToken();
        const proprio = await getProprioById(user.uid);
        if (!proprio)  throw new Error('Votre compte n\'est pas actif, veuillez contacter l\'administrateur');
        if (!proprio.active)  throw new Error('Votre compte n\'est pas actif, veuillez contacter l\'administrateur');
        const customUser: User = {
            userId: resp.user.uid,
            avatar: user.photoURL,
            userName: user.displayName,
            email: user.email,
            authority: [(proprio.type_person) ? proprio.type_person : 'user' as USER_ROLE], 
            proprio: proprio,
            active: proprio.active,
            proprioId: proprio.id,
            currentOrg: proprio.currentOrg,
            currentProject: proprio.currentProject
          };
        return {
            token,
            user: customUser,
        };
    } catch (error: any) {
        console.error( error);
        throw new Error("Email ou mot de passe incorrect");
    }
}


export async function apiSignUpWithVerification(data: SignUpCredential) {
  try {
        const userCreds = await createUserWithEmailAndPassword(FirebaseAuth, data.email, data.password);
        const user = userCreds.user;
        const profil: any = {
            id: '',
            fullName: data.fullName,
            id_user: user.uid,
            type_person: 'user' as USER_ROLE,
            email: data.email,
            active: true,
            createdAt: new Date(),
            createBy: user.uid,
            updateBy: user.uid,
          };
        const docRef = await addDoc(Profil, profil);
        profil.id = docRef.id;
        await updateDoc(docRef, {id: docRef.id});
        await updateProfile(user, { displayName : data.fullName });
        const actionCodeSettings = {
         url: "http://localhost:5173/verified", // must be in Firebase Console authorized domains
         handleCodeInApp: true,
        };
        await sendEmailVerification(user, actionCodeSettings);
        return {
          error: false,
          message : '',
          data: user
        }
     } catch(e: any) {
      console.log(e);
      return {
        error: true,
        message: ""
      }
    }
}


export async function apiSignUpInside(data: SignUpCredential,type_entity: string) {
    try {
        const userCreds = await createUserWithEmailAndPassword(FirebaseAuth, data.email, data.password);
        const user = userCreds.user;
        const landlord: any = {
            id: '',
            fullName: data.fullName,
            id_user: user.uid,
            type_person: 'user' as USER_ROLE,
            email: data.email,
            active: false,
            createdAt: new Date(),
            createBy: user.uid,
            updateBy: user.uid,
            currentProject: '',
            currentOrg: ''
          };
        const docRef = await addDoc(ProfilDoc, landlord);
        landlord.id = docRef.id;
        await updateDoc(docRef, {id: docRef.id});
        await updateProfile(user, { displayName : data.fullName });
        await user.reload();
        const customUser: User = {
          userId: user.uid,
          avatar: user.photoURL,
          userName: user.displayName,
          email: user.email,
          authority: [type_entity],
          proprioId: null,
          proprio: landlord,
          currentOrg: '',
          currentProject: ''
        };
          return customUser;
       } catch (error: any) {
        console.error("Error registering user:", error.message);
      }
}

const changeMyPassword = async (newPassword: string)  => {
    const user = FirebaseAuth.currentUser;
    let error ;
    if (user) {
      try {
        await updatePassword(user, newPassword);
        return {
            message: 'Password updated successfully',
            error: false
        };
      } catch (e) {
        console.error("Error updating password:", e);
        if (e instanceof Error) {
            error = e.message;
         } else {
            error = 'An unknown error occurred';
         }
    }
   }
    else {
       console.error("No user is logged in.");
       error = 'No user is logged in.';
    }
    return {
        message: error,
        error: true
    };
  };

  export const updateUserPassword = async (uid: string, newPassword: string) => {
    const functions = getFunctions(getApp());
    const updateUserPassword = httpsCallable(functions, 'updateUserPassword');
    try {
      const result = await updateUserPassword({ uid, newPassword });
    } catch (error) {
      console.error('Error:', error);
    }
  };
