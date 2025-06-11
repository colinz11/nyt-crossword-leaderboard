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
  Tooltip,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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

  const tokenTooltip = (
    <div className="token-help">
      <p>To find your NYT-S token:</p>
      <ol>
        <li>Go to <a href="https://www.nytimes.com/crosswords" target="_blank" rel="noopener noreferrer">NYT Crosswords</a></li>
        <li>Make sure you're logged in</li>
        <li>Open your browser's Developer Tools (F12 or right-click → Inspect)</li>
        <li>Go to the Application/Storage tab</li>
        <li>Under Cookies, select "www.nytimes.com"</li>
        <li>Find the cookie named "NYT-S"</li>
        <li>Copy its value</li>
      </ol>
    </div>
  );

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
            <div className="token-field">
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
              <Tooltip 
                title={tokenTooltip}
                placement="right"
                arrow
                classes={{ tooltip: 'token-tooltip' }}
              >
                <IconButton size="small" className="help-icon">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </div>
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