// Imports React tools, map components, styling, and sample data used by the app
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";
import { sampleBookings } from "./data/bookings";
import { sampleDrivers } from "./data/drivers";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Automatically adjusts the map view so both pickup and destination markers are visible
function FitMapToRoute({ pickupPosition, destinationPosition }) {
    const map = useMap();

    useEffect(() => {
        const bounds = [pickupPosition, destinationPosition];

        map.fitBounds(bounds, {
            padding: [40, 40]
        });
    }, [map, pickupPosition, destinationPosition]);

    return null;
}

function App() {
    const [pickupSuburb, setPickupSuburb] = useState("Auckland CBD");
    const [destinationSuburb, setDestinationSuburb] = useState("Northcote");
    const [bookingReference, setBookingReference] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [trackerResult, setTrackerResult] = useState(null);
    const [trackerError, setTrackerError] = useState("");
    const [assignedDriver, setAssignedDriver] = useState(null);

    // Approximate coordinates used for map markers around Auckland
    const suburbLocations = {
        "Auckland CBD": [-36.8485, 174.7633],
        "Northcote": [-36.8012, 174.7494],
        "Mount Eden": [-36.8782, 174.7646],
        "Newmarket": [-36.8690, 174.7770],
        "Manukau": [-36.9928, 174.8799],
        "Auckland Airport": [-37.0082, 174.7850]
    };

    const pickupPosition = suburbLocations[pickupSuburb];
    const destinationPosition = suburbLocations[destinationSuburb];

    // Calculates the approximate distance in kilometres between two map coordinates
    function calculateDistance(positionOne, positionTwo) {
        const earthRadius = 6371;
        const latOne = positionOne[0] * Math.PI / 180;
        const latTwo = positionTwo[0] * Math.PI / 180;
        const latDifference = (positionTwo[0] - positionOne[0]) * Math.PI / 180;
        const lonDifference = (positionTwo[1] - positionOne[1]) * Math.PI / 180;

        // Uses a distance formula to estimate the straight-line distance between the two suburbs
        const a =
            Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
            Math.cos(latOne) * Math.cos(latTwo) *
            Math.sin(lonDifference / 2) * Math.sin(lonDifference / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    // Rounds the calculated distance and make sure minimum displayed distance is 1km
    const estimatedDistance = Math.max(
        1,
        Math.round(calculateDistance(pickupPosition, destinationPosition))
    );

    // Calculates the estimated taxi fare using a base fare, distance charge, and service fee
    const baseFare = 4;
    const distanceCharge = estimatedDistance * 2.5;
    const serviceFee = 2;
    const totalFare = baseFare + distanceCharge + serviceFee;

    // Filters drivers based on the selected availability status
    const filteredDrivers = sampleDrivers.filter((driver) => {
        if (selectedStatus === "All") {
            return true;
        }

        return driver.status === selectedStatus;
    });

    // Searches the sample booking data and displays the matching booking status
    function trackBooking() {
        const foundBooking = sampleBookings.find(
            (booking) => booking.reference.toLowerCase() === bookingReference.toLowerCase()
        );

        if (bookingReference.trim() === "") {
            setTrackerResult(null);
            setTrackerError("Please enter a booking reference number.");
            return;
        }

        if (!/^BRN\d{5}$/i.test(bookingReference)) {
            setTrackerResult(null);
            setTrackerError("Booking reference must use the format BRN00001.");
            return;
        }

        if (!foundBooking) {
            setTrackerResult(null);
            setTrackerError("No booking was found for that reference number.");
            return;
        }

        setTrackerError("");
        setTrackerResult(foundBooking);
    }

    // Allows admin to select an available driver for the currently selected route
    function assignDriver(driver) {
        if (driver.status !== "Available") {
            setAssignedDriver({
                message: `${driver.name} is currently busy and cannot be assigned.`,
                type: "error"
            });
            return;
        }

        setAssignedDriver({
            message: `${driver.id} - ${driver.name} has been selected for the route from ${pickupSuburb} to ${destinationSuburb}.`,
            type: "success"
        });
    }

    return (
        <main className="app">
            <section className="hero">
              <h1>CabsOnline Plus</h1>
              <p>
                  A React-based extension of the Part 1 CabsOnline booking and admin system, 
                  using sample booking and driver data to demonstrate extra taxi service features.
              </p>
            </section>

            <section className="grid">
                <div className="card">
                    <h2>1. Map Based Interaction</h2>
                    <p className="sectionText">
                        Select pickup and destination suburbs to preview the taxi journey on an interactive map.
                    </p>

                    <label>Pickup suburb</label>
                    <select value={pickupSuburb} onChange={(e) => setPickupSuburb(e.target.value)}>
                        <option>Auckland CBD</option>
                        <option>Mount Eden</option>
                        <option>Manukau</option>
                        <option>Northcote</option>
                    </select>

                    <label>Destination suburb</label>
                    <select value={destinationSuburb} onChange={(e) => setDestinationSuburb(e.target.value)}>
                        <option>Northcote</option>
                        <option>Newmarket</option>
                        <option>Auckland Airport</option>
                        <option>Auckland CBD</option>
                    </select>

                    <div className="leafletMap">
                        <MapContainer
                            center={pickupPosition}
                            zoom={12}
                            scrollWheelZoom={false}
                            className="mapContainer"
                            key={`${pickupSuburb}-${destinationSuburb}`}
                        >
                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <FitMapToRoute
                                pickupPosition={pickupPosition}
                                destinationPosition={destinationPosition}
                            />

                            <Marker position={pickupPosition}>
                                <Popup>Pickup: {pickupSuburb}</Popup>
                            </Marker>

                            <Marker position={destinationPosition}>
                                <Popup>Destination: {destinationSuburb}</Popup>
                            </Marker>

                            <Polyline positions={[pickupPosition, destinationPosition]} />
                        </MapContainer>
                    </div>
                </div>

                <div className="card">
                    <h2>2. Fare Estimate</h2>
                    <p className="sectionText">
                        The fare estimate updates when the selected route changes.
                    </p>

                    <div className="fareRow">
                        <span>Estimated distance</span>
                        <strong>{estimatedDistance} km</strong>
                    </div>

                    <div className="fareRow">
                        <span>Base fare</span>
                        <strong>${baseFare.toFixed(2)}</strong>
                    </div>

                    <div className="fareRow">
                        <span>Distance charge</span>
                        <strong>${distanceCharge.toFixed(2)}</strong>
                    </div>

                    <div className="fareRow">
                        <span>Service fee</span>
                        <strong>${serviceFee.toFixed(2)}</strong>
                    </div>

                    <div className="fareTotal">
                        Estimated total: ${totalFare.toFixed(2)}
                    </div>
                </div>

                <div className="card">
                    <h2>3. Customer Booking Tracker</h2>
                    <p className="sectionText">
                        Try BRN00001, BRN00002, or BRN00003.
                    </p>

                    <label>Booking reference</label>
                    <input
                        type="text"
                        value={bookingReference}
                        placeholder="BRN00001"
                        onChange={(e) => setBookingReference(e.target.value)}
                    />

                    <button onClick={trackBooking}>Track Booking</button>

                    {trackerError && <p className="error">{trackerError}</p>}

                    {trackerResult && (
                        <div className="trackerResult">
                            <h3>{trackerResult.reference}</h3>
                            <p>Status: {trackerResult.status}</p>
                            <p>Pickup: {trackerResult.pickupSuburb}</p>
                            <p>Destination: {trackerResult.destinationSuburb}</p>
                            <p>Driver: {trackerResult.driverId || "Not assigned yet"}</p>
                            <p>Estimated arrival: {trackerResult.estimatedArrival}</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <h2>4. Driver Availability</h2>
                    <p className="sectionText">
                        Admin can view, filter, and select available drivers.
                    </p>

                    <label>Filter by status</label>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option>All</option>
                        <option>Available</option>
                        <option>Busy</option>
                    </select>

                    {assignedDriver && (
                        <p className={assignedDriver.type === "success" ? "success" : "error"}>
                            {assignedDriver.message}
                        </p>
                    )}

                    <div className="driverList">
                        {filteredDrivers.map((driver) => (
                            <div className="driverCard" key={driver.id}>
                                <h3>{driver.id} - {driver.name}</h3>
                                <p>Status: {driver.status}</p>
                                <p>Suburb: {driver.suburb}</p>
                                <p>Vehicle: {driver.vehicle}</p>
                                <p>Rating: {driver.rating}</p>
                                <button onClick={() => assignDriver(driver)}>
                                    Assign Driver
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default App;