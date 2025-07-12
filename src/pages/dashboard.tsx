// src/pages/dashboard.tsx
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Button,
  Fab,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddIcon from '@mui/icons-material/Add';
import { getGreetingMessage } from '@/utils/greeting';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const greeting = getGreetingMessage();
  const [patientName, setPatientName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('patientInfo');
    if (!stored) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed || !parsed.name) {
        router.push('/');
      } else {
        setPatientName(parsed.name);
      }
    } catch (err) {
      console.error('Error parsing patient info', err);
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('patientInfo');
    router.push('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
        position: 'relative',
      }}
    >
      <Box p={2}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background: 'linear-gradient(to right, #6a11cb, #2575fc)',
            color: 'white',
            p: 2,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6">{greeting},</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>{patientName}</Typography>
            <Avatar alt={patientName} src="/avatar.png" />
            <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Search bar */}
        <Box display="flex" alignItems="center" mb={2} gap={1}>
          <TextField fullWidth placeholder="Search a Psychologist" />
          <IconButton>
            <FilterAltIcon />
          </IconButton>
        </Box>

        {/* Booked doctor card */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Dr. Smith</Typography>
            <Typography variant="body2">10:00 AM - 10:30 AM</Typography>
            <Typography variant="body2">Duration: 30 mins</Typography>
            <Button variant="contained" sx={{ mt: 1 }}>
              Mark as Complete
            </Button>
          </CardContent>
        </Card>

        {/* Past history */}
        <Typography variant="h6" mt={4} mb={1}>
          Past History
        </Typography>
        <Card>
          <CardContent>
            <Typography>Dr. Jane – Completed on 5th July</Typography>
          </CardContent>
        </Card>

        {/* Schedule section */}
        <Box mt={4} textAlign="center">
          <Button variant="outlined" href="/available-doctor">
            Schedule Now
          </Button>
        </Box>
      </Box>

      {/* FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
          color: '#fff',
        }}
        aria-label="add"
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
