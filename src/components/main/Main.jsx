import React, { useState, useEffect } from 'react';
import '../main/Main.css'; // Import the CSS file
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";


const LocationBox = () => {
    const [city, setCity] = useState(null);
    const [state, setState] = useState(null);
    const [country, setCountry] = useState(null);
    const [weather, setWeather] = useState(null); // State to hold weather data
    const [statePopulation, setStatePopulation] = useState(null); // State to hold state population
    const [errorMessage, setErrorMessage] = useState('');

    const fetchLocationFromIP = async () => {
        try {
            const response = await fetch('https://ipinfo.io?token=34a38b89bec2bf');
            const data = await response.json();
            const [lat, lon] = data.loc.split(',');
            return { city: data.city, state: data.region, country: data.country };
        } catch (error) {
            console.error('Error fetching location from IP:', error);
            return null;
        }
    };

    const fetchWeatherData = async (city) => {
        const apiKey = '5f72e8a3cdef40ed973161600241411'; // Replace with your WeatherAPI key
        const weatherUrl = `http://api.weatherapi.com/v1/current.json?q=${city}&key=${apiKey}`;

        try {
            const response = await fetch(weatherUrl);
            const data = await response.json();
            console.log('Weather API Response:', data); // Log the API response

            if (data.current) {
                setWeather({
                    temperature: data.current.temp_c, // Celsius temperature
                });
            } else {
                setErrorMessage('Weather data not found');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setErrorMessage('Unable to fetch weather data');
        }
    };

    // Function to fetch the population using the provided API
    // const fetchStatePopulation = async (city) => {
    //     const apiKey = 'pkBvRnbBRq/m/b60RmCVtQ==fbaznAfwJTBRp4lQ'; 
    //     try {
    //         const response = await fetch(`https://api.api-ninjas.com/v1/city?name=${city}`, {
    //             headers: {
    //                 'X-Api-Key': apiKey
    //             }
    //         });
    //         const data = await response.json();
            
    //         if (data && data.length > 0) {
    //             const population = data[0].population; 
    //             setStatePopulation(population);
    //         } else {
    //             setStatePopulation('Unknown');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching state population:', error);
    //         setStatePopulation('Unable to fetch state population');
    //     }
    // };

    const handleGeolocationSuccess = (pos) => {
        const { latitude, longitude } = pos.coords;

        const fetchLocationFromCoordinates = async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await response.json();
                const { city, state, country } = data.address;
                setCity(city || 'Unknown');
                setState(state || 'Unknown');
                setCountry(country || 'Unknown');
                fetchWeatherData(city); // Fetch weather data for the obtained city
                fetchStatePopulation(city); // Fetch state population using city
            } catch (error) {
                console.error('Error fetching location from coordinates:', error);
                setErrorMessage('Unable to get location');
            }
        };

        fetchLocationFromCoordinates();
    };

    const handleGeolocationError = async (err) => {
        if (err.code === 1) {
            alert("Please allow geolocation access");
        } else {
            alert("Cannot get current location");
        }

        const ipLocation = await fetchLocationFromIP();
        if (ipLocation) {
            setCity(ipLocation.city);
            setState(ipLocation.state);
            setCountry(ipLocation.country);
            fetchWeatherData(ipLocation.city); // Fetch weather data for the city based on IP
            fetchStatePopulation(ipLocation.city); // Fetch state population
        } else {
            setErrorMessage('Unable to determine location');
        }
    };

    useEffect(() => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 2000,
        };

        navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError, options);
    }, []);

    const calculateTemperaturePercentage = (temp) => {
        if (temp === null) return 0;
        const maxTemp = 50; // Maximum temperature for 100%
        return Math.min((temp / maxTemp) * 100, 100); // Calculate percentage
    };

    const calculatePopulationPercentage = (population) => {
        if (population === null) return 0;
        const maxPopulation = 10000000; // Example max population for 100%
        return Math.min((population / maxPopulation) * 100, 100); // Calculate percentage
    };


    return (
        <div className="aqua-mitra-container">
        {/* Left panel */}
        <div className="sidebar">
            <h1>AquaMitra</h1>
        </div>

        {/* Main content */}
        <div className="content">
            {/* Reports Section */}
            <section className="reports-section">
                <h2>Reports</h2>
                <div className="reports-grid">
                    <div className="report-item">
                        <h3>Temperature</h3>
                        <p>{weather?.temperature ? `${weather.temperature}°C` : 'Loading...'}</p>
                        <CircularProgressbar className='circular-progress-wrapper'
                            value={calculateTemperaturePercentage(weather?.temperature)}
                            text={`${calculateTemperaturePercentage(weather?.temperature).toFixed(0)}%`}
                            styles={buildStyles({
                                textColor: '#fff',
                                pathColor: '#80D1E5',
                                trailColor: '#0C5263',
                                strokeLinecap: 'round',
                            })}
                        />
                    </div>
                    <div className="report-item">
                        <h3>Population</h3>
                        <p>{statePopulation !== null ? statePopulation : 'Loading...'}</p>
                        <CircularProgressbar className='circular-progress-wrapper'
                            value={calculatePopulationPercentage(statePopulation)}
                            text={`${calculatePopulationPercentage(statePopulation).toFixed(0)}%`}
                            styles={buildStyles({
                                textColor: '#fff',
                                pathColor: '#80D1E5',
                                trailColor: '#0C5263',
                                strokeLinecap: 'round',
                            })}
                        />
                    </div>
                </div>
            </section>
            <div>
              
            </div>

            {/* Footer Section */}
            <footer className="footer">
                <div className="location-item">{city || 'City: Loading...'}</div>
                <div className="location-item">{state || 'State: Loading...'}</div>
                <div className="location-item">{country || 'Country: Loading...'}</div>
            </footer>
        </div>
    </div>
);
};
export default LocationBox;
