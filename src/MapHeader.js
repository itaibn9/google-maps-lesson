import React, {useState} from 'react';
import './App.css';




function MapHeader({location, pointsPerGuess ,distance}) {
  

    return (
        <div className="map-header">
            <b>Location to find: {location[0].MGLSDE_LOC ? location[0].MGLSDE_LOC : location.MGLSDE_L_4}      </b>
    { distance && <b>Distance: {distance.toFixed(2)}</b>  }
    <b>Points: {pointsPerGuess}</b>
        </div>
    )
}

export default MapHeader;
