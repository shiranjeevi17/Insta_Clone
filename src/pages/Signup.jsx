import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { validateSignup, hasErrors } from '../utils/validation';

const strengthOf = (pwd) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^a-zA-Z\d]/.test(pwd)) s++;
  if (s <= 2) return 'weak';
  if (s <= 3) return 'fair';
  if (s <= 4) return 'good';
  return 'strong';
};

const STRENGTH_COLOR = { weak: '#ed4956', fair: '#f77737', good: '#ffc107', strong: '#31a24c' };
const STRENGTH_WIDTH = { weak: '25%', fair: '50%', good: '75%', strong: '100%' };

export default function Signup() {
  const navigate = useNavigate();
  const { register, users } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext) || {};

  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = formData.password ? strengthOf(formData.password) : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setGeneralError('');

    const validationErrors = validateSignup(formData, users);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      register(formData);
      showToast?.('Account created! Welcome to InstaClone.', { type: 'success' });
      navigate('/', { replace: true });
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InstaClone</h1>
          <p>Create your account</p>
        </div>

        {generalError && (
          <div className="alert alert-error" role="alert">
            <span aria-hidden="true">⚠️</span>
            <p>{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="auth-form" noValidate>
          <FormInput
            label="Full Name" id="fullName" name="fullName"
            value={formData.fullName} onChange={handleChange}
            placeholder="John Doe" error={errors.fullName} disabled={isLoading}
          />
          <FormInput
            label="Username" id="username" name="username"
            value={formData.username} onChange={handleChange}
            placeholder="johndoe" error={errors.username}
            autoComplete="username" disabled={isLoading}
          />
          <FormInput
            label="Email" id="email" name="email" type="email"
            value={formData.email} onChange={handleChange}
            placeholder="you@example.com" error={errors.email}
            autoComplete="email" disabled={isLoading}
          />
          <FormInput
            label="Password" id="password" name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password} onChange={handleChange}
            placeholder="••••••••" error={errors.password}
            autoComplete="new-password" disabled={isLoading}
            rightElement={
              <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} disabled={isLoading} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            }
          />
          {strength && (
            <div className="password-strength">
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: STRENGTH_WIDTH[strength], backgroundColor: STRENGTH_COLOR[strength] }} />
              </div>
              <p className="strength-text" style={{ color: STRENGTH_COLOR[strength] }}>
                Password strength: <strong>{strength}</strong>
              </p>
            </div>
          )}
          <FormInput
            label="Confirm Password" id="confirmPassword" name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword} onChange={handleChange}
            placeholder="••••••••" error={errors.confirmPassword}
            autoComplete="new-password" disabled={isLoading}
            rightElement={
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((v) => !v)} disabled={isLoading} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            }
          />

          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
