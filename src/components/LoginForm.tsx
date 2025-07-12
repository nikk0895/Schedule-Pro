// src/components/LoginForm.tsx
import { useState } from 'react';
import {
  TextField,
  FormControl,
  Button,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/utils/firebase';
import { loginSchema } from '@/types/formSchemas';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginFailed, setLoginFailed] = useState(false);

  const handleLogin = async () => {
    setErrors({});
    setLoginFailed(false);

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          formErrors[field] = issue.message;
        }
      });
      setErrors(formErrors);
      enqueueSnackbar('Please fix the errors above', { variant: 'error' });
      return;
    }

    try {
      // ✅ Firebase login
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // ✅ Get full patient data from Firestore using UID
      const docRef = doc(db, 'patients', uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const patientData = snapshot.data();
        localStorage.setItem('patientInfo', JSON.stringify(patientData));
        enqueueSnackbar('Login successful!', { variant: 'success' });
        router.push('/dashboard');
      } else {
        enqueueSnackbar('Patient record not found. Please register again.', { variant: 'error' });
      }
    } catch (err: any) {
      setLoginFailed(true);
      enqueueSnackbar(err.message || 'Login failed', { variant: 'error' });
    }
  };

  return (
    <>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
        />
      </FormControl>

      {loginFailed && (
        <Typography color="error" sx={{ mb: 2 }}>
          Invalid credentials. Please try again or register.
        </Typography>
      )}

      <Button variant="contained" fullWidth onClick={handleLogin}>
        Login
      </Button>
    </>
  );
}
