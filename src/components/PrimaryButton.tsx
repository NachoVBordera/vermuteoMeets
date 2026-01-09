import { Button } from '@mui/material';
import type { ComponentProps } from 'react';

interface PrimaryButtonProps extends ComponentProps<typeof Button> {
    label: string;
}

export const PrimaryButton = ({ label, ...props }: PrimaryButtonProps) => {
    return (
        <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            {...props}
        >
            {label}
        </Button>
    );
};
