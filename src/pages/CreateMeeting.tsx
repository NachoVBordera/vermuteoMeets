import { useState } from 'react';
import { Box, Typography, TextField, Stack, Chip, Badge } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/PrimaryButton';
import { meetingStorage } from '../services/meetingStorage';
import { isSameDay } from 'date-fns';

export const CreateMeeting = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const handleDateClick = (newDate: Date | null) => {
        if (!newDate) return;
        // Check if date is already selected
        const existingIndex = selectedDates.findIndex(d => isSameDay(d, newDate));

        if (existingIndex >= 0) {
            // Remove if already selected
            setSelectedDates(selectedDates.filter((_, i) => i !== existingIndex));
        } else {
            // Add new date and sort chronologically
            setSelectedDates([...selectedDates, newDate].sort((a, b) => a.getTime() - b.getTime()));
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || selectedDates.length === 0) return;

        // Convert dates to ISO strings
        const dateStrings = selectedDates.map(d => d.toISOString());

        // Create meeting
        const meeting = await meetingStorage.createMeeting(title, dateStrings);

        if (meeting) {
            // Navigate
            navigate(`/m/${meeting.id}`);
        } else {
            alert('Vaites! Houbo un erro ao crear o encontro. Inténtao de novo.');
        }
    };

    const removeDate = (dateToRemove: Date) => {
        setSelectedDates(selectedDates.filter(d => !isSameDay(d, dateToRemove)));
    };

    return (
        <Box sx={{ p: 3, pb: 10 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Novo plan
            </Typography>

            <Stack spacing={3} mt={2}>
                <TextField
                    label="Título"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="outlined"
                />

                <Box sx={{ bgcolor: 'white', borderRadius: 0, border: '1px solid #000000', overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                        Selecciona posibles días (toca para engadir/quitar)
                    </Typography>
                    <DateCalendar
                        value={null}
                        onChange={handleDateClick}
                        slots={{
                            day: (dayProps) => {
                                const isSelected = selectedDates.some(d => isSameDay(d, dayProps.day));
                                return (
                                    <Badge
                                        key={dayProps.day.toString()}
                                        overlap="circular"
                                        badgeContent={isSelected ? '✓' : undefined}
                                        color="primary"
                                    >
                                        <PickersDay
                                            {...dayProps}
                                            sx={{
                                                ...(isSelected && {
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '&:hover': {
                                                        bgcolor: 'primary.dark',
                                                    },
                                                }),
                                            }}
                                        />
                                    </Badge>
                                );
                            },
                        }}
                        disablePast
                    />
                </Box>

                {selectedDates.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Datas seleccionadas ({selectedDates.length})
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {selectedDates.map((date, idx) => (
                                <Chip
                                    key={idx}
                                    label={date.toLocaleDateString('gl-ES', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                    onDelete={() => removeDate(date)}
                                    color="primary"
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Stack>

            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                bgcolor: 'white',
                borderTop: '1px solid #eee',
                maxWidth: '400px',
                margin: '0 auto'
            }}>
                <PrimaryButton
                    label="Crear ligazón"
                    onClick={handleCreate}
                    disabled={!title || selectedDates.length === 0}
                />
            </Box>
        </Box>
    );
};
