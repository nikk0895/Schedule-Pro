// src/pages/schedule-session.tsx

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

export default function ScheduleSessionPage() {
  const [patient, setPatient] = useState<{ name: string; photo?: string } | null>(null);
  const [doctor, setDoctor] = useState<{ name: string; phone: string; photo?: string } | null>(null);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [sessionType, setSessionType] = useState('Counselling');
  const [sessionDate, setSessionDate] = useState<Dayjs | null>(dayjs());
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tempSelectedSlot, setTempSelectedSlot] = useState('');
  const [onlineLink, setOnlineLink] = useState('');


  const router = useRouter();

  useEffect(() => {
    const patientData = localStorage.getItem('patientInfo');
    const doctorData = localStorage.getItem('selectedDoctor');

    if (patientData) {
      const parsed = JSON.parse(patientData);
      setPatient({ name: parsed.name, photo: '/avatar.png' });
    }

    if (doctorData) {
      setDoctor(JSON.parse(doctorData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('patientInfo');
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/available-doctor');
  };

  const handleConfirm = () => {
    // You can extend this to store or send session data
    alert('Session confirmed!');
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
            position: 'relative',
          }}
        >
          <Container sx={{ py: 4 }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="outlined" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>

            {/* Patient Info */}
            <Typography variant="h5" mb={2}>
              Patient
            </Typography>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={patient?.photo} alt={patient?.name} />
              <Typography variant="h6">{patient?.name}</Typography>
            </Paper>

            {/* Doctor Info */}
            <Typography variant="h5" mt={4} mb={2}>
              Assign Practitioner
            </Typography>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={doctor?.photo || '/avatar.png'} alt={doctor?.name} />
              <Box>
                <Typography variant="h6">{doctor?.name}</Typography>
                <Typography variant="body2">Contact: {doctor?.phone}</Typography>
              </Box>
            </Paper>

            {/* Session Type Dropdown */}
            <Typography variant="h6" mt={4} mb={1}>
              Session Type
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="session-type-label">Select Session Type</InputLabel>
              <Select
                labelId="session-type-label"
                value={sessionType}
                label="Select Session Type"
                onChange={(e) => setSessionType(e.target.value)}
              >
                <MenuItem value="Counselling">Counselling</MenuItem>
                <MenuItem value="Counselling (1 hour)">Counselling (1 hour)</MenuItem>
              </Select>
            </FormControl>

            {/* Session Date and Slot */}
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={3}>
  {/* Date Picker */}
  <Box flex={1}>
    <Typography variant="subtitle2" mb={1}>
      Session Date
    </Typography>
    <DatePicker
      value={sessionDate}
      disablePast
      onChange={(newDate) => setSessionDate(newDate)}
      slotProps={{ textField: { fullWidth: true } }}
    />
  </Box>

  {/* Time Slot Field Styled Like Input */}
  <Box flex={1}>
    <Typography variant="subtitle2" mb={1}>
      Select Time Slot
    </Typography>
    <Box
      onClick={() => {
        setTempSelectedSlot(slot); // pre-fill selection
        setSlotDialogOpen(true);
      }}
      sx={{
        cursor: 'pointer',
        border: '1px solid black',
        borderRadius: 1,
        px: 2,
        py: 1.5,
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        color: slot ? 'text.primary' : 'text.secondary',
        
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      {slot || 'Choose Time Slot'}
    </Box>
  </Box>
</Box>


        {/* Session Mode (Radio Buttons) */}
        <Typography variant="h6" mb={1}>
          Select Session Mode
        </Typography>
        <RadioGroup
          row
          value={mode}
          onChange={(e) => setMode(e.target.value as 'online' | 'offline')}
        >
          <FormControlLabel value="online" control={<Radio />} label="Online" />
          <FormControlLabel value="offline" control={<Radio />} label="Offline" />
        </RadioGroup>
        {mode === 'online' && (
  <Box mt={3}>
    <Typography variant="h6" mb={1}>
      Online Session Link
    </Typography>
    <TextField
      fullWidth
      placeholder="Add Online Session Link or WhatsApp Number"
      value={onlineLink}
      onChange={(e) => setOnlineLink(e.target.value)}
    />
  </Box>
)}

        {/* Session Details */}
        <Typography variant="h6" mt={4} mb={1}>
          Session Details (Optional)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Write any additional info or notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>

        {/* Slot Selection Dialog */}
        <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Select a Time Slot</DialogTitle>
          <DialogContent dividers>
            {[
              { label: 'Morning', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] },
              { label: 'Afternoon', slots: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'] },
              { label: 'Evening', slots: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'] },
              { label: 'Night', slots: ['8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'] },
            ].map((group, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  {group.label}
                </Typography>
                <Grid container spacing={1}>
                  {group.slots.map((time) => (
                    <Grid item key={time}>
                      <Chip
  label={time}
  clickable
  sx={{
    backgroundColor: tempSelectedSlot === time ? '#EDA197' : '#f0f0f0',
    color: tempSelectedSlot === time ? '#fff' : 'black',
    '&:hover': {
      backgroundColor: tempSelectedSlot === time ? '#EDA197' : '#e0e0e0',
    },
  }}
  onClick={() => setTempSelectedSlot(time)}
/>

                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setTempSelectedSlot('');
                setSlot('');
                setSlotDialogOpen(false);
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
  onClick={() => {
    setSlot(tempSelectedSlot);
    setSlotDialogOpen(false);
  }}
  variant="contained"
  disabled={!tempSelectedSlot}
  sx={{
    backgroundColor: '#EDA197',
    '&:hover': {
      backgroundColor: '#e28b7e',
    },
  }}
>
  Confirm
</Button>

          </DialogActions>
        </Dialog>
      </Container>
      {/* Example floating button */}
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
      </LocalizationProvider>
    </>
  );
}
