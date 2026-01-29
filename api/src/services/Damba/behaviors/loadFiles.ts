/* eslint-disable @typescript-eslint/no-unused-vars */

import { DEvent } from '@App/damba.import';
import DambaCoreCode from '@App/entities/DambaCoreCode';
import { IDambaFile, LoadFiles } from '@Damba/v2/helper/readFile';
import { Behavior, DambaApi, DEventHandlerFactory } from '@Damba/v2/service/DambaService';
import { resolve } from 'path';

export const loadFilesBehavior: DEventHandlerFactory = () => {
  return async (e: DEvent) => {
    const files = await LoadFiles(resolve(process.cwd(), '../common/Damba/v2'));
    e.out.send(files);
  };
};

export const saveDambaCode: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const files = await LoadFiles(resolve(process.cwd(), '../common/Damba/v2')) as IDambaFile[];
    const version = api?.params().version;
    if (!version) return e.out.status(400).send({ message: 'Version is required.' });
    files.forEach((df)=> {
           const code = Object.create({
              ...df,
            version: version
            })  as DambaCoreCode
         try {
             e.in.DRepository.DSave(DambaCoreCode, code)
           } catch (error) {
          
         }
       
    });
    e.out.send(files);
  };
};

export const getDambaCodeByVersion: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const version = api?.params().version;
    if (!version) return e.out.status(400).send({ message: 'Version is required.' });
    const codes = await e.in.DRepository.DGet(DambaCoreCode, {
      where : {
         version
      }
    }, true);
    e.out.send(codes);
  };
};

export const updateDambaCodeById: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const data = api?.body() as { id: string , content: string };
    if (!data) return e.out.status(400).send({ message: 'code is required.' });
    const code = await e.in.DRepository.DGet1(DambaCoreCode, {
      where : {
         id : data.id
      }
    });
    
    await e.in.DRepository.DSave(DambaCoreCode, code)
    e.out.send(code);
  };
};
