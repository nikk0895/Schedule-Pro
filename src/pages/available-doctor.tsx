import { Container, Box, Typography } from '@mui/material';
import { mockDoctors } from '@/data/mockdoctors';
import DoctorCard from '@/components/DoctorCard';

export default function AvailableDoctors() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          gutterBottom
          sx={{ color: '#fff' }}
        >
          Available Doctors
        </Typography>

        <Box mt={2}>
          {mockDoctors.map((doc, index) => (
            <DoctorCard key={index} {...doc} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
