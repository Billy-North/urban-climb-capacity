export async function LocationOccupancy(locationId: string): Promise<OccupancyResponse> {
    const response = await fetch(`https://portal.urbanclimb.com.au/uc-services/ajax/gym/occupancy.ashx?branch=${locationId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}