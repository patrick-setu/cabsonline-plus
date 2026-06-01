// Sample booking records used by the customer booking tracker
// These records simulate bookings from the Part 1 CabsOnline system

export const sampleBookings = [
    {
        reference: "BRN00001",
        customerName: "John Smith",
        phone: "0211234567",
        pickupSuburb: "Auckland CBD",
        destinationSuburb: "Northcote",
        pickupTime: "14:30",
        pickupDate: "02/06/2026",
        status: "Driver assigned",
        driverId: "D101",
        estimatedArrival: "8 minutes"
    },
    {
        reference: "BRN00002",
        customerName: "Mary Chen",
        phone: "0217654321",
        pickupSuburb: "Mount Eden",
        destinationSuburb: "Newmarket",
        pickupTime: "15:00",
        pickupDate: "02/06/2026",
        status: "Taxi on the way",
        driverId: "D102",
        estimatedArrival: "5 minutes"
    },
    {
        reference: "BRN00003",
        customerName: "Alex Brown",
        phone: "0215551234",
        pickupSuburb: "Manukau",
        destinationSuburb: "Auckland Airport",
        pickupTime: "16:15",
        pickupDate: "02/06/2026",
        status: "Booking received",
        driverId: "",
        estimatedArrival: "Waiting for driver"
    }
];