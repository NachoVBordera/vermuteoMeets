import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/PrimaryButton';

export const Home = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3
        }}>
            <Stack spacing={4} alignItems="center">
                <Box>
                    <Typography variant="h1" gutterBottom color="primary">
                        Vermuteo
                    </Typography>
                    <Typography variant="h4" component="span" sx={{ display: 'block' }}>
                        Meets
                    </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary">
                    A forma máis rápida de atopar oco para o vermut. Sen rexistros.
                </Typography>

                <Box sx={{ width: '100%', mt: 4 }}>
                    <PrimaryButton
                        label="Crear encontro"
                        onClick={() => navigate('/create')}
                    />
                </Box>
            </Stack>
        </Box>
    );
};
