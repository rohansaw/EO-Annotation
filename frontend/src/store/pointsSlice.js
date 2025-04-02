import { createSlice } from '@reduxjs/toolkit';
import Papa from 'papaparse';

// Want to get annotation classes from a backend in the end to make this dynamic

const initialState = {
  points: [],
  currentPointIndex: 0,
  annotatedPoints: [],
  isLoading: false,
  annotationClasses: [
    { value: 'rapeseed', label: 'Rapeseed' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'maize', label: 'Maize' },
    { value: 'nocrop', label: 'No Cropland' }
  ]
};

export const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    setPoints: (state, action) => {
      state.points = action.payload;
      state.currentPointIndex = 0;
      state.annotatedPoints = [];
      state.isLoading = false;
    },
    annotatePoint: (state, action) => {
      const { pointIndex, annotationClass } = action.payload;
      
      if (pointIndex >= 0 && pointIndex < state.points.length) {
        // Add the current point to annotated points with its class
        const annotatedPoint = {
          ...state.points[pointIndex],
          annotationClass,
          annotatedAt: new Date().toISOString()
        };
        
        // Check if the point has already been annotated and update it
        const existingIndex = state.annotatedPoints.findIndex(p => p.id === annotatedPoint.id);
        if (existingIndex >= 0) {
          state.annotatedPoints[existingIndex] = annotatedPoint;
        } else {
          state.annotatedPoints.push(annotatedPoint);
        }
        
        // Move to next point if not at the end
        if (pointIndex < state.points.length - 1) {
          state.currentPointIndex = pointIndex + 1;
        }
      }
    },
    skipPoint: (state) => {
      if (state.currentPointIndex < state.points.length - 1) {
        state.currentPointIndex += 1;
      }
    },
    goBackToPreviousPoint: (state) => {
      if (state.currentPointIndex > 0) {
        state.currentPointIndex -= 1;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    exportAnnotations: (state) => {
      // TODO
    }
  }
});

// Actions
export const { setPoints, annotatePoint, skipPoint, setLoading, exportAnnotations, goBackToPreviousPoint } = pointsSlice.actions;

// Thunks
export const loadPointsFromCSV = (csvData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    // Guess ideally we'd want to load this from a DB/API - todo

    const dataToProcess = csvData

    Papa.parse(dataToProcess, {
      header: true,
      complete: (results) => {
        // Transform string values to appropriate types
        const points = results.data
          .filter(point => point.lat && point.lon) // Filter out empty rows
          .map(point => ({
            id: point.id || String(Math.random()).substring(2, 10),
            lat: parseFloat(point.lat),
            lon: parseFloat(point.lon),
            note: point.note || ''
          }))
          .filter(point => !isNaN(point.lat) && !isNaN(point.lon));
        
        dispatch(setPoints(points));
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        dispatch(setLoading(false));
      }
    });
  } catch (error) {
    console.error('Error loading points:', error);
    dispatch(setLoading(false));
  }
};

export const annotateCurrentPoint = (annotationClass) => (dispatch, getState) => {
  const { points, currentPointIndex } = getState().points;
  if (points.length > 0 && currentPointIndex < points.length) {
    dispatch(annotatePoint({ pointIndex: currentPointIndex, annotationClass }));
  } else {
    console.warn('Cannot annotate: No current point available');
  }
};

export const skipCurrentPoint = () => (dispatch, getState) => {
  const { points, currentPointIndex } = getState().points;
  if (points.length > 0 && currentPointIndex < points.length) {
    dispatch(skipPoint(currentPointIndex));
  } else {
    console.warn('Cannot skip: No current point available');
  }
};

// Selectors
export const selectCurrentPoint = (state) => {
  const { points, currentPointIndex } = state.points;
  
  // If we don't have any points yet, return null
  if (!points || points.length === 0) {
    return null;
  }
  
  // If we've processed all points, return null
  if (currentPointIndex >= points.length) {
    return null;
  }
  
  return points[currentPointIndex];
};

export const selectAnnotatedPoints = (state) => state.points.annotatedPoints;
export const selectTotalPoints = (state) => state.points.points.length;
export const selectCompletedPoints = (state) => {
  return state.points.annotatedPoints.length;
};
export const selectIsLoading = (state) => state.points.isLoading;
export const selectAnnotationClasses = (state) => state.points.annotationClasses;
export const selectAreAllAnnotated = (state) => {
  const { points, annotatedPoints } = state.points;
  return points.length > 0 && annotatedPoints.length === points.length;
};

export const selectCurrentImageryIndex = (state) => state.imagery.currentImageryIndex;

export default pointsSlice.reducer;