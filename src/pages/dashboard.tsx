import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Paper,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import AddIcon from '@mui/icons-material/Add';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '@/utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(advancedFormat);
dayjs.extend(isSameOrAfter);

type Session = {
  id: string;
  sessionType: string;
  doctorName: string;
  doctorPhone: string;
  sessionDate: string;
  slot: string;
  duration?: number;
  mode: string;
  status: string;
  onlineLink?: string;
  doctorPhoto?: string;
};

export default function Dashboard() {
  const router = useRouter();
  const greeting = useMemo(() => getGreetingMessage(), []);
  const [patient, setPatient] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPastExpanded, setIsPastExpanded] = useState(false);
  const today = dayjs();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
         console.log(' Authenticated UID:', uid);
        try {
          const patientRef = doc(db, 'patients', uid);
          const [patientSnap, sessionsSnap] = await Promise.all([
            getDoc(patientRef),
            getDocs(
              query(
                collection(db, 'sessions'),
                where('patientUid', '==', uid),
                orderBy('sessionDate', 'desc')
              )
            ),
          ]);

          if (patientSnap.exists()) {
            const patientData = patientSnap.data();
            console.log(' Patient Data:', patientData);
            setPatient({ uid, ...patientData });
          } else {
            console.warn('❗ No patient data found');
            setPatient({ uid, name: 'Unknown' });
          }

          const data: Session[] = sessionsSnap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              sessionType: d.sessionType,
              doctorName: d.doctorName,
              doctorPhone: d.doctorPhone,
              sessionDate: d.sessionDate,
              slot: d.slot,
              duration: d.duration,
              mode: d.mode,
              status: d.status,
              onlineLink: d.onlineLink ?? '',
              doctorPhoto: d.doctorPhoto ?? '',
            };
          });
          console.log(' Sessions Retrieved:', data);
          setSessions(data);
        } catch (error) {
          console.error('Failed to fetch patient or sessions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn('❗ User not authenticated');
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    console.log('Logging out user:', patient?.uid);
    await signOut(auth);
    router.push('/');
  };

  const markAsCompleted = async (id: string) => {
    console.log('Marking session as completed:', id);
    try {
      await updateDoc(doc(db, 'sessions', id), { status: 'completed' });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'completed' } : s))
      );
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

  const upcomingSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.status === 'upcoming' &&
          dayjs(s.sessionDate).isSameOrAfter(today, 'day')
      ),
    [sessions]
  );

  const pastSessions = useMemo(
    () =>
      sessions
        .filter(
          (s) =>
            s.status === 'completed' ||
            dayjs(s.sessionDate).isBefore(today, 'day')
        )
        .sort(
          (a, b) =>
            new Date(a.sessionDate).getTime() -
            new Date(b.sessionDate).getTime()
        ),
    [sessions]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
        position: 'relative',
      }}
    >
      <Box p={2}>
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
            <Avatar alt={patient?.name} src="/avatar.png" sx={{ width: 40, height: 40 }} />
            <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            onClick={() => router.push('/available-doctor')}
            sx={{ background: 'linear-gradient(to right, #6a11cb, #eda197)', color: '#fff' }}
          >
            Schedule New Appointment
          </Button>
        </Box>

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

        {loading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
            <Typography mt={2}>Loading sessions...</Typography>
          </Box>
        ) : (
          <>
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
                        <Box>
                          <Typography variant="h5" fontWeight={600}>
                            {session.slot}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(session.sessionDate).format('dddd, MMMM D, YYYY')}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={session.doctorPhoto}
                            alt={session.doctorName}
                            sx={{
                              width: 90,
                              height: 90,
                              borderRadius: 20,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: '2px solid #fff',
                            }}
                          />
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              Dr. {session.doctorName}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ bgcolor: '#e0e0e0', width: 24, height: 24 }}>📞</Avatar>
                              <Typography variant="body2" color="text.secondary">
                                {session.doctorPhone}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

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
                          Previous Session: Monday, July 14, 2025
                        </Typography>
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Typography>No upcoming sessions.</Typography>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={isPastExpanded} onChange={(_, expanded) => setIsPastExpanded(expanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Past Sessions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {isPastExpanded &&
                  (pastSessions.length > 0 ? (
                    pastSessions.map((session) => (
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
                          <Box flex={1}>
                            <Typography variant="h5" fontWeight="bold">
                              {session.slot}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                              {session.doctorName}
                              <PhoneIcon fontSize="small" color="primary" />
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              Previous Session: {dayjs(session.sessionDate).format('dddd, D MMMM YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Session Mode: {session.mode}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  ) : (
                    <Typography>No past sessions.</Typography>
                  ))}
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>

     
    </Box>
  );
}
