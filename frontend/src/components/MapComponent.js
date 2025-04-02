import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { selectCurrentPoint } from '../store/pointsSlice';
import { selectAvailableImagery, selectCurrentImageryIndex } from '../store/imagerySlice';

const MapContainer = styled(Box)({
  width: '100%',
  height: '100%',
});

const MapLoadingMessage = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255, 255, 255, 0.8)',
  padding: '10px 20px',
  borderRadius: '4px',
  zIndex: 1000,
});

const MapComponent = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapLoadError, setMapLoadError] = useState(false);
  
  const currentPoint = useSelector(selectCurrentPoint);

  // TODO use actual imagery and not just baseimagery from OSM
  const availableImagery = useSelector(selectAvailableImagery);
  const currentImageryIndex = useSelector(selectCurrentImageryIndex);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      try {
        // Use OpenStreetMap as the primary source
        const osmSource = new OSM();
        
        // Add a listener to detect tile loading errors
        osmSource.on('tileloaderror', () => {
          setMapLoadError(true);
        });

        // Create base tile layer with OSM
        tileLayerRef.current = new TileLayer({
          source: osmSource,
          zIndex: 0
        });

        // Vector source for points
        const vectorSource = new VectorSource();
        vectorLayerRef.current = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({
                color: 'rgba(255, 165, 0, 0.8)'
              }),
              stroke: new Stroke({
                color: 'rgb(255, 140, 0)',
                width: 2
              })
            })
          })
        });

        // Create map with initial center
        const initialCenter = currentPoint 
          ? fromLonLat([currentPoint.lon, currentPoint.lat]) 
          : fromLonLat([0, 0]);
          
        mapInstanceRef.current = new Map({
          target: mapRef.current,
          layers: [
            tileLayerRef.current,
            vectorLayerRef.current
          ],
          view: new View({
            center: initialCenter,
            zoom: currentPoint ? 16 : 2
          })
        });
      } catch (err) {
        console.error('Error initializing map', err);
        setMapLoadError(true);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update point on the map when current point changes
  useEffect(() => {
    if (!mapInstanceRef.current || !vectorLayerRef.current) return;
    
    try {
      const vectorSource = vectorLayerRef.current.getSource();
      vectorSource.clear();
      
      // Add only current point if exists
      if (currentPoint) {
        const currentFeature = new Feature({
          geometry: new Point(fromLonLat([currentPoint.lon, currentPoint.lat]))
        });
        vectorSource.addFeature(currentFeature);
        
        // Center map on current point with animation to be fancy hehe
        mapInstanceRef.current.getView().animate({
          center: fromLonLat([currentPoint.lon, currentPoint.lat]),
          duration: 500,
          zoom: 16
        });
      }
    } catch (err) {
      console.error('Error updating map point', err);
    }
  }, [currentPoint]);

  return (
    <MapContainer ref={mapRef}>
      {mapLoadError && (
        <MapLoadingMessage>
          Map data loading issue
        </MapLoadingMessage>
      )}
      {!currentPoint && (
        <MapLoadingMessage>
          Upload CSV data to begin annotation
        </MapLoadingMessage>
      )}
    </MapContainer>
  );
};

export default MapComponent;