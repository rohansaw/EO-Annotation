import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MapComponent from './components/MapComponent';
import AnnotationPanel from './components/AnnotationPanel';
import StatusBar from './components/StatusBar';
import { 
  loadPointsFromCSV, 
  selectCurrentPoint, 
  selectTotalPoints,
  selectCompletedPoints,
  selectIsLoading,
  selectCurrentImageryIndex,
  skipCurrentPoint
} from './store/pointsSlice';
import { 
  selectAvailableImagery,
  setCurrentImageryIndex
} from './store/imagerySlice';

const drawerWidth = 360;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    position: 'relative',
    height: '100vh',
    overflow: 'hidden',
  }),
);

const ZoomControls = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(0.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  zIndex: 1000,
}));

const InfoModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const UploadModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  padding: theme.spacing(4),
  position: 'relative',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const UploadInput = styled('input')({
  display: 'none',
});

const App = () => {
  const dispatch = useDispatch();
  const currentPoint = useSelector(selectCurrentPoint);
  const totalPoints = useSelector(selectTotalPoints);
  const completedPoints = useSelector(selectCompletedPoints);
  const isLoading = useSelector(selectIsLoading);
  const availableImagery = useSelector(selectAvailableImagery);
  const currentImageryIndex = useSelector(selectCurrentImageryIndex);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {}, [dispatch]);

  const handleImageryChange = (event, value) => {
    dispatch(setCurrentImageryIndex(value));
  };

  const toggleInfoPanel = () => {
    setIsInfoPanelOpen(!isInfoPanelOpen);
  };

  const toggleUploadModal = () => {
    setIsUploadModalOpen(!isUploadModalOpen);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target.result;
        dispatch(loadPointsFromCSV(csvData));
        setIsUploadModalOpen(false);
      };
      reader.readAsText(file);
    }
  };
  
  const getYearMonth = (date) => {
    const dateObj = new Date(date);
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
  };

  if (isLoading && totalPoints > 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading annotation data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EO Annotator
          </Typography>
          <Button
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={toggleUploadModal}
            sx={{ mr: 1 }}
          >
            Upload CSV
          </Button>
          <Button
            color="inherit"
            startIcon={<InfoIcon />}
            onClick={toggleInfoPanel}
            sx={{ mr: 1 }}
          >
            Help
          </Button>
          <Button
            color="inherit"
            startIcon={<SaveIcon />}
          >
            Export Data
          </Button>
        </Toolbar>
      </AppBar>

      <Main>
        <Toolbar />
        <MapComponent />
        
        <ZoomControls elevation={3}>
          <IconButton color="primary">
            <ZoomInIcon />
          </IconButton>
          <IconButton color="primary">
            <ZoomOutIcon />
          </IconButton>
        </ZoomControls>
      </Main>

      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px', // AppBar height
            height: 'calc(100% - 64px)',
          },
        }}
      >

        {currentPoint && (
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Point
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Point {completedPoints + 1} of {totalPoints}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">ID:</Typography>
              <Typography variant="body2">{currentPoint.id}</Typography>
              <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
              <Typography variant="body2">
                {currentPoint.lat.toFixed(5)}, {currentPoint.lon.toFixed(5)}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" gutterBottom>
            Imagery
          </Typography>
          <Box sx={{ mb: 3, p: 2 }}>
            {/* TODO might want to group different types of imagery and allow switching between them Also need to ensure to only trigger switch of imagery on release */}
            <Slider
              value={currentImageryIndex}
              max={availableImagery.length - 1}
              step={1}
              onChange={handleImageryChange}
              marks={availableImagery.map((imagery, index) => ({
                value: index,
                label: index === 0 || index === availableImagery.length - 1 || index === currentImageryIndex
                  ? getYearMonth(imagery.dateStart)
                  : '',
              }))}
            />
          </Box>
          <Typography variant="body1" align="center" fontWeight="medium">
            {availableImagery[currentImageryIndex]?.name}
          </Typography>
        </Box>

        <AnnotationPanel />
        
        <StatusBar />
      </Drawer>

      {/* Upload Modal */}
      <UploadModal
        open={isUploadModalOpen}
        onClose={toggleUploadModal}
        aria-labelledby="upload-modal-title"
      >
        <ModalContent elevation={4}>
          <CloseButton onClick={toggleUploadModal}>
            <CloseIcon />
          </CloseButton>
          <Typography variant="h5" id="upload-modal-title" gutterBottom>
            Upload Points CSV
          </Typography>
          <Typography variant="body1" paragraph>
            Upload a CSV file with points to annotate. The file should have columns for id, lat, lon, and optional notes.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <label htmlFor="upload-csv">
              <UploadInput 
                accept=".csv" 
                id="upload-csv" 
                type="file" 
                onChange={handleFileUpload} 
              />
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFileIcon />}
              >
                Select CSV File
              </Button>
            </label>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              CSV Format Example:
            </Typography>
            <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
              id,lat,lon,note{'\n'}
              1,40.7128,-74.0060,NYC{'\n'}
              2,34.0522,-118.2437,LA{'\n'}
              3,41.8781,-87.6298,Chicago
            </pre>
          </Box>
        </ModalContent>
      </UploadModal>

      {/* Info Modal */}
      <InfoModal
        open={isInfoPanelOpen}
        onClose={toggleInfoPanel}
        aria-labelledby="info-modal-title"
      >
        <ModalContent elevation={4}>
          <CloseButton onClick={toggleInfoPanel}>
            <CloseIcon />
          </CloseButton>
          <Typography variant="h5" id="info-modal-title" gutterBottom>
            How to Use This Tool
          </Typography>
          <ul style={{ paddingLeft: 20 }}>
            <li>TODO</li>
          </ul>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={toggleInfoPanel}>Close</Button>
          </Box>
        </ModalContent>
      </InfoModal>
    </Box>
  );
};

export default App;