import {ReactNode} from "react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => ReactNode);
    cell?: (value: any, row?: T) => ReactNode;
    className?: string;
}
export interface Role {
    roleId: number;
    roleName: string;
}

export type UserData ={
    userProfileId: number;
    email: string;
    displayName: string;
    jobTitle: string;
    roles: Role[];
    status: string;
}
export const UserData = [
    {
        userProfileId: 1,
        email: 'aanu@tatumbank.com',
        displayName: ' Aanuoluwapo Akinrinade',
        jobTitle: 'Software Engineer',
        status: 'Active',
        roles: [
            {
                roleId: 1,
                roleName: 'Admin'
            }],
    },
    {
        userProfileId: 2,
        email: 'iseoluwa@tatumbank.com',
        displayName: 'Iseoluwa Oluwasegun',
        jobTitle: 'Controller General',
        status: 'Inactive',
        roles: [
            {
                roleId: 2,
                roleName: 'User'
            }],
    },
    {
        userProfileId: 3,
        email: 'kiitan@tatumbank.com',
        displayName: 'Magnificent Kitiatan',
        jobTitle: 'Super Controller',
        status: 'Active',
        roles: [
            {
                roleId: 3,
                roleName: 'SuperAdmin'
            }],
    }
]

export const columns:Column<UserData>[] = [
    {
        header: 'Display Name',
        accessor: 'displayName',
    },
    {
        header: 'Email',
        accessor: 'email',
    },
    {
        header: 'Job Title',
        accessor: 'jobTitle',
    },
    {
        header: 'Roles',
        accessor: 'roles',
        cell: (roles: Role[]) => {
            if (!roles || roles.length === 0) return null;
            return (
                <div className="flex gap-2">
                    {roles.map(r => (
                        <span key={r.roleId}>
                            {r.roleName}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        header: 'Status',
        accessor: 'status',
        cell: (value: any, ) => {
            return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'Active' ? 'bg-green-100 text-green-800': value ==='Inactive' ? 'bg-red-100 text-red-800': 'bg-gray-100 text-gray-800'}`}>
                    {value}
                </span>
            );
        },
    },

]
