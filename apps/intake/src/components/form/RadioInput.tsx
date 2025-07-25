import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  Radio,
  RadioGroup,
  RadioGroupProps,
  Typography,
  useTheme,
} from '@mui/material';
import { FC, SyntheticEvent, useContext, useRef } from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IntakeThemeContext } from '../../contexts';
import { useLabelDimensions } from '../../hooks/useLabelDimensions';
import { RadioOption, RadioStyling } from '../../types';
import { BoldPurpleInputLabel } from './BoldPurpleInputLabel';
import CustomRadioButtonIcon from './CustomRadioButtonIcon';
import { InputHelperText } from './InputHelperText';
import { LightToolTip } from './LightToolTip';

type RadioInputProps = {
  name: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  helperText?: string;
  showHelperTextIcon?: boolean;
  infoTextSecondary?: string;
  borderColor?: string;
  borderSelected?: string;
  backgroundSelected?: string;
  centerImages?: boolean;
  getSelected: () => FieldValues;
  onChange: (event: SyntheticEvent) => void;
  radioStyling?: RadioStyling;
} & RadioGroupProps;

const RadioInput: FC<RadioInputProps> = ({
  name,
  label,
  defaultValue,
  required,
  options,
  helperText,
  showHelperTextIcon,
  infoTextSecondary,
  borderColor = 'primary.contrast',
  borderSelected = 'primary.main',
  backgroundSelected,
  getSelected,
  centerImages,
  onChange,
  radioStyling,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const theme = useTheme();
  const { otherColors } = useContext(IntakeThemeContext);
  const { t } = useTranslation();

  const selected = getSelected();
  // console.log('radioStyling', radioStyling);

  const labelRef = useRef<HTMLLabelElement>(null);
  const { labelHeight, lineHeight } = useLabelDimensions(labelRef);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => {
        return (
          <FormControl required={required} error={!!errors[name]} sx={{ width: '100%' }}>
            <BoldPurpleInputLabel id={`${name}-label`} shrink sx={{ whiteSpace: 'normal' }} ref={labelRef}>
              {label}
            </BoldPurpleInputLabel>
            <RadioGroup
              sx={{
                marginTop:
                  lineHeight !== labelHeight ? `${labelHeight ? labelHeight - 8 : lineHeight}px !important` : 3,
                '.MuiFormControlLabel-label': {
                  width: '100%',
                },
                gap: 1,
              }}
              {...field}
              // This is gross but amounts to allowing the value from the form to be over-written with the supplied
              // value prop
              value={field.value || 'unknown'}
              aria-labelledby={`${name}-label`}
            >
              {options.map((option) => {
                const gridWidths = {
                  desktop: { labelText: 8.5, space: 0.2, image: 2 },
                  mobile: { labelText: 12, space: 0, image: 12 },
                };

                if (!option.label || !option.description) {
                  gridWidths.desktop.labelText = 5.5;
                }

                if (!option.image) {
                  gridWidths.desktop.labelText = 11;
                }

                return (
                  <FormControlLabel
                    value={option.value}
                    data-testid={option.label}
                    control={
                      <Radio
                        icon={
                          <Icon
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              scale: '100%',
                              mx: 0.5,
                            }}
                          >
                            <CustomRadioButtonIcon
                              color={theme.palette.secondary}
                              checked={false}
                              alt={t('general.button.unchecked')}
                            />
                          </Icon>
                        }
                        checkedIcon={
                          <Icon sx={{ display: 'flex', justifyContent: 'center', scale: '100%', mx: 0.5 }}>
                            <CustomRadioButtonIcon
                              color={theme.palette.secondary}
                              checked={true}
                              alt={t('general.button.checked')}
                            />
                          </Icon>
                        }
                        sx={{
                          alignSelf: 'center',
                          // If screen is smaller than small breakpoint
                          [theme.breakpoints.down('md')]: {
                            mt: 0,
                          },
                          ...radioStyling?.radio,
                        }}
                      />
                    }
                    key={option.value}
                    label={
                      <Grid
                        container
                        sx={{
                          paddingTop: '5px',
                          paddingBottom: '5px',
                          alignItems: 'center',
                          // If screen is smaller than medium breakpoint
                          [theme.breakpoints.down('md')]: {
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                          },
                        }}
                      >
                        {/* description xs ternary makes it work because point comfort doesn't have
                        a description, might be nice to change it later */}
                        <Grid
                          item
                          sx={{
                            paddingTop: '0.3rem',
                            paddingBottom: '0.5rem',
                            [theme.breakpoints.down('md')]: {
                              paddingTop: '0.1rem',
                              '&.MuiGrid-item': { marginTop: '0px' },
                            },
                          }}
                        >
                          <>
                            {option.label && (
                              <Typography variant="h5" color="primary.main" sx={radioStyling?.label}>
                                {option.label}
                              </Typography>
                            )}
                            {option.description && (
                              <div
                                style={{
                                  lineHeight: '20px',
                                  // spacing between label and description
                                  marginTop: option.label ? '5px' : 0,
                                }}
                              >
                                <Typography variant={option.label ? 'caption' : 'body2'} color="secondary.main">
                                  {option.description}
                                </Typography>
                              </div>
                            )}
                          </>
                        </Grid>
                        {option.image && (
                          <>
                            <Grid item xs={gridWidths.mobile.space} md={gridWidths.desktop.space}></Grid>
                            <Grid
                              item
                              xs={gridWidths.mobile.image}
                              md={gridWidths.desktop.image}
                              sx={{
                                // If screen is larger than medium breakpoint
                                [theme.breakpoints.up('md')]: {
                                  ...(centerImages && { marginLeft: 'auto', marginRight: 'auto' }),
                                },
                              }}
                            >
                              <img alt={option.imageAlt} src={option.image} width={option.imageWidth}></img>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    }
                    onChange={onChange}
                    sx={{
                      border: '1px solid',
                      borderRadius: 2,
                      backgroundColor: () => {
                        if (selected[name] === option.value && backgroundSelected) {
                          return backgroundSelected;
                        } else {
                          return option.color || theme.palette.background.paper;
                        }
                      },
                      borderColor: selected[name] === option.value ? borderSelected : borderColor,
                      paddingTop: 0,
                      paddingBottom: 0,
                      paddingRight: 2,
                      marginX: 0,
                      minHeight: 46,
                      height: radioStyling?.height,
                    }}
                  />
                );
              })}
            </RadioGroup>
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

export default RadioInput;
