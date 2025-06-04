import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { verifyAndCreateUser } from '../services/FetchData';
import './LoginPage.css';
import { trackUserRegistration } from '../utils/analytics';

interface LoginResponse {
  userID: number;
  username: string;
  expirationDate: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await verifyAndCreateUser(username, token);
      trackUserRegistration(true);
      const data = response as LoginResponse;
      
      // Store the expiration date in localStorage for future reference
      localStorage.setItem('tokenExpirationDate', data.expirationDate);
      
      // Navigate to the user's page
      navigate(`/user/${data.userID}`);
    } catch (err: any) {
      trackUserRegistration(false);
      setError(err.response?.data?.error || 'Failed to verify token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container maxWidth="sm">
        <Paper elevation={3} className="login-paper">
          <Typography variant="h4" component="h1" gutterBottom>
            Login to NYT Crossword Stats
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Enter your username and NYT token to access your crossword statistics.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              margin="normal"
            />
            <TextField
              label="NYT Token"
              variant="outlined"
              fullWidth
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              required
              margin="normal"
              type="password"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              size="large"
              sx={{ mt: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginPage; 