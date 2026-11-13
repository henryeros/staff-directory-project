import {ReactNode} from "react";
import dayjs from "dayjs";

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => ReactNode);
    cell?: (value: any, row?: T) => ReactNode;
    className?: string;
}
export type RequestTableData ={
    // requestId:string,
    firstName:string,
    lastName: string,
    accountNumber:string,
    requestBranchCode:string,
    dateCreated:string,
    status:string,
    transactionDate: string
}
export const columns:Column<RequestTableData>[] = [
    {
        header:'First name',
        accessor:'firstName',
    },
    {
        header:'Last name',
        accessor:'lastName',
    },
    {
        header:'Account number',
        accessor:'accountNumber',
    },
    {
        header:'Branch code',
        accessor:'requestBranchCode',
    },
    {
        header:'Date Created',
        accessor:'dateCreated',
        cell:(value:string)=>{
            return(
                <span>{dayjs(value).format('DD MMM YYYY')}</span>
            )
        }
    },
    {
        header:'Status',
        accessor:'status',
        cell: (value: any, ) => {
            return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Success' ? 'bg-green-100 text-green-800': value ==='Pending' ? 'bg-gray-100 text-gray-800': 'bg-red-100 text-red-800'}`}>
                    {value}
                </span>
            );
        },
    },
    {
        header:'Transaction date',
        accessor:'transactionDate',
        cell:(value:string )=>{
            return (
                <span className='ml-4'>
                    {value ? value : '-- -- --'}
                </span>
            )
        }
    },
]
export const RequestTableData=[
    {
        accountNumber:'123456789',
        firstName:'Angela ',
        lastName:'Okorie',
        requestBranchCode:'001',
        dateCreated:'2024-01-01',
        status:'Success',
        transactionDate:'',
    },
    {
        accountNumber:'0012345678',
        firstName:'Jon ',
        lastName:'Bosco',
        requestBranchCode:'011',
        dateCreated:'2024-01-02',
        status:'Pending',
        transactionDate:'',
    },
    {
        accountNumber:'1100000123',
        firstName:'Henrietta ',
        lastName:'Fishbourne',
        requestBranchCode:'012',
        dateCreated:'2024-01-11',
        status:'Success',
        transactionDate:'2025-10-10',
    },{
        accountNumber:'123456449',
        firstName:'Wisom ',
        lastName:'Ike',
        requestBranchCode:'003',
        dateCreated:'2024-01-13',
        status:'Failed',
        transactionDate:'',
    },
    {
        accountNumber:'123452345',
        firstName:'Mathew ',
        lastName:'Landing',
        requestBranchCode:'121',
        dateCreated:'2024-01-01',
        status:'Success',
        transactionDate:'',
    },
    // {
    //     requestId:'678901234',
    //     accountNumber: '555555555',
    //     customerName:'David Brown',
    //     cardType:'Visa',
    //     requestDate: '2024-01-07',
    //     requestStatus:'Processing',
    // },
    // {
    //     requestId:'789012345',
    //     accountNumber: '666666666',
    //     customerName:'Lisa Davis',
    //     cardType:'Mastercard',
    //     requestDate: '2024-01-08',
    //     requestStatus:'Pending',
    // },
    // {
    //     requestId:'890123456',
    //     accountNumber: '777777777',
    //     customerName:'Robert Miller',
    //     cardType:'Visa',
    //     requestDate: '2024-01-09',
    //     requestStatus:'Approved',
    // },
    // {
    //     requestId:'901234567',
    //     accountNumber: '888888888',
    //     customerName:'Jennifer Garcia',
    //     cardType:'Mastercard',
    //     requestDate: '2024-01-10',
    //     requestStatus:'Processing',
    // },
    // {
    //     requestId:'012345678',
    //     accountNumber: '999999999',
    //     customerName:'James Martinez',
    //     cardType:'Visa',
    //     requestDate: '2024-01-11',
    //     requestStatus:'Approved',
    // },
    // {
    //     requestId:'1234567890',
    //     accountNumber: '000000000',
    //     customerName:'Maria Rodriguez',
    //     cardType:'Mastercard',
    //     requestDate: '2024-01-12',
    //     requestStatus:'Pending',
    // }
]