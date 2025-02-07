import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import WebcamCapture from './components/WebcamCapture';
import { AuthProvider, useAuth } from './authContext';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const Navigation = () => {
    const { user, logout } = useAuth();
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    웹캠 캡처 앱
                </Typography>
                {user ? (
                    <Box>
                        <Typography component="span" sx={{ mr: 2 }}>
                            {user}님 환영합니다
                        </Typography>
                        <Button color="inherit" onClick={logout}>
                            로그아웃
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Button color="inherit" href="/login">
                            로그인
                        </Button>
                        <Button color="inherit" href="/signup">
                            회원가입
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Box sx={{ flexGrow: 1 }}>
                    <Navigation />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <WebcamCapture />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Box>
            </Router>
        </AuthProvider>
    );
};

export default App; 