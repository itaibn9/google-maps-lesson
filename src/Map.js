import React, { useState, useEffect, useRef } from 'react'
import { compose } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle, Polyline, InfoWindow} from "react-google-maps";
import './App.css';
import LocationsData from './LocationsData';
import MapHeader from './MapHeader';
import Modal from './Modal';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
require('dotenv').config();
const google = window.google;
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;


const useStyles = makeStyles((theme) => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));
const mapStyles = [
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]
const defualtOptains = {
  styles: mapStyles
}


function Map() {
  const getRandomInt = (max) => {
      return Math.floor(Math.random() * Math.floor(max));
    }
    const classes = useStyles();
    const [difficulty, setDifficulty] = useState("Hard");
    const [open, setOpen] = useState(false);
  const [isMarkerShown, setIsMarkerShown] = useState(false)
  const [randomPosition, setRandomPosition] = useState([LocationsData[getRandomInt(LocationsData.length)]])
  const [distance, setDistance] = useState();
  const [pointsPerGuess, setPointsPerGuess] = useState(0);
  const [playsCounter, setPlaysCounter] = useState(5);
  
  const rad = function(x) {
    return x * Math.PI / 180;
  };
  const getDistance = function(p1, p2) {
    let R = 6378137; // Earth’s mean radius in meter
    let dLat = rad(p2.lat() - p1.lat());
    let dLong = rad(p2.lng() - p1.lng());
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d; // returns the distance in meter
  };
  
  const onMapClick = async (e) => {
    if(playsCounter > 0){
      const randomCoordinate = new google.maps.LatLng(randomPosition[0].Y, randomPosition[0].X)
      const guessedDistance = getDistance(randomCoordinate, e.latLng);
      const totalpoints = pointsPerGuess + calculatePoints(guessedDistance  / 1000 )
      setPointsPerGuess(totalpoints);
      setPlaysCounter(playsCounter-1)
      setDistance(guessedDistance / 1000)
      setRandomPosition(prev => [...prev, e.latLng, randomCoordinate]);
      !isMarkerShown && setIsMarkerShown(true) 
      setTimeout(() => {
        setRandomPosition([LocationsData[getRandomInt(LocationsData.length)]])
        setIsMarkerShown(false)
        setDistance()
      }, 3000)
    }
    }

    const calculatePoints = ((guessedDistance) => {
     if(guessedDistance < 10) return 100;
     else if(guessedDistance >= 10 && guessedDistance < 40) return 60;
     else if(guessedDistance >= 40 && guessedDistance < 70) return 45;
     else if(guessedDistance >= 70 && guessedDistance < 100) return 30;
     else if(guessedDistance >= 100 && guessedDistance < 170) return 15;
     else return 5;
    })

    const refreshGame = () => {
      setRandomPosition([LocationsData[getRandomInt(LocationsData.length)]])
      setIsMarkerShown(false)
      setDistance()
      setPointsPerGuess(0)
      setPlaysCounter(5);
    }

// useEffect(()=> {
//   if(playsCounter === 0){
//     setTimeout(() => {
//       // if(pointsPerGuess === 500 && pointsPerGuess !== 0) alert("You got the maximum points per game!")
//       // else alert(`You got ${pointsPerGuess}! you can do Better!`)
//       setRandomPosition([LocationsData[getRandomInt(LocationsData.length)]])
//       setIsMarkerShown(false)
//       setDistance()
//       setPointsPerGuess(0)
//       setPlaysCounter(5);
//     }, 4000)
//   }
// }, [isMarkerShown])

     
    

    const circleOptions = {
      strokeColor: "#c6d0fc",
      strokeOpacity: 0.6,
      fillColor: "#c6d0fc",
      fillOpacity: 0,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      radius: distance * 1000,
      zIndex: 1
    }
    const handleChange = (event) => {
      setDifficulty(event.target.value);
    };
  
    // const handleClose = () => {
    //   setOpen(false);
    // };
  
    // const handleOpen = () => {
    //   setOpen(true);
    // };
    
    const MapWithAMarker = compose(withScriptjs,withGoogleMap)(() =>

      <GoogleMap
      onClick={(e) => onMapClick(e)}
        defaultZoom={7.5}
        defaultCenter={{ lat: 31.5, lng: 34.5}}
        defaultOptions={difficulty==="Hard" ? defualtOptains : null}
        streetViewControl="false"
           >
             {isMarkerShown &&  
             <>
               <Marker position={randomPosition[1]} />
               <Circle options={circleOptions} center={randomPosition[1]} />
               <Marker position={randomPosition[2]} />
               <Polyline path={[randomPosition[1], randomPosition[2]]} />
               </>
             }
      </GoogleMap>
    );

   
    return (
        <div className="mapContainer">
          <div className="challengeHeader">
    <h3>Numbers of Plays: {playsCounter}</h3>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-controlled-open-select-label">difficulty</InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          // open={open}
          // onClose={handleClose}
          // onOpen={handleOpen}
          value={difficulty}
          onChange={handleChange}
        >
          <MenuItem value={"Easy"}>Easy</MenuItem>
          <MenuItem value={"Hard"}>Hard</MenuItem>
        </Select>
      </FormControl>
      </div>
    <MapHeader location={randomPosition} pointsPerGuess={pointsPerGuess} distance={distance} />
    <Modal playsCounter={playsCounter} points={pointsPerGuess} refreshGame={refreshGame}/>
<MapWithAMarker
  googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=3.exp&libraries=geometry,drawing,places,sphericals`}
  loadingElement={<div style={{ height: `100%` }} />}
  containerElement={<div style={{ height: `90vh`}} />}
  mapElement={<div style={{ height: `100%`, width: '40vw' }} />}
/>   
</div>
)
}
export default Map;
