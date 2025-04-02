import { combineReducers } from 'redux';
import pointsReducer from './pointsSlice';
import imageryReducer from './imagerySlice';

const rootReducer = combineReducers({
  points: pointsReducer,
  imagery: imageryReducer
});

export default rootReducer;