import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const WebcamCapture: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const setupWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("웹캠 접근 오류:", error);
                setMessage('웹캠 접근에 실패했습니다.');
            }
        };

        setupWebcam();
    }, []);

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current || !user) {
            setMessage('웹캠이 준비되지 않았거나 로그인되지 않았습니다.');
            return;
        }

        setLoading(true);
        setMessage('');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL('image/jpeg');

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageUrl,
                    username: user,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setImageUrl(data.imageUrl);
                setMessage('이미지가 성공적으로 저장되었습니다!');
            } else {
                setMessage('이미지 업로드에 실패했습니다.');
            }
        } catch (error: any) {
            setMessage(`오류 발생: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        웹캠 캡처
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={captureImage}
                            disabled={loading}
                            startIcon={<PhotoCamera />}
                            sx={{ mt: 2 }}
                        >
                            {loading ? '캡처 중...' : '이미지 캡처'}
                        </Button>
                        {message && (
                            <Typography
                                color={message.includes('성공') ? 'success.main' : 'error'}
                                sx={{ mt: 2 }}
                            >
                                {message}
                            </Typography>
                        )}
                        {imageUrl && (
                            <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
                                <img
                                    src={imageUrl}
                                    alt="Captured"
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default WebcamCapture; 