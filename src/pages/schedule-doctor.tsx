import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/router';
import { auth, db } from '@/utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import dynamic from 'next/dynamic';

const LocalizationProvider = dynamic(() =>
  import('@mui/x-date-pickers/LocalizationProvider').then((mod) => mod.LocalizationProvider),
  { ssr: false }
);

const DatePicker = dynamic(() =>
  import('@mui/x-date-pickers/DatePicker').then((mod) => mod.DatePicker),
  { ssr: false }
);

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ScheduleDoctorPage() {
  const router = useRouter();

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
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
  open: false,
  message: '',
  severity: 'success',
});

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const docRef = doc(db, 'patients', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as { name: string };
        const patientData = { uid, ...data };
        setPatient(patientData);
        console.log('Patient:', patientData);
      }
    } else {
      router.push('/');
    }

    const doctorData = localStorage.getItem('selectedDoctor');
    if (doctorData) {
      const parsedDoctor = JSON.parse(doctorData);
      setDoctor(parsedDoctor);
      console.log('Doctor:', parsedDoctor);
    }
  });

  return () => unsubscribe();
}, [router]);

  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
  setToast({ open: true, message, severity });
};
const handleToastClose = () =>
  setToast((prev) => ({ ...prev, open: false }));

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/available-doctor');
  };

 const handleConfirm = async () => {
  if (!patient || !doctor || !sessionDate || !slot) {
    console.warn('Missing required field(s):', {
      patient,
      doctor,
      sessionDate,
      slot,
    });
    showToast('Please complete all fields before confirming.', 'error');
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

  console.log('Submitting Session Data:', sessionData);

  try {
    await setDoc(doc(db, 'sessions', sessionId), sessionData);
    console.log(' Session saved successfully with ID:', sessionId);
    showToast('Session booked successfully!', 'success');
    setTimeout(() => router.push('/dashboard'), 1500);
  } catch (err) {
    console.error(' Error saving session to Firestore:', err);
    showToast('Failed to book session. Try again.', 'error');
  }
};


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)', position: 'relative' }}>
        <Container sx={{ py: 4 }}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
          </Box>

          <Typography variant="h5" mb={2}>Patient</Typography>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src="/avatar.png" />
            <Typography variant="h6">{patient?.name}</Typography>
          </Paper>

          <Typography variant="h5" mt={4} mb={2}>Assign Practitioner</Typography>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={doctor?.photo} alt={doctor?.name} />
            <Box>
              <Typography variant="h6">{doctor?.name}</Typography>
              <Typography variant="body2">Contact: {doctor?.phone}</Typography>
            </Box>
          </Paper>

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
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: 1,
    px: 2,
    py: 1.5,
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    typography: slot ? 'body1' : 'body2',
    color: slot ? 'text.primary' : 'text.secondary',
    '&:hover': { borderColor: 'primary.main' },
  }}
>
  {slot || 'Choose Time Slot'}
</Box>

            </Box>
          </Box>

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

          <Typography variant="h6" mt={4} mb={1}>Session Details (Optional)</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
          />

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

          <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Select a Time Slot</DialogTitle>
            <DialogContent dividers>
              {[
                { label: 'Morning', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] },
                { label: 'Afternoon', slots: ['12:00 PM', '1:00 PM', '2:00 PM'] },
                { label: 'Evening', slots: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'] },
              ].map((group, idx) => (
                <Box key={idx} mb={2}>
                  <Typography variant="subtitle1">{group.label}</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {group.slots.map((time: string) => (
                      <Chip
                        key={time}
                        label={time}
                        clickable
                        sx={{
                          backgroundColor: tempSelectedSlot === time ? '#EDA197' : '#f0f0f0',
                          color: tempSelectedSlot === time ? '#fff' : 'black',
                        }}
                        onClick={() => setTempSelectedSlot(time)}
                      />
                    ))}
                  </Box>
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
         <Snackbar
  open={toast.open}
  autoHideDuration={3000}
  onClose={handleToastClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <MuiAlert
    onClose={handleToastClose}
    severity={toast.severity}
    variant="filled"
    elevation={6}
    sx={{ width: '100%' }}
  >
    {toast.message}
  </MuiAlert>
</Snackbar>
 </Container>
      </Box>
    </LocalizationProvider>
  );
}
