import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { 
  selectCompletedPoints,
  selectTotalPoints,
  selectCurrentPoint
} from '../store/pointsSlice';

const Container = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  borderTop: '1px solid #e0e0e0',
  padding: theme.spacing(2),
}));

const ProgressInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

const StatusInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(1),
}));

const StatusBar = () => {
  const completedPoints = useSelector(selectCompletedPoints);
  const totalPoints = useSelector(selectTotalPoints);
  const currentPoint = useSelector(selectCurrentPoint);
  
  const progressPercentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  
  return (
    <Container>
      <ProgressInfo>
        <Typography variant="body2">Progress</Typography>
        <Typography variant="body2" fontWeight={500}>
          {completedPoints} / {totalPoints} points
        </Typography>
      </ProgressInfo>
      
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{ height: 8, borderRadius: 4 }}
      />
      
      <StatusInfo>
        <Typography variant="caption" color="text.secondary">
          {currentPoint ? `Point ID: ${currentPoint.id}` : 'No active point'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {progressPercentage.toFixed(1)}% complete
        </Typography>
      </StatusInfo>
    </Container>
  );
};

export default StatusBar;