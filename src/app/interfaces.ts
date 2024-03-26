interface OccupancyResponse {
    LastUpdated: string,
    Name: string,
    Current: number,
    Leaving: number,
    Allowed: number,
    Bookings: number,
    Capacity: number,
    Offset: number,
    GoogleStatus: string,
    Remaining: number,
    Status: string,
    Colour: string,
    CurrentPercentage: number,
    FontColour: string,
    WaitingTime: string,
    Floor: string,
    KidsNames: Array<unknown>
}