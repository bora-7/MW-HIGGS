import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { FormInput } from '../App';

type Props = {
  inputs: FormInput;
  refresh: boolean;
}

const ParticleEnergyPlot = ({ inputs, refresh }: Props) => {
  const WIDTH = 20;
  const HEIGHT = 20;
  const DIFFUSIONRADIUS = 13;
  const VEV = 246e10  // GeV in eV
  const particle = inputs.particle
  const velocity = inputs.velocity; // This could also be dynamic

  let x_loc = 10;
  const [y_loc, setYLoc] = useState(0); // Convert y_loc to a state variable

  const [data, setData] = useState<any[]>([]);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    // Logic to increase y_loc
    setYLoc((prevYLoc) => prevYLoc + 1);
  }, [refresh]); // This effect depends on the refresh prop


  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 0.1); // Adjust time increment for animation speed
    }, 100); // Adjust interval for frame rate
    
    const Particles_Dict = {
      "Electron": 9.11e-31,
      "Neutron": 1.674e-27,
      "QuarkUp": 3.56e-30,
      "QuarkDown": 8.9e-30,
      "QuarkCharm": 2.28e-36,
      "QuarkStrange": 2.1e-28
    };

    //let df_energy: number[][] = Array.from(Array(WIDTH), () => new Array(HEIGHT).fill(0));  
    let df_energy: number[][] = Array(HEIGHT).fill(0).map(() => Array(WIDTH).fill(0)); //Higgs Field
    const h = 2.81794e-15; // Reduced Compton Wavelength (Radius of an electron?)
    const g = 9.81;  // Gravitational Acceleration
    const c = 299792458;  // Speed of light
    const e = -1.602176634e-19;  // Elementary charge
    const numerator = h*g;
    const denominatorp1 = 0.5 * VEV**2;
    const denominatorp2 = (VEV*(e**2)*(c**4))/(16*(Math.PI**2)*(velocity**2));
    const denominator = denominatorp1 - denominatorp2;
    var energy = numerator/denominator;

    energy *= 10e38;

    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        let dx = x_loc - x;
        let dy = y_loc - y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (energy /(1+distance/DIFFUSIONRADIUS) > 1) {
          // Create a descending circular area
          df_energy[y][x] = energy /(1+distance/DIFFUSIONRADIUS);
        }
      }
      if (x === WIDTH-1) {
        df_energy[y_loc][x_loc] = energy;
      }
    }
    
    console.log(df_energy);
    console.log(energy);

    // Particle trajectory
    const trajectoryZ = Array(WIDTH).fill(energy + 20); // Slightly above the energy surface
    const trajectoryY = Array.from({ length: WIDTH }, (_, i) => i); // Straight line across X-axis
    const trajectoryX = Array(WIDTH).fill(HEIGHT / 2); // Center of Y-axis

    
    setData([
      // Energy surface
      {
        type: 'surface',
        z: df_energy,
        contours: {
          z: {
            show: false,
            usecolormap: true,
            project: { z: true },
          },
        },
        showscale: false, // Hide color scale for surface
      },
      // Particle trajectory
      {
        type: 'scatter3d',
        mode: 'lines',
        x: trajectoryX,
        y: trajectoryY,
        z: trajectoryZ,
        line: {
          color: 'red',
          width: 6,
        },
      },
    ]);
  }, [inputs, particle, velocity, refresh, x_loc, y_loc]); // Empty dependency array means this effect runs once on mount



  return (
    <Plot
      data={data}
      layout={{
        title: 'Particle Energy Distribution around Neutron with Higgs Field Effect',
        autosize: true,
        width: 1000,
        height: 700
      }}
    />
  );
};

export default ParticleEnergyPlot;
