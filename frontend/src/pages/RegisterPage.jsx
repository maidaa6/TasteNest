import { useState } from 'react';
import { Link } from 'react-router';
import AuthLayout from '../components/AuthLayout.jsx';
import FormField from '../components/FormField.jsx';
import { register, validateRegistration } from '../services/auth.js';
import { fieldErrorsFromApi } from '../services/formErrors.js';

const EMPTY = { name: '', email: '', password: '' };

export default function RegisterPage() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validateRegistration(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      await register(values);
      setRegistered(true);
    } catch (err) {
      const serverErrors = fieldErrorsFromApi(err.details);
      if (err.status === 409) serverErrors.email = err.message;
      setErrors(serverErrors);
      if (!Object.keys(serverErrors).length) setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <AuthLayout title="Registracija">
        <p className="alert alert-success" role="status">
          Račun je ustvarjen. Zdaj se lahko prijavite z e-naslovom {values.email.trim()}.
        </p>
        <p><Link className="button" to="/prijava">Na prijavo</Link></p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Registracija" intro="Z računom lahko shranjujete recepte in načrtujete obroke.">
      <form className="form" onSubmit={onSubmit} noValidate>
        {formError && <p className="alert" role="alert">{formError}</p>}

        <FormField label="Ime" name="name" autoComplete="name"
          value={values.name} onChange={onChange} error={errors.name} />
        <FormField label="E-naslov" name="email" type="email" autoComplete="email"
          value={values.email} onChange={onChange} error={errors.email} />
        <FormField label="Geslo" name="password" type="password" autoComplete="new-password"
          value={values.password} onChange={onChange} error={errors.password} />

        <button className="button button-block" type="submit" disabled={submitting}>
          {submitting ? 'Ustvarjanje računa …' : 'Ustvari račun'}
        </button>
        <p className="muted">Že imate račun? <Link to="/prijava">Prijavite se</Link>.</p>
      </form>
    </AuthLayout>
  );
}
