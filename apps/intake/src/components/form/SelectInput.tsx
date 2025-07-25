import { ExpandMore } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, FormControl, MenuItem, Select, SelectProps, Typography, useTheme } from '@mui/material';
import { FC, useContext, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IntakeThemeContext } from '../../contexts';
import { findLabelFromOptions } from '../../helpers';
import { useLabelDimensions } from '../../hooks/useLabelDimensions';
import { SelectInputOption } from '../../types';
import { BoldPurpleInputLabel } from './BoldPurpleInputLabel';
import { InputHelperText } from './InputHelperText';
import { LightToolTip } from './LightToolTip';
import RenderLabelFromSelect from './RenderLabelFromSelect';

type SelectInputProps = {
  name: string;
  label: string;
  options: SelectInputOption[];
  helperText?: string;
  showHelperTextIcon?: boolean;
  placeholder?: string;
  infoTextSecondary?: string;
} & SelectProps;

const SelectInput: FC<SelectInputProps> = ({
  name,
  label,
  defaultValue,
  options,
  helperText,
  showHelperTextIcon,
  placeholder,
  infoTextSecondary,
  ...otherProps
}) => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const theme = useTheme();
  const { otherColors } = useContext(IntakeThemeContext);

  const labelRef = useRef<HTMLLabelElement>(null);
  const { labelHeight, lineHeight } = useLabelDimensions(labelRef);
  const { t } = useTranslation();

  useEffect(() => {
    const value = getValues(name);
    if (!options.find((option) => option.label === value || option.value === value) && value && value.length != 0) {
      setValue(name, '');
    }
  }, [getValues, name, options, setValue]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || ''}
      render={({ field }) => {
        return (
          <FormControl
            variant="standard"
            required={otherProps.required}
            error={!!errors[name]}
            sx={{
              width: '100%',
            }}
          >
            <BoldPurpleInputLabel
              id={`${name}-label`}
              htmlFor={name}
              shrink
              sx={{ whiteSpace: 'pre-wrap' }}
              ref={labelRef}
            >
              {label}
            </BoldPurpleInputLabel>
            <Select
              id={name}
              labelId={`${name}-label`}
              IconComponent={ExpandMore}
              displayEmpty
              {...field}
              value={
                options.find((option) => option.label === field.value || option.value === field.value)
                  ? field.value
                  : ''
              }
              {...otherProps}
              disableUnderline
              // To stop it adding a padding-right on the main element, shifting the background image
              MenuProps={{ disableScrollLock: true, PaperProps: { style: { maxHeight: 400 } } }}
              sx={{
                marginTop:
                  lineHeight !== labelHeight ? `${labelHeight ? labelHeight - 8 : lineHeight}px !important` : '',
                '& .MuiInputBase-input': {
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: otherColors.lightGray,
                  padding: '10px 26px 10px 12px',
                  '&:focus': {
                    borderRadius: '8px',
                    backgroundColor: theme.palette.background.paper,
                  },
                },
                '& .MuiSelect-icon': {
                  marginRight: '10px',
                },
                '& .MuiSelect-iconOpen': {
                  marginRight: '10px',
                },
                '& .MuiSelect-select .MuiTypography-inherit': {
                  whiteSpace: 'normal',
                },
              }}
              renderValue={(selected) => {
                if (
                  selected.length === 0 ||
                  !options.find((option) => option.label === selected || option.value === selected)
                ) {
                  return (
                    <RenderLabelFromSelect styles={{ color: otherColors.placeholder }}>
                      {placeholder || t('general.select')}
                    </RenderLabelFromSelect>
                  );
                }
                return <RenderLabelFromSelect>{findLabelFromOptions(selected, options)}</RenderLabelFromSelect>;
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {infoTextSecondary ? (
              <LightToolTip
                title={infoTextSecondary}
                placement="top"
                enterTouchDelay={0}
                backgroundColor={otherColors.toolTipGrey}
                color={otherColors.black}
              >
                <Box
                  sx={{
                    color: otherColors.scheduleBorder,
                    width: 'fit-content',
                    display: 'flex',
                    marginTop: 0.5,
                    cursor: 'default',
                  }}
                >
                  <InfoOutlinedIcon style={{ height: '16px', width: '16px' }} />
                  <Typography sx={{ fontSize: '14px', marginLeft: 0.5 }}>
                    {t('aboutPatient.birthSex.whyAskLabel')}
                  </Typography>
                </Box>
              </LightToolTip>
            ) : null}
            <InputHelperText
              name={name}
              errors={errors}
              helperText={helperText}
              showHelperTextIcon={showHelperTextIcon}
            />
          </FormControl>
        );
      }}
    />
  );
};

export default SelectInput;
