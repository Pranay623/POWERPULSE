import React, { useState, useEffect } from 'react';
import '../main/Main.css'; 
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";


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

    const handleLogin = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5001/user/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
            if (data.status === 'SUCCESS') {
                // Store the userID in local storage
                localStorage.setItem('userID', data.data.userID);
                console.log('Login successful! UserID:', data.data.userID);
    
                // Proceed with further actions after successful login, e.g., redirecting to the home page
            } else { 
                console.error('Login failed:', data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };
    
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
                fetchWeatherData(city); // Fetch weather data for the obtained city
                fetchStatePopulation(city); // Fetch state population using city
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
            fetchWeatherData(ipLocation.city); // Fetch weather data for the city based on IP
            fetchStatePopulation(ipLocation.city); // Fetch state population
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
            const response = await fetch('http://localhost:5001/user/save', {
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
            const response = await fetch(`http://localhost:5001/user/get?userId=${userId}`);
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
        const maxPopulation = 10000000; // Example max population for 100%
        return Math.min((population / maxPopulation) * 100, 100); 
    };

    const handlePredictionRequest = async () => {
        const requestData = {
            temprature:weather,
            population:statePopulation,
        };
    
        try {
            const response = await fetch('http://localhost:5001/user/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Prediction Result:', data);
                // Handle the prediction data (display or use it in your app)
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
                <h1>AquaMitra</h1>
                <div className="history">
                    {Object.entries(groupedHistory).map(([date, items]) => (
                        <div key={date}>
                            <h3>{date === new Date().toLocaleDateString() ? 'Today' : date}</h3>
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

                {/* Main content */}
                <div className="content">
                    {/* Reports Section */}
                    <section className="reports-section">
                        <h2>Reports</h2>
                        <div className="reports-grid">
                            <div className="report-item">
                                <CircularProgressbarWithChildren
                                    className="circular-progress-wrapper"
                                    value={weather?.temperature || 0}
                                    styles={buildStyles({
                                        textColor: '#fff',
                                        pathColor: '#80D1E5',
                                        trailColor: '#0C5263',
                                        strokeLinecap: 'round',
                                    })}
                                >
                                    <div className='likho'><div style={{ fontSize: '20px', color: '#fff', textAlign: 'center' }}>
                                        <strong>{weather?.temperature ? 'Temperature' : ''}</strong>
                                    </div>
                                    <div style={{ fontSize: '20px', color: '#fff', textAlign: 'center' }}>
                                        <strong>{weather?.temperature ? `${weather.temperature}°C` : 'Loading...'}</strong>
                                    </div></div>
                                    
                                </CircularProgressbarWithChildren>
                            </div>
                            <div className="report-item">
                                <CircularProgressbarWithChildren className='circular-progress-wrapper'
                                    value={calculatePopulationPercentage(statePopulation)} 
                                    styles={buildStyles({
                                        textColor: '#fff',
                                        pathColor: '#80D1E5',
                                        trailColor: '#0C5263',
                                        strokeLinecap: 'round',
                                    })}
                                >
                                    <div className='likho'><div style={{ fontSize: '14px', color: '#fff' }}>
                                        <strong>Population</strong>
                                    </div>
                                    <div style={{ fontSize: '18px', color: '#fff', marginTop: '5px' }}>
                                        {statePopulation !== null ? statePopulation : 'Loading...'}
                                    </div></div>
                                    
                                </CircularProgressbarWithChildren>
                            </div>
                        </div>
                    </section>

                    {/* Footer Section */}
                    <footer className="footer">
                        <div className="location-item">{city || 'City: Loading...'}</div>
                        <div className="location-item">{state || 'State: Loading...'}</div>
                        <div className="location-item">{country || 'Country: Loading...'}</div>
                        <button
                            className="manual-location-button"
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
