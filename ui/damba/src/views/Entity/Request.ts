export const modePayments = [
    "request.cash",
    "request.check",
    "request.wire_transfer",
  ] as const;
  export type ModePayment = typeof modePayments[number];

  export const support_docs = [
    "request.proformat",
    "request.contrat",
    "request.leaseContract",
    "request.employee",
    "request.receipt",
    "request.invoice_voucher",
    "request.addendum",
    "request.id_card",
    "request.inventory",
    "request.report_checklist",
    "request.other",
  ] as const;
  export type SupportDoc = typeof support_docs[number];

  export const exp_categories = [
    "request.expense.lease",
    "request.expense.bank_improvement",
    "request.expense.equipment",
    "request.expense.monthly_reccurring",
    "request.expense.materials",
    "request.expense.operations",
    "request.expense.logistics",
    "request.expense.maintenance_repair",
    "request.expense.payroll",
    "request.expense.marketing",
    "request.expense.hr",
    "request.expense.other",
  ] as const;
  export type ExpCategory = typeof exp_categories[number];

  
  export const account = [
    "BUH OPS HTG-PAP55485",
    "BUH OPS USD-PAP55507",

    "BUH OPS HTG-CAP65103",
    "BUH OPS USD-CAP65111",

    "BUH OPS HTG-OUA81262",
    "BUH OPS USD-OUA81278",

    "BUH OPS HTG-CAY80521",
    "BUH OPS USD-CAY8053",

    "SAFEBOX",
    "OTHER",
  ] as const;
  
  export type Account = typeof account[number];

  export const reqSteps = [
    "reqSteps.needConfirmation",
    "reqSteps.needApproval",
    "reqSteps.needPayment",
    "reqSteps.needDeliveryProof",
    "reqSteps.completed",
    "reqSteps.rejected",
  ] as const;
  export type ReqSteps = typeof reqSteps[number];


 export interface  RequestType {
    id?: string;
    objectId: string;
    beneficiary_name: string;
    beneficiary_name_check?: string;
    beneficiary_name_wire?: string;
    modePayment: ModePayment;
    amount: number;
    description?: string;
    status?: string;
    createdAt: Date;
    step: ReqSteps;
    updatedAt: Date;
    createdBy: string;
    id_region: number;
    currency: string;
    general_admin_memo?: string;
    confirmationFrom?: string;
    confirmedBy?: string;
    confirmedAt?: Date;

    approvedBy?: string;
    approvedAt?: Date;

    rejectedBy?: string;
    rejectedAt?: Date;

    account?: Account;
    exp_category?: ExpCategory;


    updatedBy: string;

    
   
  }