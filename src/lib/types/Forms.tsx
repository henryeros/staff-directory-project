export interface FormState {
    id?: string;
    firstName: string;
    middleName: string;
    lastName: string;
    requestBranchCode: string;
    cardType: string;
    accountNumber: string;
    chargeAmount: number;
    preferredName:string;
    isWaived: boolean;
}
export interface LoginState {
    email: string;
    password: string;
}
