import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Avatar, Paper,RadioGroup,
  FormControlLabel, Radio, Button, Select, MenuItem, InputLabel,
  FormControl, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import { auth, db } from '@/utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { collection, addDoc } from "firebase/firestore";

export default function ScheduleDoctorPage() {
  const router = useRouter();
  //const [patient, setPatient] = useState<any>(null);
type Patient = { uid: string; name: string };
const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [sessionType, setSessionType] = useState('Counselling');
  const [sessionDate, setSessionDate] = useState<Dayjs | null>(dayjs());
  const [slot, setSlot] = useState('');
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [onlineLink, setOnlineLink] = useState('');
  const [notes, setNotes] = useState('');
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [tempSelectedSlot, setTempSelectedSlot] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const docRef = doc(db, 'patients', uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setPatient({ uid, ...snapshot.data() });
        }
      } else {
        router.push('/');
      }

      // Doctor: from localStorage
      const doctorData = localStorage.getItem('selectedDoctor');
      if (doctorData) {
        setDoctor(JSON.parse(doctorData));
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/available-doctor');
  };

 const handleConfirm = async () => {
  if (!patient || !doctor || !sessionDate || !slot) {
    alert('Please complete all fields before confirming.');
    return;
  }

  const sessionId = `${Date.now()}`;
 const sessionData = {
  sessionId,
  patientUid: patient.uid,
  patientName: patient.name,
  doctorName: doctor.name,
  doctorPhone: doctor.phone,
  doctorPhoto: doctor.photo,
  sessionType,
  sessionDate: sessionDate.format('YYYY-MM-DD'),
  slot,
  mode,
  onlineLink,
  notes,
  createdAt: serverTimestamp(),
  status: 'upcoming',
};

 try {
  await setDoc(doc(db, "sessions", sessionId), sessionData); // ✅ write to /sessions/{sessionId}
  alert('Session booked successfully!');
  router.push('/dashboard');
} catch (err) {
  console.error("Error saving session:", err);
  alert("Failed to book session. Try again.");
}
};


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)', position: 'relative' }}>
        <Container sx={{ py: 4 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
          </Box>

          {/* Patient Info */}
          <Typography variant="h5" mb={2}>Patient</Typography>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src="/avatar.png" />
            <Typography variant="h6">{patient?.name}</Typography>
          </Paper>

          {/* Doctor Info */}
          <Typography variant="h5" mt={4} mb={2}>Assign Practitioner</Typography>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={doctor?.photo} alt={doctor?.name} />
            <Box>
              <Typography variant="h6">{doctor?.name}</Typography>
              <Typography variant="body2">Contact: {doctor?.phone}</Typography>
            </Box>
          </Paper>

          {/* Session Type */}
          <Typography variant="h6" mt={4} mb={1}>Session Type</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="session-type-label">Select Session Type</InputLabel>
            <Select
              labelId="session-type-label"
              value={sessionType}
              label="Select Session Type"
              onChange={(e) => setSessionType(e.target.value)}
            >
              <MenuItem value="Counselling">Counselling</MenuItem>
              <MenuItem value="Therapy">Therapy</MenuItem>
            </Select>
          </FormControl>

          {/* Date and Slot Picker */}
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} mb={3}>
            <Box flex={1}>
              <Typography variant="subtitle2" mb={1}>Session Date</Typography>
              <DatePicker
                value={sessionDate}
                disablePast
                onChange={(date) => setSessionDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Box flex={1}>
              <Typography variant="subtitle2" mb={1}>Select Time Slot</Typography>
              <Box
                onClick={() => {
                  setTempSelectedSlot(slot);
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
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                {slot || 'Choose Time Slot'}
              </Box>
            </Box>
          </Box>

          {/* Mode Radio */}
          <Typography variant="h6" mb={1}>Select Session Mode</Typography>
          <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as 'online' | 'offline')}>
            <FormControlLabel value="online" control={<Radio />} label="Online" />
            <FormControlLabel value="offline" control={<Radio />} label="Offline" />
          </RadioGroup>

          {mode === 'online' && (
            <Box mt={3}>
              <Typography variant="h6" mb={1}>Online Session Link</Typography>
              <TextField
                fullWidth
                placeholder="Zoom/Google Meet/WhatsApp Link"
                value={onlineLink}
                onChange={(e) => setOnlineLink(e.target.value)}
              />
            </Box>
          )}

          {/* Notes */}
          <Typography variant="h6" mt={4} mb={1}>Session Details (Optional)</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
          />

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
           <Button
  variant="contained"
  onClick={handleConfirm}
  sx={{
    background: 'linear-gradient(to right, #f1707d, #b755ff)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(to right, #e85c6d, #a04fe5)',
    },
  }}
>
  Confirm
</Button>
          </Box>

          {/* Time Slot Dialog */}
          <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Select a Time Slot</DialogTitle>
            <DialogContent dividers>
              {[
                { label: 'Morning', slots: ['8:00 AM', '9:00 AM', '10:00 AM'] },
                { label: 'Afternoon', slots: ['12:00 PM', '1:00 PM', '2:00 PM'] },
                { label: 'Evening', slots: ['4:00 PM', '5:00 PM', '6:00 PM'] },
              ].map((group, idx) => (
                <Box key={idx} mb={2}>
                  <Typography variant="subtitle1">{group.label}</Typography>
                  <Grid container spacing={1}>
                    {group.slots.map((time) => (
                      <Grid item key={time}>
                        <Chip
                          label={time}
                          clickable
                          sx={{
                            backgroundColor: tempSelectedSlot === time ? '#EDA197' : '#f0f0f0',
                            color: tempSelectedSlot === time ? '#fff' : 'black',
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
              <Button onClick={() => setSlotDialogOpen(false)} color="secondary">Cancel</Button>
              <Button
  onClick={() => {
    setSlot(tempSelectedSlot);
    setSlotDialogOpen(false);
  }}
  variant="contained"
  disabled={!tempSelectedSlot}
  sx={{
    background: 'linear-gradient(to right, #f1707d, #b755ff)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(to right, #e85c6d, #a04fe5)',
    },
  }}
>
  Confirm
</Button>
            </DialogActions>
          </Dialog>
        </Container>

        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
            color: '#fff',
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </LocalizationProvider>
  );
}
