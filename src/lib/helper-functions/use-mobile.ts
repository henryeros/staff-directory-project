'use client'

import {useMediaQuery} from "react-responsive";

export const useMobile=()=>{
    return useMediaQuery({query:'(max-width:599px)'})
}

export const useTablet=()=>{
    return useMediaQuery({query:'(min-width:600px) and (max-width:1024px)'})
}