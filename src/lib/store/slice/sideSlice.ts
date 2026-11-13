import {createSlice} from "@reduxjs/toolkit";

interface SideState{
    sidebarOpen:boolean
}
const initialState:SideState= {
    sidebarOpen: false
}
const sideSlice = createSlice({
    name:'sidebar',
    initialState,
    reducers:{
        toggleSidebar(state){
            state.sidebarOpen = !state.sidebarOpen
        }
    }
})
export const {toggleSidebar} = sideSlice.actions;
export default sideSlice.reducer
