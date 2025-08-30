import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface BaseFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  sx?: any;
}

interface TextFieldProps extends BaseFormFieldProps {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

interface SelectFieldProps extends BaseFormFieldProps {
  type: 'select';
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  loading?: boolean;
  emptyText?: string;
  multiple?: boolean;
}

type FormFieldProps = TextFieldProps | SelectFieldProps;

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    fontSize: '0.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const FormField: React.FC<FormFieldProps> = (props) => {
  const {
    label,
    error,
    required = false,
    disabled = false,
    fullWidth = true,
    helperText,
    sx,
  } = props;

  if (props.type === 'select') {
    const selectProps = props as SelectFieldProps;
    const {
      value,
      onChange,
      options,
      loading = false,
      emptyText = 'No options available',
      multiple = false,
    } = selectProps;

    return (
      <StyledFormControl
        fullWidth={fullWidth}
        error={!!error}
        required={required}
        disabled={disabled}
        sx={sx}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label={label}
          multiple={multiple}
          renderValue={multiple ? (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {Array.isArray(selected) ? selected.map((value) => {
                const option = options.find(opt => opt.value === value);
                return option ? (
                  <Chip key={value} label={option.label} size="small" />
                ) : null;
              }) : null}
            </Box>
          ) : undefined}
        >
          {loading ? (
            <MenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Loading...</Typography>
              </Box>
            </MenuItem>
          ) : options.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {emptyText}
              </Typography>
            </MenuItem>
          ) : (
            options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))
          )}
        </Select>
        {(error || helperText) && (
          <FormHelperText error={!!error}>
            {error || helperText}
          </FormHelperText>
        )}
      </StyledFormControl>
    );
  }

  const textProps = props as TextFieldProps;
  const {
    type,
    value,
    onChange,
    placeholder,
    multiline = false,
    rows = 1,
  } = textProps;

  return (
    <StyledTextField
      type={type}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      error={!!error}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      helperText={error || helperText}
      sx={sx}
    />
  );
};

export default FormField;
