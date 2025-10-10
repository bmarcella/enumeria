/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankDoc } from "./Docs";
import { DocumentData, getDocs, or, orderBy, Query, query, QueryConstraint, Timestamp, where } from "firebase/firestore";
import { getRegionIds } from "@/views/Entity/Regions";

export interface ReportItem {
  name: string; // creator ID or name
  steps: string[];
  values: number[];
}

 export const getQueryFilters = (q: Query<DocumentData, DocumentData>, { regions, agents, start, end, steps, proprio, authority }: any)  => {
         
            const filters: QueryConstraint[] = [];

            if (regions && regions != 0) {
                filters.push(where('id_region', '==', regions));
            } else {
                const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
                filters.push(where("id_region", "in", ids))
            }

            if (agents) {
                filters.push(where('createdBy', '==', agents));
            }

            if (steps) {
                filters.push(where('step', '==', steps));
            }
           
            if (start && end) {
                const isSameDay =
                start.toDateString() === end.toDateString();

                if (isSameDay) {
                  const startOfDay = new Date(start);
                  startOfDay.setHours(0, 0, 0, 0);
  
                  const endOfDay = new Date(end);
                  endOfDay.setHours(23, 59, 59, 999);
  
                  filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
                  filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
                } else {
                  filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                  filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                }
            } else {
                if (start) {
                   filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                }
                if (end) {
                   filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                }
            }
            return filters.length > 0 ? query(q, ...filters) : q;
    }

    export const getQueryFiltersDate = (q: Query<DocumentData, DocumentData>, {  start, end }: any)  => {
         
      const filters: QueryConstraint[] = [];
      if (start && end) {
          const isSameDay =
          start.toDateString() === end.toDateString();

          if (isSameDay) {
          const startOfDay = new Date(start);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(end);
          endOfDay.setHours(23, 59, 59, 999);

          filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
          filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
          } else {
          filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
          filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
          }
      } else {
          if (start) {
          filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
          }
          if (end) {
          filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
          }
      }
      return filters.length > 0 ? query(q, ...filters) : q;
}

export const fetchReportPerCreator = async ( ReportSteps: [], q: Query<DocumentData>): Promise<ReportItem[]> => {
  const creatorsSet = new Set<string>();
  const allBanksSnapshot = await getDocs(q);
  // 1. Extract all unique creators
  allBanksSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdBy) {
        creatorsSet.add(data.createdBy);
    }
  });

  const creators = Array.from(creatorsSet);
  // 2. Generate report
  const report: ReportItem[] = (
    await Promise.all(
      creators.map(async (creator) => {
        const steps: string[] = [];
        const values: number[] = [];

        await Promise.all(
          ReportSteps.map(async (step: any) => {
            const nq = query(
              q,
              orderBy("createdAt", "desc"),
              where("step", "in", step.key),
              where("createdBy", "==", creator)
            );
            const snapshot = await getDocs(nq);

            steps.push(step.label);
            values.push(snapshot.size);
          })
        );

        if (values.every((v) => v === 0)) return null;

        return {
          name: creator,
          steps,
          values,
        };
      })
    )
  ).filter((item): item is ReportItem => item !== null);

  return report;
};



export const fetchReportPerCreatorPerWeek  = async ( q: Query<DocumentData>, ReportSteps: [], weeks:[]): Promise<ReportItem[]> => {
  const creatorsSet = new Set<string>();
  // 1. Extract all unique creators
  const allBanksSnapshot = await getDocs(q);
  // 1. Extract all unique creators
  allBanksSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdBy) {
      creatorsSet.add(data.createdBy);
    }
  });

  const creators = Array.from(creatorsSet);
  // 2. Generate report
  const report: ReportItem[] = (
    await Promise.all(
      creators.map(async (creator) => {
        const steps: any[] = [];
        const values: any[] = [];

        await Promise.all(
          weeks.map(async (week: any) => {
            
             const new_val = await Promise.all(
                ReportSteps.map(async (step: any) => {
                  const nq = query(
                    q,
                    orderBy("createdAt", "desc"),
                    where("createdAt", ">=", week.start),
                    where("createdAt", "<=", week.end),
                    where("step", "in", step.key),
                    where("createdBy", "==", creator)
                  );
                  const snapshot = await getDocs(nq);
                  return  {
                    label: step.label,
                    value: snapshot.size,
                    };
                })
              );
              steps.push(week);
              values.push(new_val);
          })
        );
    

        if (values.every((v) => v === 0)) return null;

        return {
          name: creator,
          steps,
          values,
        };
      })
    )
  ).filter((item): item is ReportItem => item !== null);

  return report;
};



export const getQueryFiltersWeek = (q: Query<DocumentData, DocumentData>, { regions, agents, proprio, authority }: any)  => {
         
  const filters: QueryConstraint[] = [];

  if (regions && regions != 0) {
      filters.push(where('id_region', '==', regions));
  } else {
      // let ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
      // ids = ids.pop();
      // // console.log("ids", ids);
      // // const regionFilters = ids.map((id: number) => where("id_region", "==", id));
      // // filters.push(or(...regionFilters)); // Firestore max disjunction = 30
      // filters.push(where("id_region", "in", ids))
  }

  if (agents) {
      filters.push(where('createdBy', '==', agents));
  }

  return filters.length > 0 ? query(q, ...filters) : q;
}



export function getLast4Weeks(dateInput: Date | string, week: number = 4): { name: string; start: string; end: string }[] {
  const result = [];
  const date = new Date(dateInput);
  // Go to end of current week (Saturday)
  const endOfWeek = new Date(date);
  const day = endOfWeek.getDay(); // Sunday = 0
  endOfWeek.setDate(endOfWeek.getDate() - day + 6); // Saturday

  for (let i = 0; i < week; i++) {
    const end = new Date(endOfWeek);
    end.setHours(23, 59, 59, 999); // Set to 11:59:59 PM

    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0); // Set to midnight

    result.push({
      name: `Week ${week - i}`,
      start: start,
      end: end,
    });

    // Go to previous Saturday
    endOfWeek.setDate(endOfWeek.getDate() - 7);
  }

  return result;
}

