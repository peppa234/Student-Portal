import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop as string),
})<ButtonProps>(({ theme, variant = 'primary', size = 'medium' }) => {
  const baseStyles = {
    borderRadius: '12px',
    textTransform: 'none' as const,
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      transform: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(135deg, #059669, #047857)',
      },
    },
    secondary: {
      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
      },
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      },
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(135deg, #059669, #047857)',
      },
    },
    outline: {
      background: 'transparent',
      color: theme.palette.primary.main,
      border: `2px solid ${theme.palette.primary.main}`,
      '&:hover': {
        background: theme.palette.primary.main,
        color: 'white',
      },
    },
  };

  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      minHeight: '36px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '1rem',
      minHeight: '44px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '1.125rem',
      minHeight: '52px',
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    [theme.breakpoints.down('sm')]: {
      ...sizeStyles.medium, // Default to medium on mobile
      width: '100%', // Full width on mobile
    },
  };
});

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  ...props 
}) => {
  const getMuiVariant = (variant: ButtonProps['variant']): MuiButtonProps['variant'] => {
    if (variant === 'outline') return 'outlined';
    return 'contained';
  };

  return (
    <StyledButton
      variant={getMuiVariant(variant)}
      size={size}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
