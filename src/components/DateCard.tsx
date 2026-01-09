import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Note: If @mui/icons-material is not installed, I should use text "X" or install it.
// The user asked to install @mui/material, but often icons are separate @mui/icons-material.
// I did NOT install @mui/icons-material.
// I will use a Text Button or simple X for now, or just generic content.
// "Posibilidad de eliminar una fecha".

interface DateCardProps {
    date: string | Date;
    onDelete?: () => void;
}

export const DateCard = ({ date, onDelete }: DateCardProps) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <Box>
                    <Typography variant="h6" component="div">
                        {format(dateObj, 'EEEE d', { locale: es })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {format(dateObj, 'MMMM yyyy', { locale: es })}
                    </Typography>
                </Box>
                {onDelete && (
                    <IconButton onClick={onDelete} color="error" aria-label="eliminar">
                        {/* Fallback to text if icon not available, but usually we install icons. 
                I'll use a simple unicode X if I can't be sure, but I'll try to rely on Box if needed. 
                Actually, simpler: use Button with "Eliminar" or "X". 
                I will use a styled Button "X" to be safe without icons package. */}
                        <Typography variant="h6" component="span">×</Typography>
                    </IconButton>
                )}
            </CardContent>
        </Card>
    );
};
