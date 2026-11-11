import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import AuthLayout from '../components/AuthLayout.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!values.email.trim() || !values.password) {
      setError('Vnesite e-naslov in geslo.');
      return;
    }

    setSubmitting(true);
    try {
      await login(values);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Prijava" intro="Dobrodošli nazaj! Prijavite se za objavljanje in načrtovanje obrokov.">
      <form className="form" onSubmit={onSubmit} noValidate>
        {error && <p className="alert" role="alert">{error}</p>}

        <FormField label="E-naslov" name="email" type="email" autoComplete="email"
          value={values.email} onChange={onChange} />
        <FormField label="Geslo" name="password" type="password" autoComplete="current-password"
          value={values.password} onChange={onChange} />

        <button className="button button-block" type="submit" disabled={submitting}>
          {submitting ? 'Prijavljanje …' : 'Prijava'}
        </button>
        <p className="muted">Še nimate računa? <Link to="/registracija">Registrirajte se</Link>.</p>
      </form>
    </AuthLayout>
  );
}
