// src/components/RegisterForm.tsx
import { useState } from 'react';
import {
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase';
import { registerSchema } from '@/types/formSchemas';

export default function RegisterForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    setErrors({});
    const lowerEmail = email.toLowerCase();

    const formData = {
      name,
      mobile,
      whatsapp: sameAsMobile ? mobile : whatsapp,
      email: lowerEmail,
      address,
      password,
    };

    const result = registerSchema.safeParse(formData);

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
      // ✅ Step 1: Register user with Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, lowerEmail, password);
      const uid = userCred.user.uid;

      // ✅ Step 2: Save patient data to Firestore using UID as document ID
      const patientRef = doc(db, 'patients', uid);
      await setDoc(patientRef, {
        uid,
        name,
        mobile,
        whatsapp: sameAsMobile ? mobile : whatsapp,
        email: lowerEmail,
        address,
        createdAt: new Date().toISOString(),
      });

      // ✅ Step 3: Redirect to dashboard or login
      enqueueSnackbar('Registration successful! Redirecting to dashboard...', { variant: 'success' });
      router.push('/dashboard');
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Registration failed', { variant: 'error' });
    }
  };

  return (
    <>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          error={!!errors.mobile}
          helperText={errors.mobile}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="WhatsApp"
          value={sameAsMobile ? mobile : whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          disabled={sameAsMobile}
          error={!!errors.whatsapp}
          helperText={errors.whatsapp}
        />
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={sameAsMobile}
            onChange={(e) => {
              setSameAsMobile(e.target.checked);
              if (e.target.checked) setWhatsapp(mobile);
            }}
          />
        }
        label="Same as Mobile"
      />

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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
          multiline
          rows={3}
        />
      </FormControl>

      <Button variant="contained" fullWidth onClick={handleRegister}>
        Register
      </Button>
    </>
  );
}
