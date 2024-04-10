export async function LocationOccupancy(
  locationId: string
): Promise<OccupancyResponse> {
  const response = await fetch(
    `https://portal.urbanclimb.com.au/uc-services/ajax/gym/occupancy.ashx?branch=${locationId}`
  )
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export async function LastRouteSet(
  locationId: string
): Promise<LastSetResponse> {
  const response = await fetch(
    `https://api-prod.urbanclimb.com.au/widgets/last-set?branch=${locationId}`
  )
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}
