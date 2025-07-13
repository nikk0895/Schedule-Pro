import { useState } from 'react';
import {
  TextField,
  FormControl,
  Button,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/utils/firebase';
import { registerSchema } from '@/types/formSchemas';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerFailed, setRegisterFailed] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ✅ prevent page reload
    setErrors({});
    setRegisterFailed(false);

    const result = registerSchema.safeParse({ name, email, password });

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
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, 'patients', uid), {
        name,
        email,
        uid,
        createdAt: new Date().toISOString(),
      });

      enqueueSnackbar('Registration successful!', { variant: 'success' });
      router.push('/dashboard');
    } catch (err: any) {
      setRegisterFailed(true);
      enqueueSnackbar(err.message || 'Registration failed', { variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />
      </FormControl>

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

      {registerFailed && (
        <Typography color="error" sx={{ mb: 2 }}>
          Registration failed. Try again.
        </Typography>
      )}

      <Button variant="contained" fullWidth type="submit">
        Register
      </Button>
    </form>
  );
}
