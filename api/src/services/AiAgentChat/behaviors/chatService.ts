/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Request,
  Response,
} from 'express';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ChatAi, Service_tier } from '../entities/ChatAi';
import { DGet, DSave } from '../../../../../common/mvc/CrudService';
import { MessageAi } from '../entities/MessageAi';
import { v4 as uuidv4 } from 'uuid';
const services = {
  //   home: async(0: Request, res: Response) => {
  //   return res.send({
  //     name: process.env.APP_NAME,
  //   });
  // },

  // chat: async (req: Request, res: Response) => {
  //   let isNew = (!req.body.chat) ? true : false;
  //   try {
  //     console.log(req.body);
  //     const messages: ChatCompletionMessageParam[] = [];
  //     let data: any;
  //     if (!isNew) {
  //       data = await services.getSummary(req);
  //       if (data.chat.summary) {
  //         messages.push({ role: "system", content: data.chat.summary } as ChatCompletionMessageParam);
  //       } else {
  //         isNew = true;
  //       }
  //     }
  //     messages.push({ role: req.body.role, content: req.body.content });
  //     const completion = await req.AI.chat.completions.create({
  //       model: "gpt-4o-mini",
  //       messages: messages,
  //       store: true,
  //     });
  //     let chat: any;
  //     if (isNew) {
  //       chat = await DSave(req.DB, ChatAi, {
  //         id: uuidv4(),
  //         model: completion.model,
  //         object: completion.object,
  //         service_tier: completion.service_tier as Service_tier,
  //         system_fingerprint: completion.system_fingerprint,
  //         initial_prompt: req.body.content,
  //       });
  //       services.NewChat(req, chat, completion);
  //     } else {
  //       services.setSummary(req, data.chat as ChatAi, completion);
  //     }
  //     return res.status(200).send({ completion, isNew, chat });
  //   } catch (error) {
  //     res.status(500).send(error);
  //   }
  // }
  //   ,
  //   setSummary: async (req: Request, data: ChatAi, completion: ChatCompletion & {
  //     _request_id?: string | null;
  //   }) => {

  //     return new Promise(async (resolve) => {

  //       const ai = DSave(req.DB, MessageAi, {
  //         chatAi: data,
  //         role: 'system',
  //         content: completion.choices[0].message.content ?? '',
  //       });

  //       const messages: ChatCompletionMessageParam[] = [];
  //       messages.push({ role: 'system', content: ` Create a new  short and explicit summary  to allow an AI to remind past message, by merging this old summary : \b ${data.summary && ''} \b with new message of the user : \b ${req.body.content} \b and the new answer of the AI : ${completion.choices[0].message.content ?? ''} ` });
  //       const c = await req.AI.chat.completions.create({
  //         model: "gpt-4o-mini",
  //         messages: messages,
  //         store: true,
  //       });
  //       data.summary = c.choices[0].message.content ?? '';
  //       data = await DSave(req.DB, ChatAi, data) as any;
  //       resolve({ data, ai });
  //     });
  //   },
  //     getSummary: async (req: Request) => {
  //       return new Promise(async (resolve) => {
  //         const chat = await DGet(req.DB, ChatAi, { where: { id: req.body.chat.id } }, false) as ChatAi;
  //         const message = await DSave(req.DB, MessageAi, {
  //           chatAi: chat,
  //           role: req.body.role,
  //           content: req.body.content,
  //         });
  //         resolve({ chat, message });
  //       });
  //     },
  //       NewChat: async (req: Request, data: ChatAi, completion: ChatCompletion & {
  //         _request_id?: string | null;
  //       }) => {
  //         return new Promise(async (resolve) => {
  //           const messages: ChatCompletionMessageParam[] = [];
  //           messages.push({ role: 'system', content: ` Create a very short and explicit summary this to allow an AI to remind past message this is first message from the user : \b ${req.body.content} \b and here is the first answer of the AI : ${completion.choices[0].message.content ?? ''} ` });
  //           const c = await req.AI.chat.completions.create({
  //             model: "gpt-4o-mini",
  //             messages: messages,
  //             store: true,
  //           });
  //           data.summary = c.choices[0].message.content ?? '';
  //           data = await DSave(req.DB, ChatAi, data) as any;
  //           const message = await DSave(req.DB, MessageAi, {
  //             chatAi: data,
  //             role: req.body.role,
  //             content: req.body.content,
  //           });

  //           const ai = await DSave(req.DB, MessageAi, {
  //             chatAi: data,
  //             role: 'system',
  //             content: completion.choices[0].message.content ?? '',
  //           });
  //           resolve({ data, message, ai });
  //         });
  //       },


};
export default services;