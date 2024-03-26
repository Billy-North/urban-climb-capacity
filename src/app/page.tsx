"use client"
import { Alert, CircularProgress, LinearProgress, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BarChart, Gauge, axisClasses, gaugeClasses } from "@mui/x-charts";
import { QueryClient, QueryClientProvider, useQueries, useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LocationOccupancy } from "./api/urbanclumb";

const LOCATIONS = new Map([
  ['West End', "D969F1B2-0C9F-49A9-B2AC-D7775642F298"],
  ['Milton', "690326F9-98CE-4249-BD91-53A0676A137B"],
  ['Newstead', "A3010228-DFC6-4317-86C0-3839FFDF3FD0"],
  ['Collingwood', "8674E350-D340-4AB3-A462-5595061A6950"],
  ['Blackburn', "46E5373C-2310-4520-B576-CCB4E4EF548D"],
  ['Townsville', "31D5CE53-0CA1-40A5-AEA6-65A72F786492"],
]);

const COMPARE = "Compare"

function LocationSelection(props: {
  selectedLocation: string;
  setSelectedLocation: Dispatch<SetStateAction<string>>;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ToggleButtonGroup
      value={props.selectedLocation}
      exclusive
      fullWidth
      size="medium"
      orientation={isMobile ? "vertical" : "horizontal"}

    >
      {[...Array.from(LOCATIONS.keys()), COMPARE].map((location) =>
        <ToggleButton key={location}
          onClick={() => props.setSelectedLocation(location)}
          value={location}>{location}</ToggleButton>
      )}
    </ToggleButtonGroup>
  )

}

function OccupancyGuage(props: { occupancy: number, fillColor: string }) {
  return (
    <div style={{ height: '300px' }}>
      <Gauge
        value={Math.round(props.occupancy)}
        startAngle={-110}
        endAngle={110}
        valueMax={100}
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 55,
            transform: 'translate(0px, 0px)',

          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: props.fillColor
          },
        }}
        text={
          ({ value }) => `${value}%`
        }
      />
    </div>
  )
}


function Occopancy(props: { selectedLocation: string }) {
  const locationId = LOCATIONS.get(props.selectedLocation) || ''
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const { isPending, isError, data } = useQuery<OccupancyResponse>({
    queryKey: ['occupancy', locationId],
    refetchInterval: 6000,
    queryFn: () => LocationOccupancy(locationId)
  })

  if (isError) {
    return <Alert severity="error">Failed to load occupancy data for: {props.selectedLocation}</Alert>
  }

  if (isPending) {
    return <LinearProgress />;
  }

  if (data) {
    return (
      <>
        <Typography variant="h4">
          Status: {data.Status}
        </Typography>
        <Typography variant="subtitle1" >
          Last Updated: {Math.floor(Math.abs(Number(currentTime) - Number(new Date(data.LastUpdated))) / 1000)} seconds ago
        </Typography>
        <OccupancyGuage occupancy={data.CurrentPercentage} fillColor={data.Colour} />
      </>
    )
  }
}

function CompareOccupancy() {
  const locationQueries = useQueries({
    queries: Array.from(LOCATIONS.values()).map((locationId) => {
      return {
        queryKey: ['occupancy', locationId],
        queryFn: () => LocationOccupancy(locationId)
      }
    }),
  })

  const allFinished = locationQueries.every(q => q.isSuccess && q.data)
  const oneIsPending = locationQueries.every(q => q.isPending)
  const oneHasError = locationQueries.find(q => q.isError) !== undefined

  if (oneHasError) {
    return <Alert severity="error">Failed to load occupancy data</Alert>
  }

  if (oneIsPending) {
    return <CircularProgress disableShrink />;
  }
  const valueFormatter = (value: number | null) => `${value}%`;

  if (allFinished) {
    return (
      <div style={{ width: '35em', height: '35em', margin: 'auto' }}>
        <BarChart
          dataset={locationQueries.map((v) => {
            return { percentage: v.data && Math.floor(v.data.CurrentPercentage), location: v.data?.Name }
          })}
          yAxis={[{ max: 100, min: 0, valueFormatter: valueFormatter }]}
          xAxis={[{ scaleType: 'band', dataKey: 'location' }]}
          series={[{ dataKey: 'percentage', label: 'Occupancy Capacity', valueFormatter }]}
          sx={locationQueries.map((v, idx) => {
            return {
              [`& .MuiBarElement-root:nth-child(${idx + 1})`]: {
                fill: v.data?.Colour,
              }
            }
          })}
        />
      </div>
    );
  }
}


const queryClient = new QueryClient();

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("West End");

  return (
    <>
      <div style={{ width: '100%', margin: 'auto' }}>
        <LocationSelection selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
      </div>

      <QueryClientProvider client={queryClient}>
        <div style={{ margin: 'auto', textAlign: 'center', width: '60%', padding: 30 }}>
          {selectedLocation !== COMPARE ? <Occopancy selectedLocation={selectedLocation} /> :
            <CompareOccupancy />
          }
        </div>
      </QueryClientProvider>
    </ >
  );
}