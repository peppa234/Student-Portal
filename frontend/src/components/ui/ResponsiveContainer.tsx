import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ResponsiveContainerProps extends Omit<BoxProps, 'component'> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'small' | 'medium' | 'large';
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

const StyledResponsiveContainer = styled(Box, {
  shouldForwardProp: (prop) => !['maxWidth', 'padding', 'spacing'].includes(prop as string),
})<ResponsiveContainerProps>(({ theme, maxWidth = 'lg', padding = 'medium', spacing = 'medium' }) => {
  const maxWidths = {
    xs: '444px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px',
  };

  const paddings = {
    none: 0,
    small: theme.spacing(2),
    medium: theme.spacing(3),
    large: theme.spacing(4),
  };

  const spacings = {
    none: 0,
    small: theme.spacing(1),
    medium: theme.spacing(2),
    large: theme.spacing(3),
  };

  return {
    width: '100%',
    maxWidth: maxWidths[maxWidth],
    margin: '0 auto',
    padding: paddings[padding],
    '& > * + *': {
      marginTop: spacings[spacing],
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      '& > * + *': {
        marginTop: theme.spacing(1.5),
      },
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1.5),
      '& > * + *': {
        marginTop: theme.spacing(1),
      },
    },
  };
});

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  maxWidth = 'lg',
  padding = 'medium',
  spacing = 'medium',
  ...props 
}) => {
  return (
    <StyledResponsiveContainer
      maxWidth={maxWidth}
      padding={padding}
      spacing={spacing}
      {...props}
    >
      {children}
    </StyledResponsiveContainer>
  );
};

export default ResponsiveContainer;
