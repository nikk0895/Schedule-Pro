import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Link,
} from '@mui/material';
import RegisterForm from '@/components/RegisterForm';
import LoginForm from '@/components/LoginForm';
import { AnimatePresence, motion } from 'framer-motion';
//import AddIcon from '@mui/icons-material/Add';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #B0A4F5, #EDA197)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
      }}
    >
      <Paper sx={{ maxWidth: 500, width: '100%', p: 4 }} elevation={6}>
        <Typography variant="h5" align="center" mb={3}>
          {showLogin ? 'Patient Login' : 'Patient Registration'}
        </Typography>

        <AnimatePresence mode="wait">
          <motion.div
            key={showLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {showLogin ? (
              <LoginForm />
            ) : (
              <RegisterForm onRegistered={() => setShowLogin(true)} />
            )}
          </motion.div>
        </AnimatePresence>

        <Typography align="center" mt={3}>
          {showLogin ? 'Not registered?' : 'Already registered?'}{' '}
          <Link component="button" onClick={() => setShowLogin(!showLogin)}>
            {showLogin ? 'Register here' : 'Login here'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
