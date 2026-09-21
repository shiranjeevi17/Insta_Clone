import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { validateLogin, hasErrors } from '../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext) || {};

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const doLogin = async (identifier, password) => {
    setGeneralError('');
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      login(identifier, password);
      showToast?.('Welcome back!', { type: 'success' });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(formData);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    doLogin(formData.identifier, formData.password);
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    doLogin('demo@example.com', 'demo123');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InstaClone</h1>
          <p>Sign in to your account</p>
        </div>

        {generalError && (
          <div className="alert alert-error" role="alert">
            <span aria-hidden="true">⚠️</span>
            <p>{generalError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <FormInput
            label="Email or Username"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            placeholder="you@example.com or username"
            error={errors.identifier}
            autoComplete="username"
            disabled={isLoading}
          />

          <FormInput
            label="Password"
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            }
          />

          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="divider"><span>or</span></div>

        <Button variant="secondary" fullWidth onClick={handleDemoLogin} disabled={isLoading}>
          🎭 Try Demo Account
        </Button>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
