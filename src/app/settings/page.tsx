'use client'
import { motion } from "framer-motion"
import { useState, useEffect } from "react";
import ImageUploader from "@/components/shared/imageUploader";
import Input from "@/components/shared/input";
import padlockIcon from "@/assets/icons/dashboards/padlock-icon.svg"
import Image from "next/image";
import Button from "@/components/shared/button";
import { Check } from "react-feather";
import Cookies from "js-cookie";

export default function Settings() {
    const [userData, setUserData] = useState<any>(null);
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [profileTab, setProfileTab] = useState('profile')
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [password, setPassword] = useState('')

    // Load user data on client side only
    useEffect(() => {
        const user = Cookies.get("user")
        const parsedUser = user ? JSON.parse(user) : null;
        setUserData(parsedUser);
        if (parsedUser) {
            setFullName(parsedUser.displayName || '')
            setEmail(parsedUser.email || '')
            setPhoneNumber(parsedUser.phoneNumber || '')
        }
    }, []);

    const handleImageChange = (file: File | null) => {
        setProfileImage(file);
    };

    // Show loading state while user data is being fetched
    if (!userData) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <motion.div variants={
            {
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.3,
                        ease: "easeOut"
                    }
                }
            }
        }>
            <motion.p
                className="text-[#182230] font-semibold text-[24px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                Settings
            </motion.p>
            <motion.p
                className="text-[#475467] font-normal text-[18px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                Browse and manage your profile
            </motion.p>
            <div className="mt-10 flex lg:flex-row flex-col gap-4">
                <div className="lg:w-[20%] h-[150px] w-full bg-[#FCFCFD] border border-[#EAECF0] rounded-[12px] p-4">
                    <p className={`${profileTab === 'profile' ? 'bg-[#FFFAEB] border-l-6 border-[#FFCC33]' : 'border-l-6 border-transparent'} text-[#182230] text-base font-normal py-3 px-4 cursor-pointer `} onClick={() => setProfileTab('profile')}>Profile</p>
                    <p className={`${profileTab === 'password-settings' ? 'bg-[#FFFAEB] border-l-6 border-[#FFCC33]' : 'border-l-6 border-transparent'} text-[#182230] text-base font-normal py-3 px-4 cursor-pointer mt-4`} onClick={() => setProfileTab('password-settings')}>Password Settings</p>
                </div>

                <div className="bg-[#FCFCFD] border border-[#EAECF0] rounded-[12px] lg:w-[78%] w-full p-3">
                    <div className="border-b border-[#D0D5DD]">
                        <p className="font-semibold text-[25px] text-[#182230]">{profileTab === 'profile' ? 'Profile' : 'Password Settings'}</p>
                    </div>
                    {profileTab === 'profile' ? (
                        <div className="mt-6">
                            <ImageUploader
                                value={profileImage}
                                onChange={handleImageChange}
                                buttonText="Upload New Image"
                            />
                            <div className="mt-3">
                                <Input label="Full Name" placeholder="Enter Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} rightIcon={<Image src={padlockIcon} alt="" />} />
                            </div>
                            <div className="mt-6">
                                <Input label="Work email" placeholder="Enter work email" value={email} onChange={(e) => setEmail(e.target.value)} rightIcon={<Image src={padlockIcon} alt="" />} />
                            </div>
                            <div className="mt-6">
                                <Input label="Phone number" placeholder="Enter phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} rightIcon={<Image src={padlockIcon} alt="" />} />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Input className="mt-4" label="Old Password" name="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Input className="mt-4" label="New Password" name="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Input className="mt-4" label="Confirm Password" name="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    )
                    }
                </div>
            </div>
            <div className='flex justify-end items-center gap-4 mt-6'>
                <button
                    className='text-[#F04438] text-base cursor-pointer font-medium hover:text-[#d03529] transition-colors'
                >
                    Cancel
                </button>
                <Button variant='primary' icon={<Check color='#002244' />}>
                    Save Changes
                </Button>
            </div>
        </motion.div>
    )
}