    import React, { useState, useEffect } from 'react';
    import '../main/Main.css'; 
    import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
    import car from './assests/car.gif';

    const LocationBox = () => {
        const [city, setCity] = useState(null);
        const [state, setState] = useState(null);
        const [country, setCountry] = useState(null);
        const [weather, setWeather] = useState(null); // State to hold weather data
        const [statePopulation, setStatePopulation] = useState(null); // State to hold state population
        const [errorMessage, setErrorMessage] = useState('');
        const [manualInput, setManualInput] = useState(''); // State to store manual input
        const [isModalOpen, setIsModalOpen] = useState(false); 
        const [history, setHistory] = useState([]); // State to store history
        const [userId, setUserId] = useState(null);
        const [predictions, setPredictions] = useState({
            waterConsumptionForecast: null,
            waterAvailabilityPrediction: null,
            waterReusePotential: null,
            disasterReserve: null,
        });

        useEffect(() => {
            const getItem = localStorage.getItem("userID");
            if (getItem) {
                try {
                    const parsedUserId = JSON.parse(getItem); // Parse JSON string
                    console.log("Parsed userID:", parsedUserId);
                    setUserId(parsedUserId);
                } catch (error) {
                    console.error("Error parsing userID:", error);
                }
            } else {
                console.warn("No userID found in localStorage");
            }
        }, []);
      const handlePredictRequest = async () => {
            const requestData = {
                temperature: weather?.temperature,
                population: statePopulation,
            };

            try {
                const response = await fetch('https://aqua-mitra-backend-1.onrender.com/user/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();
                if (response.ok) {
                    console.log('Prediction Result:', data);
                    setPredictions(data); 
                } else {
                    console.error('Prediction Error:', data.message);
                }
            } catch (error) {
                console.error('Error making prediction request:', error);
                console.log('Sending prediction request with data:', requestData);

            }
        };
        useEffect(() => {
            if (weather && statePopulation) {
                handlePredictRequest(); 
            }
        }, [weather, statePopulation]);

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
            const apiKey = '5f72e8a3cdef40ed973161600241411'; 
            const weatherUrl = `http://api.weatherapi.com/v1/current.json?q=${city}&key=${apiKey}`;

            try {
                const response = await fetch(weatherUrl);
                const data = await response.json();
                console.log('Weather API Response:', data);

                if (data.current) {
                    setWeather({
                        temperature: data.current.temp_c, 
                    });
                } else {
                    setErrorMessage('Weather data not found');
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setErrorMessage('Unable to fetch weather data');
            }
        };
        const fetchStatePopulation = async (city) => {
            const apiKey = 'pkBvRnbBRq/m/b60RmCVtQ==fbaznAfwJTBRp4lQ'; 
            try {
                const response = await fetch(`https://api.api-ninjas.com/v1/city?name=${city}`, {
                    headers: {
                        'X-Api-Key': apiKey
                    }
                });
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const population = data[0].population; 
                    setStatePopulation(population);
                } else {
                    setStatePopulation('Unknown');
                }
            } catch (error) {
                console.error('Error fetching state population:', error);
                setStatePopulation('Unable to fetch state population');
            }
        };
        const handleManualSearch = async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?city=${manualInput}&format=json`
                );
                const data = await response.json();
                console.log(data);

                if (data.length > 0) {
                    const { display_name, lat, lon } = data[0];
                    const locationParts = display_name.split(', ');
                    setCity(locationParts[0] || 'Unknown');
                    setState(locationParts[1] || 'Unknown');
                    setCountry(locationParts[2] || 'Unknown');
                    await fetchWeatherData(locationParts[0]);
                    await fetchStatePopulation(locationParts[0]);
                    saveHistoryToBackend(setCity,setState,setCountry); 
                    setIsModalOpen(false); 
                } else {
                    setErrorMessage('Location not found');
                }
            } catch (error) {
                console.error('Error fetching location:', error);
                setErrorMessage('Unable to fetch location');
            }
        };

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
                    fetchWeatherData(city); 
                    fetchStatePopulation(city); 
                    saveHistoryToBackend();
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
                fetchWeatherData(ipLocation.city); 
                fetchStatePopulation(ipLocation.city);
            } else {
                setErrorMessage('Unable to determine location');
            }
        };

        const saveHistoryToBackend = async () => {


            if (!userId) {
                console.error('UserID is not available');
                return;
            }
        
            const entry = {
                userId, 
                city,
                state,
                country,
                weather,
                population : statePopulation,
            };
        
            try {
                const response = await fetch('https://aqua-mitra-backend-1.onrender.com/user/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry),
                });
        
                const data = await response.json();
                if (data.status === 'SUCCESS') {
                    console.log('History saved successfully!');
                    fetchHistory();
                } else {
                    console.error('Failed to save history:', data.message);
                }
            } catch (error) {
                console.error('Error saving history to backend:', error);
            }
        };
        

        const fetchHistory = async () => {
            if (!userId) {
                console.error('User ID is not available for history fetch');
                return;
            }

            try {
                const response = await fetch(`https://aqua-mitra-backend-1.onrender.com/user/get?userId=${userId}`);
                const data = await response.json();

                if (data.status === 'SUCCESS') {
                    setHistory(data.data);
                } else {
                    console.error('Failed to fetch history:', data.message);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        useEffect(() => {
            if (userId) fetchHistory();
        }, [userId]);
        

        const handleHistoryClick = (historyItem) => {
            setCity(historyItem.city);
            setState(historyItem.state);
            setCountry(historyItem.country);
            setStatePopulation(historyItem.population);
            fetchWeatherData(historyItem.city);
        };

        const groupHistoryByDate = () => {
            const grouped = {};
            history.forEach((item) => {
                const date = new Date(item.date).toLocaleDateString();
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(item);
            });
            return grouped;
        };

        const groupedHistory = groupHistoryByDate();

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
            const maxTemp = 50; 
            return Math.min((temp / maxTemp) * 100, 100); 
        };

        const calculatePopulationPercentage = (population) => {
            if (population === null) return 0;  
            const maxPopulation = 10000000;
            return Math.min((population / maxPopulation) * 100, 100); 
        };

        const calculatePredictionPercentage = (population) => {
            if (population === null) return 0;  
            const maxPopulation = 100000; 
            return Math.min((population / maxPopulation) * 100); 
        };
        const calculatePredictPercentage = (population) => {
            if (population === null) return 0;  
            const maxPopulation = 10000;
            return Math.min((population / maxPopulation) * 1000); 
        };

        const handlePredictionRequest = async () => {
            const requestData = {
                temperature:weather,
                population:statePopulation,
            };
        
            try {
                const response = await fetch('https://aqua-mitra-backend-1.onrender.com/user/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
                if (response.ok) {
                    console.log('Prediction Result:', data);
                    setPredictions({
                        waterConsumptionForecast: data.waterConsumptionForecast ? (data.waterConsumptionForecast / 100) : 0,
                        waterAvailabilityPrediction: data.waterAvailabilityPrediction ? (data.waterAvailabilityPrediction / 10) : 0,
        waterReusePotential: data.waterReusePotential ? (data.waterReusePotential / 10) : 0,
        disasterReserve: data.disasterReserve ? (data.disasterReserve / 10) : 0,
                    });
                } else {
                    console.error('Prediction Error:', data.message);
                }
            } catch (error) {
                console.error('Error making prediction request:', error);
            }
        };

        return (
                <div className="aqua-mitra-container">
                {/* Left panel */}
                <div className="sidebar">
                    <h1 className='heading'>AquaMitra</h1>
                    <div className="history">
                        {Object.entries(groupedHistory).map(([date, items]) => (
                            <div key={date}>
                                <h3 className='date'>{date === new Date().toLocaleDateString() ? 'Today' : date}</h3>
                                <ul>
                                    {items.map((item, index) => (
                                        <li
                                            key={index}
                                            className="history-item"
                                            onClick={() => handleHistoryClick(item)}
                                        >
                                            {item.city}, {item.state}, {item.country},{item.population}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                    <div className="content">
        <section className="reports-section">
            <h2 style={{fontSize: '40px'}}>Reports</h2>
            <div className="reports-grid">
                <div className="report-item">
                    <CircularProgressbarWithChildren
                        className="circular-progress-wrapper"
                        value={calculateTemperaturePercentage(weather?.temperature || 0)}
                        styles={buildStyles({
                            textColor: '#fff',
                            pathColor: '#80D1E5',
                            trailColor: '#0C5263',
                            strokeLinecap: 'round',
                        })}
                    >
                        <div>
                            <div style={{fontSize: '18px', color: '#fff', textAlign: 'center'}}>
                                <strong>{weather?.temperature ? 'Temperature' : ''}</strong>
                            </div>
                            <div style={{ fontSize: '18px', color: '#fff', textAlign: 'center'}}>
                                <strong>{weather?.temperature ? `${weather.temperature}°C` : 'Loading...'}</strong>
                            </div>
                        </div>
                    </CircularProgressbarWithChildren>
                </div>
                <div className="report-item">
                    <CircularProgressbarWithChildren
                        className="circular-progress-wrapper"
                        value={calculatePopulationPercentage(statePopulation)}
                        styles={buildStyles({
                            textColor: '#fff',
                            pathColor: '#80D1E5',
                            trailColor: '#0C5263',
                            strokeLinecap: 'round',
                        })}
                    >
                        <div className="likho">
                            <div style={{ fontSize: '18px', color: '#fff', textAlign: 'center' }}>
                                <strong>Population</strong>
                            </div>
                            <div style={{ fontSize: '18px', color: '#fff', textAlign: 'center'}}>
                                {statePopulation !== null ? statePopulation : 'Loading...'}
                            </div>
                        </div>
                    </CircularProgressbarWithChildren>
                </div>
            </div>
            <div className="prediction-cards">
        {[
            {
                label: "Water Consumption",
                value: predictions.waterConsumptionForecast,
                unit: "%", 
                calculation: (value) => calculatePredictionPercentage(value.toFixed(2)).toFixed(2), 
            },
            {
                label: "Water Availability",
                value: predictions.waterAvailabilityPrediction,
                unit: "litres", // Specify the unit
                maxValue: 500,
                calculation: (value) => calculatePredictPercentage((value / 100).toFixed(1)).toFixed(2), 
            },
            {
                label: "Water Reuse",
                value: predictions.waterReusePotential,
                unit: "years",
                maxValue: 5000,
                calculation: (value) => (value * 1).toFixed(1), 
            },
            {
                label: "Disaster Reserve",
                value: predictions.disasterReserve,
                unit: "%",
                maxValue: 100,
                calculation: (value) => (value * 1).toFixed(1), 
            },
        ].map((item, index) => (
            <div className="report-items" key={index}>
                <CircularProgressbarWithChildren
                    value={item.calculation(item.value || 0)} 
                    styles={buildStyles({
                        textColor: '#fff',
                        pathColor: '#80D1E5',
                        trailColor: '#0C5263',
                        strokeLinecap: 'round',
                    })}
                >
                    <div>
                        <div style={{ fontSize: '14px', color: '#fff', textAlign: 'center' }}>
                            <strong>{item.label}</strong>
                        </div>
                        <div style={{ fontSize: '18px', color: '#fff', textAlign: 'center' }}>
                            {item.value !== null
                                ? `${item.calculation(item.value)} ${item.unit}` 
                                : 'Loading...'}
                        </div>
                    </div>
                </CircularProgressbarWithChildren>
            </div>
                ))}
            </div>
        </section>
                        <footer className="footer">
                            <div className="location-item">{city || 'City: Loading...'}</div>
                            <div className="location-item">{state || 'State: Loading...'}</div>
                            <div className="location-item">{country || 'Country: Loading...'}</div>
                            <button
                                className="manual-location-button styled-button"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Enter Location Manually
                            </button>
                        </footer>
                    </div>
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Enter Location</h3>
                                <input
                                    type="text"
                                    placeholder="Enter city name"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                />
                                <button onClick={handleManualSearch}>Search</button>
                                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                
                </div>
            );
        };
    export default LocationBox;
