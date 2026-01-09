import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Snackbar, Paper, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { gl } from 'date-fns/locale';
import type { Meeting, TimeSlot } from '../models/Meeting';
import { meetingStorage } from '../services/meetingStorage';
import { PrimaryButton } from '../components/PrimaryButton';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00

export const MeetingPage = () => {
    const { id } = useParams<{ id: string }>();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [mySlots, setMySlots] = useState<TimeSlot[]>([]);
    const [tempSlots, setTempSlots] = useState<TimeSlot[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'voting' | 'confirmation' | 'results'>('voting');
    const [hasVoted, setHasVoted] = useState(false);
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [userName, setUserName] = useState('');
    const [tempUserName, setTempUserName] = useState('');

    useEffect(() => {
        if (id) {
            const m = meetingStorage.getMeeting(id);
            if (m) {
                setMeeting(m);

                // Check if user has a name saved
                const savedName = meetingStorage.getUserName();
                if (savedName) {
                    setUserName(savedName);

                    // Load their vote
                    const myVote = meetingStorage.getMyVote(id);
                    if (myVote) {
                        setMySlots(myVote.slots);
                        setTempSlots(myVote.slots);
                        setHasVoted(true);
                        setViewMode('results');
                    }
                }
            }
        }
    }, [id]);

    const handleToggleSlot = (day: string, hour: number) => {
        if (!id || viewMode !== 'voting') return;

        const exists = tempSlots.find(s => s.day === day && s.hour === hour);
        let newSlots: TimeSlot[];

        if (exists) {
            newSlots = tempSlots.filter(s => s !== exists);
        } else {
            newSlots = [...tempSlots, { day, hour }];
        }

        setTempSlots(newSlots);
    };

    const handleSaveVoteClick = () => {
        if (!userName) {
            setShowNameDialog(true);
            setTempUserName('');
        } else {
            saveVote();
        }
    };

    const handleNameSubmit = () => {
        if (tempUserName.trim()) {
            setUserName(tempUserName.trim());
            setShowNameDialog(false);
            saveVote(tempUserName.trim());
        }
    };

    const saveVote = (name?: string) => {
        if (!id) return;

        const finalName = name || userName;
        meetingStorage.saveVote(id, finalName, tempSlots);
        setMySlots(tempSlots);
        setHasVoted(true);

        // Reload meeting to get updated votes
        const updatedMeeting = meetingStorage.getMeeting(id);
        if (updatedMeeting) {
            setMeeting(updatedMeeting);
        }

        setViewMode('confirmation');
    };

    const handleViewResults = () => {
        setViewMode('results');
    };

    const handleEditVote = () => {
        setViewMode('voting');
        setTempSlots(mySlots);
    };

    const copyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setSnackbarOpen(true);
    };

    const getSlotIntensity = (day: string, hour: number): number => {
        if (!id || !meeting) return 0;
        const count = meetingStorage.getSlotVoteCount(id, day, hour);
        const totalVotes = meeting.votes.length;
        if (totalVotes === 0) return 0;
        return count / totalVotes; // 0 to 1
    };

    if (!meeting) return <Box p={3}><Typography>Cargando ou non atopado...</Typography></Box>;

    // Name dialog
    const nameDialog = (
        <Dialog open={showNameDialog} onClose={() => setShowNameDialog(false)}>
            <DialogTitle>Como te chamas?</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Necesitamos o teu nome para gardar o teu voto
                </Typography>
                <TextField
                    autoFocus
                    fullWidth
                    label="O teu nome"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
            </DialogContent>
            <DialogActions>
                <PrimaryButton label="Gardar" onClick={handleNameSubmit} disabled={!tempUserName.trim()} />
            </DialogActions>
        </Dialog>
    );

    // Confirmation view
    if (viewMode === 'confirmation') {
        return (
            <Box sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                textAlign: 'center'
            }}>
                <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
                    <Typography variant="h5" gutterBottom>
                        ✓ Grazas por votar, {userName}!
                    </Typography>
                    <Typography variant="body1">
                        A túa dispoñibilidade gardouse
                    </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Comparte a ligazón cos teus amigos para que tamén voten
                </Typography>

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <PrimaryButton label="Ver resultados" onClick={handleViewResults} />
                    <PrimaryButton
                        label="Copiar ligazón"
                        onClick={copyLink}
                        sx={{ bgcolor: 'secondary.main' }}
                    />
                </Box>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={() => setSnackbarOpen(false)}
                    message="Ligazón copiada"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Box>
        );
    }

    // Results view
    if (viewMode === 'results') {
        const totalVotes = meeting.votes.length;

        return (
            <Box sx={{ p: 2, pb: 10 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">{meeting.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Resultados de dispoñibilidade ({totalVotes} {totalVotes === 1 ? 'voto' : 'votos'})
                    </Typography>
                </Box>

                {/* Calendar Grid Container */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'white', mb: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: `50px repeat(${meeting.dates.length}, 100px)`, minWidth: 'fit-content' }}>

                        {/* Header Row */}
                        <Box sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 2 }} />
                        {meeting.dates.map(dateStr => (
                            <Box key={dateStr} sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                                <Typography variant="caption" display="block" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                    {format(parseISO(dateStr), 'EEE', { locale: gl })}
                                </Typography>
                                <Typography variant="h6">
                                    {format(parseISO(dateStr), 'd', { locale: gl })}
                                </Typography>
                            </Box>
                        ))}

                        {/* Time Rows */}
                        {HOURS.map(hour => (
                            <>
                                <Box key={`label-${hour}`} sx={{
                                    position: 'sticky',
                                    left: 0,
                                    bgcolor: 'white',
                                    p: 1,
                                    borderRight: '1px solid #eee',
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {hour}:00
                                    </Typography>
                                </Box>

                                {meeting.dates.map(dateStr => {
                                    const voteCount = meetingStorage.getSlotVoteCount(id!, dateStr, hour);
                                    const intensity = getSlotIntensity(dateStr, hour);
                                    const isMyVote = mySlots.some(s => s.day === dateStr && s.hour === hour);

                                    return (
                                        <Box
                                            key={`${dateStr}-${hour}`}
                                            sx={{
                                                borderRight: '1px solid #f0f0f0',
                                                borderBottom: '1px solid #f0f0f0',
                                                height: '50px',
                                                bgcolor: voteCount > 0 ? `rgba(255, 69, 0, ${0.2 + intensity * 0.8})` : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                border: isMyVote ? '2px solid #FF4500' : undefined
                                            }}
                                        >
                                            {voteCount > 0 && (
                                                <Typography variant="caption" sx={{ color: intensity > 0.5 ? 'white' : 'text.primary', fontWeight: 'bold' }}>
                                                    {voteCount}
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </>
                        ))}
                    </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Quen votou:
                    </Typography>
                    <Typography variant="body2">
                        {meeting.votes.map(v => v.userName).join(', ')}
                    </Typography>
                </Alert>

                {/* Footer Actions */}
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, maxWidth: '430px', margin: '0 auto', display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <PrimaryButton label="Editar o meu voto" onClick={handleEditVote} />
                    <PrimaryButton label="Copiar ligazón" onClick={copyLink} sx={{ bgcolor: 'secondary.main' }} />
                </Paper>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={() => setSnackbarOpen(false)}
                    message="Ligazón copiada"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ bottom: { xs: 140 } }}
                />
            </Box>
        );
    }

    // Voting view (default)
    return (
        <Box sx={{ p: 2, pb: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {nameDialog}

            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">{meeting.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    Marca as túas horas libres {tempSlots.length > 0 && `(${tempSlots.length} seleccionadas)`}
                </Typography>
                {userName && (
                    <Typography variant="caption" color="primary">
                        Votando como: {userName}
                    </Typography>
                )}
            </Box>

            {/* Calendar Grid Container */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'white' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: `50px repeat(${meeting.dates.length}, 100px)`, minWidth: 'fit-content' }}>

                    {/* Header Row */}
                    <Box sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 2 }} />
                    {meeting.dates.map(dateStr => (
                        <Box key={dateStr} sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                            <Typography variant="caption" display="block" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                {format(parseISO(dateStr), 'EEE', { locale: gl })}
                            </Typography>
                            <Typography variant="h6">
                                {format(parseISO(dateStr), 'd', { locale: gl })}
                            </Typography>
                        </Box>
                    ))}

                    {/* Time Rows */}
                    {HOURS.map(hour => (
                        <>
                            <Box key={`label-${hour}`} sx={{
                                position: 'sticky',
                                left: 0,
                                bgcolor: 'white',
                                p: 1,
                                borderRight: '1px solid #eee',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1
                            }}>
                                <Typography variant="caption" color="text.secondary">
                                    {hour}:00
                                </Typography>
                            </Box>

                            {meeting.dates.map(dateStr => {
                                const isSelected = tempSlots.some(s => s.day === dateStr && s.hour === hour);

                                return (
                                    <Box
                                        key={`${dateStr}-${hour}`}
                                        onClick={() => handleToggleSlot(dateStr, hour)}
                                        sx={{
                                            borderRight: '1px solid #f0f0f0',
                                            borderBottom: '1px solid #f0f0f0',
                                            height: '50px',
                                            bgcolor: isSelected ? 'primary.main' : 'transparent',
                                            transition: 'background-color 0.2s',
                                            cursor: 'pointer',
                                            '&:active': { opacity: 0.7 }
                                        }}
                                    />
                                );
                            })}
                        </>
                    ))}
                </Box>
            </Box>

            {/* Footer Save */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, maxWidth: '430px', margin: '0 auto' }}>
                <PrimaryButton
                    label={hasVoted ? "Actualizar o meu voto" : "Gardar o meu voto"}
                    onClick={handleSaveVoteClick}
                    disabled={tempSlots.length === 0}
                />
            </Paper>
        </Box>
    );
};
