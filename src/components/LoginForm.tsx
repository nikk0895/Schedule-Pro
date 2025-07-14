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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoginFailed(false);

    console.log(' Attempting login with:', { email, password });

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          formErrors[field] = issue.message;
        }
      });
      console.warn('⚠️ Form validation failed:', formErrors);
      setErrors(formErrors);
      enqueueSnackbar('Please fix the errors above', { variant: 'error' });
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      console.log(' Firebase Auth Success. UID:', uid);

      const docRef = doc(db, 'patients', uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const patientData = snapshot.data();
        console.log('📄 Patient data found:', patientData);

        enqueueSnackbar('Login successful!', { variant: 'success' });
        router.push({
          pathname: '/dashboard',
          query: { uid },
        });
      } else {
        console.warn(' Patient record not found in Firestore for UID:', uid);
        enqueueSnackbar('Patient record not found. Please register again.', { variant: 'error' });
      }
    } catch (err: any) {
      console.error(' Firebase Auth Error:', err);
      setLoginFailed(true);
      enqueueSnackbar(err.message || 'Login failed', { variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleLogin}>
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

      <Button variant="contained" fullWidth type="submit">
        Login
      </Button>
    </form>
  );
}
