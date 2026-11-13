import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RequestState {
    loading: boolean;
}
const initialState: RequestState = { loading: false };

const requestSlice=createSlice({
    name:'request',
    initialState,
    reducers:{
        setLoading(state, action: PayloadAction<boolean>){
            state.loading = action.payload
        }
    }
})
export const {setLoading} = requestSlice.actions;
export default requestSlice.reducer;