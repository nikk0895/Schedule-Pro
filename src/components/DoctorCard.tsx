import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRouter } from 'next/router';

interface Doctor {
  name: string;
  phone: string;
  photo: string;
  expertise: string[];
  sessionMode: string;
  gender: string;
  fee: number;
}

export default function DoctorCard({
  name,
  phone,
  photo,
  expertise,
  sessionMode,
  gender,
  fee,
}: Doctor) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const toggleExpand = () => setExpanded((prev) => !prev);

  const handleBook = () => {
    localStorage.setItem(
      'selectedDoctor',
      JSON.stringify({ name, phone, photo })
    );
    router.push('/schedule-doctor');
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        background: 'linear-gradient(to right, #fef1f4, #f0eafc)',
        boxShadow: 3,
      }}
    >
      <CardContent>
        {/* Basic Info */}
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar alt={name} src={photo} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {expertise.join(', ')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {phone}
            </Typography>
          </Box>
          <Box ml="auto">
            <IconButton onClick={toggleExpand}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box mt={2} ml={1}>
            <Typography variant="body2">
              <strong>Session Mode:</strong> {sessionMode}
            </Typography>
            <Typography variant="body2">
              <strong>Gender:</strong> {gender}
            </Typography>
            <Typography variant="body2">
              <strong>Fee:</strong> ₹{fee}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                background: 'linear-gradient(to right, #f1707d, #b755ff)',
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
              onClick={handleBook}
            >
              Book Now
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
