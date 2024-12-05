import React, { useState } from "react";
import "../main/Main.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Electric.css';

const EnergyConsumptionBox = () => {
    const [date, setDate] = useState("");
    const [state, setState] = useState("");
    const [predictedValue, setPredictedValue] = useState(null);
    const [fossilFuel, setFossilFuel] = useState(null);
    const [hydro, setHydro] = useState(null);
    const [nuclear, setNuclear] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleFetchPrediction = async () => {
        if (!date || !state) {
            setErrorMessage("Please select both state and date.");
            return;
        }

        const requestData = { date, state };
        console.log(requestData);

        try {
            const response = await fetch("https://prediction-90g6.onrender.com/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok && data.success && data.data?.predictedValue) {
                setPredictedValue(data.data.predictedValue);
                setFossilFuel(data.data.energyDistribution.fossilFuel);
                setHydro(data.data.energyDistribution.hydroelectricity);
                setNuclear(data.data.energyDistribution.nuclearElectricity);
                setErrorMessage("");
            } else {
                setErrorMessage(data.message || "Failed to fetch predictions.");
            }
        } catch (error) {
            console.error("Error fetching prediction:", error);
            setErrorMessage("Error fetching data from the server.");
        }
    };

    const formatDate = (date) => {
        if (!date) return "None";
        const formattedDate = new Date(date).toLocaleDateString("en-GB");
        return formattedDate.replace(/\//g, "-");
    };

    return (
        <div className="energy-consumption-container">
            <div className="header">
                <h1 className="heading">Energy Consumption Prediction</h1>
            </div>

            <div className="inputs">
                <div className="dropdown">
                    <label>Select State: </label>
                    <select value={state} onChange={(e) => setState(e.target.value)}>
                        <option value="">Select a state</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                    </select>
                </div>

                <div className="date-picker">
                    <label>Select Date: </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="divison">
                    <button className="fetch-button styled-button" onClick={handleFetchPrediction}>
                        Fetch Predictions
                    </button>
                    <h3>Total Energy Consumption <span className="text">{predictedValue || 0} MV</span></h3>
                </div>
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {predictedValue !== null && (
                <div className="predictions">
                    <h2 className="prediction-header">Energy Consumption Breakdown</h2>
                    <div className="cards-container">
                        <div className="report-card">
                            <div style={{ textAlign: "center", color: "#fff", padding: "10px" }}>
                                <strong>Fossil Fuel</strong>
                                <p>{fossilFuel} MW</p>
                            </div>
                        </div>
                        <div className="report-card">
                            <div style={{ textAlign: "center", color: "#fff", padding: "10px" }}>
                                <strong>Hydroelectricity</strong>
                                <p>{hydro} MW</p>
                            </div>
                        </div>
                        <div className="report-card">
                            <div style={{ textAlign: "center", color: "#fff", padding: "10px" }}>
                                <strong>Nuclear Energy</strong>
                                <p>{nuclear} MW</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="footer">
                <div className="footer-item">
                    <strong>Selected State:</strong> {state || "None"}
                </div>
                <div className="footer-item">
                    <strong>Selected Date:</strong> {formatDate(date)}
                </div>
            </footer>
        </div>
    );
};

export default EnergyConsumptionBox;
