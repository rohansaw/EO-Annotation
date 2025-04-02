import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { 
  annotateCurrentPoint,
  selectAnnotationClasses,
  selectAreAllAnnotated,
  skipPoint,
  selectTotalPoints,
  goBackToPreviousPoint
} from '../store/pointsSlice';

const Container = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const ButtonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const ClassButton = styled(Button)(({ theme }) => {

  return {
    fontWeight: 500,
    textTransform: 'none',
  };
});

const NavigationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
}));

const DirectionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: '#555',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
}))

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const AnnotationPanel = () => {
  const dispatch = useDispatch();
  const annotationClasses = useSelector(selectAnnotationClasses);
  const areAllAnnotated = useSelector(selectAreAllAnnotated);
  const totalPoints = useSelector(selectTotalPoints);

  const handleAnnotate = (classValue) => {
    dispatch(annotateCurrentPoint(classValue));
  };

  const handleSkip = () => {
    dispatch(skipPoint());
  };

  const handlePrevious = () => {
    dispatch(goBackToPreviousPoint());
  }

  // Show empty state if no points are loaded
  if (totalPoints === 0) {
    return (
      <EmptyStateContainer>
        <Typography variant="body1" gutterBottom>
          No annotation points loaded
        </Typography>
        <Typography variant="body2">
          Please upload a CSV file with points to begin annotation
        </Typography>
      </EmptyStateContainer>
    );
  }

  return (
    <Container>
      <Typography variant="subtitle1" gutterBottom>
        Select Classification
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose the land cover class at the marked point
      </Typography>

      <ButtonGrid>
        {annotationClasses.map((classItem) => (
          <ClassButton
            key={classItem.value}
            variant="contained"
            onClick={() => handleAnnotate(classItem.value)}
            startIcon={<CheckCircleIcon />}
          >
            {classItem.label}
          </ClassButton>
        ))}
      </ButtonGrid>
      
      <NavigationButtons>
        <DirectionButton
          variant="outlined"
          startIcon={<SkipPreviousIcon />}
          onClick={handlePrevious}
          fullWidth
        >
          Previous
        </DirectionButton>

        <DirectionButton
          variant="outlined"
          startIcon={<SkipNextIcon />}
          onClick={handleSkip}
          fullWidth
        >
          Next
        </DirectionButton>
      </NavigationButtons>

      {areAllAnnotated && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 500, mb: 1.5 }}>
            Yayy all samples annotated!
          </Typography>
          <Button variant="outlined" color="primary" fullWidth>
            Complete & Export
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default AnnotationPanel;