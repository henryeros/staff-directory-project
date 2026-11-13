'use client'

import {LogOut, Users} from "lucide-react";
import {TiFlowSwitch} from "react-icons/ti";
import {usePathname} from "next/navigation";
import {GrDashboard, GrTransaction} from "react-icons/gr";
import {BsCreditCard2Front} from "react-icons/bs";
import {RiSecurePaymentLine} from "react-icons/ri";
import {FaUsersViewfinder} from "react-icons/fa6";
import {MdRequestQuote} from "react-icons/md";
import {TbMailPin, TbReport} from "react-icons/tb";
import {FcMoneyTransfer} from "react-icons/fc";
import {useEffect, useState} from "react";
import {FaUsers} from "react-icons/fa";
import { LuUsers } from "react-icons/lu";

export const useSideBarRoute=()=>{
    const pathname = usePathname()
    const [activePath, setActivePath] = useState('');

    useEffect(() => {
        setActivePath(window.location.pathname);
    }, [pathname]);

    const isActive = (href: string) => {
        if (!href) {
            return false;
        }

        if (href === '/admin') {
            return activePath === href;
        }

        return activePath === href || activePath.startsWith(`${href}/`);
    };

    const routes = {
        topRoute:[
            {
                label:'Overview',
                icon:GrDashboard,
                href:'/admin/',
                active:isActive( '/admin/')
            },
            {
                label:'Cards',
                icon:BsCreditCard2Front,
                href:'/admin/cards',
                active:isActive('/admin/cards'),
                children: [
                    {
                        label: 'Card request',
                        href: '/admin/cards/request',
                        icon: MdRequestQuote,
                        active: isActive('/admin/cards/request') ,
                    },
                    {
                        label: 'All requests',
                        href: '/admin/cards/viewAll',
                        icon: FaUsersViewfinder,
                        active: isActive('/admin/cards/viewAll')
                    },
                    {
                        label: 'Pin mailer',
                        href: '/admin/cards/mailer',
                        icon: TbMailPin,
                        active: isActive('/admin/cards/mailer')
                    },
                    // {
                    //     label: 'Reports',
                    //     href: '/admin/cards/report',
                    //     icon: TbReport,
                    //     active:isActive('/admin/cards/report')
                    // },
                ]
            },
            {
                label:'Payments',
                icon:RiSecurePaymentLine,
                href:'/admin/payment',
                active:isActive('/admin/payments') ,
                children: [
                    {
                        label: 'NIP payments',
                        href: '/admin/payment/transfer',
                        icon: FcMoneyTransfer,
                        active: isActive('/admin/payment/transfer')
                    },
                    {
                        label: 'Transaction list',
                        href: '/admin/payment/transaction',
                        icon: GrTransaction,
                        active: isActive('/admin/payment/transaction')
                    }
                ]
            },
            {
                label:'Users',
                icon: FaUsers,
                href:'/admin/users',
                active:isActive('/admin/users'),
                children: [
                    {
                        label: 'All users',
                        href: '/admin/users/viewAll',
                        icon: LuUsers,
                        active: isActive('/admin/users/viewAll')
                    },
                ]
            },
            {
                label:'Console',
                icon:TiFlowSwitch,
                href:'/admin/console',
                active:isActive('/admin/console')
            },

        ],
        bottomRoute:[
            {
                label:'Log out',
                icon: LogOut,
                href:'/logout',
                active:isActive('/logout')
            }
        ]
    }

    // Update active for routes with children
    routes.topRoute.forEach(route => {
        if (route.children) {
            route.active = route.active || route.children.some(child => child.active)
        }
    })

    return routes
}