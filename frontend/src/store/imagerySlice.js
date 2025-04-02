import { createSlice } from '@reduxjs/toolkit';


// Guess we'd want to load this from a DB/API to allow stopping to edit and continue later
// TODO: Need to discuss, what setup we want and what we can maintain in deployed version
// Need to get xyz urls from a backend if we want to use GEE
const initialState = {
  availableImagery: [
    { id: 'P20240610', name: 'Planet 2024-06-10', dateStart: '2024-05-27', dateEnd: '2024-06-10', xyzUrl: ''},
    { id: 'P20240610', name: 'Planet 2024-07-10', dateStart: '2024-06-27', dateEnd: '2024-07-10', xyzUrl: ''},
    { id: 'P20240610', name: 'Planet 2024-08-10', dateStart: '2024-07-27', dateEnd: '2024-08-10', xyzUrl: ''},
    { id: 'P20240610', name: 'Planet 2024-09-10', dateStart: '2024-08-27', dateEnd: '2024-09-10', xyzUrl: ''},
  ],
  currentImageryIndex: 0
};

export const imagerySlice = createSlice({
  name: 'imagery',
  initialState,
  reducers: {
    setCurrentImageryIndex: (state, action) => {
      state.currentImageryIndex = action.payload;
    }
  }
});

// Actions
export const { setCurrentImageryIndex } = imagerySlice.actions;

// Selectors
export const selectAvailableImagery = (state) => state.imagery.availableImagery;
export const selectCurrentImageryIndex = (state) => state.imagery.currentImageryIndex;

export default imagerySlice.reducer;