import Logo from '@/assets/images/logo.svg'
import Image from 'next/image'
    export default function AuthLayout({children, header, paragraph}) {
    return (
        <div className="h-[100vh] w-full bg-[#F2F4F7] flex items-center justify-center">
           <div className="lg:w-[40%] w-full min-h-[300px] bg-[#FFFFFF] border border-[#EAECF0] rounded-[16px] lg:p-5 p-2 ">
<Image src={Logo} alt="Tatum Bank Logo" className=""/>
<p className='text-[#182230] font-semibold text-[32px] mt-4 mb-2'>{header}</p>
<p className='text-[#344054] font-normal text-[16px]'>{paragraph}</p>
{children}
           </div>
        </div>
    )
}
