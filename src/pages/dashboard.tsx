import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Card,
  Paper,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat'; // For "Do" like 15th
dayjs.extend(advancedFormat);
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { getGreetingMessage } from '@/utils/greeting';

export default function Dashboard() {
  const router = useRouter();
  const greeting = getGreetingMessage();

  const [patient, setPatient] = useState<any>(null);
  type Session = {
  sessionType: string;
  doctorName: string;
  sessionDate: string;
  slot: string;
  mode: string;
  status: string;
};
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'sessions'),
        where('patientUid', '==', uid),
        orderBy('sessionDate', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;

      try {
        const patientRef = doc(db, 'patients', uid);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          setPatient({ uid, ...patientData }); // ✅ Use Firestore name
        } else {
          setPatient({ uid, name: 'Unknown' }); // fallback
        }

        fetchSessions(uid);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
      }
    } else {
      router.push('/');
    }
  });

  return () => unsubscribe();
}, [router]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const markAsCompleted = async (id: string) => {
    try {
      await updateDoc(doc(db, 'sessions', id), { status: 'completed' });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'completed' } : s))
      );
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

  const today = dayjs();
  const upcomingSessions = sessions.filter(
    (s) =>
      s.status === 'upcoming' &&
      dayjs(s.sessionDate).isSameOrAfter(today, 'day')
  );
  const pastSessions = sessions
    .filter((s) => s.status === 'completed' || dayjs(s.sessionDate).isBefore(today, 'day'))
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

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
            <Typography>{patient?.name}</Typography>
            <Avatar alt={patient?.name} src="/avatar.png" />
            <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Always Visible "Schedule Now" Button */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            onClick={() => router.push('/available-doctor')}
            sx={{ background: 'linear-gradient(to right, #6a11cb, #eda197)', color: '#fff' }}
          >
            Schedule New Appointment
          </Button>
        </Box>

        {/* Schedule Prompt for New Users */}
        {sessions.length === 0 && !loading && (
          <Paper sx={{ p: 3, mb: 4, textAlign: 'center', background: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              Ready to book your first session?
            </Typography>
            <Typography variant="body1" mb={2}>
              Find the right doctor and get started with your journey.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push('/available-doctor')}>
              Schedule Now
            </Button>
          </Paper>
        )}

        {/* Sessions */}
        {loading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
            <Typography mt={2}>Loading sessions...</Typography>
          </Box>
        ) : (
          <>
            {/* Upcoming Sessions */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Upcoming Sessions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {upcomingSessions.length > 0 ? (
  upcomingSessions.map((session) => (
    <Card
      key={session.id}
      sx={{
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(to bottom right, #f5f2ff, #fbe7f2)',
        boxShadow: 4,
        p: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* Time and Location */}
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {session.slot}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(session.sessionDate).format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        {/* Doctor Info */}
        <Box display="flex" alignItems="center" gap={2}>
         <Avatar
  src={session.doctorPhoto || '/avatar.png'}
  alt={session.doctorName}
  sx={{
    width: 80,
    height: 90,
    borderRadius: 10,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '2px solid #fff',
  }}
/>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Dr. {session.doctorName}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                sx={{
                  bgcolor: '#e0e0e0',
                  width: 24,
                  height: 24,
                }}
              >
                📞
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {session.doctorPhone}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Session Info */}
      <Box mt={2}>
        <Typography variant="body2">
          <strong>Session Duration:</strong> 01:00 HR
        </Typography>
        <Typography variant="body2">
          <strong>Session Mode:</strong> {session.mode}
        </Typography>
        {session.mode === 'online' && session.onlineLink && (
          <Typography variant="body2" mt={1}>
            <strong>Link:</strong>{' '}
            <a
              href={session.onlineLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#5e35b1' }}
            >
              {session.onlineLink}
            </a>
          </Typography>
        )}
      </Box>

      {/* Action */}
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          size="small"
          sx={{
            background: 'linear-gradient(to right, #f1707d, #b755ff)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(to right, #e85c6d, #a04fe5)',
            },
          }}
          onClick={() => markAsCompleted(session.id)}
        >
          Mark as Completed
        </Button>

        <Typography variant="body2" fontStyle="italic" color="text.secondary">
          Previous Session: Tuesday, March 5, 2023
        </Typography>
      </Box>
    </Card>
  ))
) : (
  <Typography>No upcoming sessions.</Typography>
)}

              </AccordionDetails>
            </Accordion>

           {/* Past Sessions */}
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6">Past Sessions</Typography>
  </AccordionSummary>
  <AccordionDetails>
    {pastSessions.length > 0 ? (
      pastSessions.map((session) => {
        const formattedDate = dayjs(session.sessionDate).format('dddd, D MMMM YYYY');

        return (
          <Card
            key={session.id}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(to bottom right, #fdfbfb, #ebedee)',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              {/* <Avatar
                // src={session.doctorPhoto}
                // alt={session.doctorName}
                sx={{
                  width: 70,
                  height: 90,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #fff',
                }}
              /> */}
              <Box flex={1}>
                <Typography variant="h5" fontWeight="bold">
                  {session.slot}
                </Typography>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  {session.doctorName}
                  <PhoneIcon fontSize="small" color="primary" />
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Previous Session: {formattedDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Session Mode: {session.mode}
                </Typography>
              </Box>
            </Box>
          </Card>
        );
      })
    ) : (
      <Typography>No past sessions.</Typography>
    )}
  </AccordionDetails>
</Accordion>
          </>
        )}
      </Box>

      {/* Floating FAB */}
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
        onClick={() => router.push('/available-doctor')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
