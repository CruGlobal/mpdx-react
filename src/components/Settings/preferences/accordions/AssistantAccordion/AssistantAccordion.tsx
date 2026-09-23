import React, { useId, useState } from 'react';
import {
  Divider,
  FormControlLabel,
  FormHelperText,
  Stack,
  Switch,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AssistantFirstRunDialog } from 'src/components/Assistant/AssistantFirstRunDialog';
import {
  AssistantSettingsFieldsFragment,
  useUpdateAssistantSettingsMutation,
} from 'src/components/Assistant/AssistantSettings.generated';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { getAppName } from 'src/lib/getAppName';
import { AccordionProps } from '../../../accordionHelper';
import { AssistantOptOutDialog } from './AssistantOptOutDialog';

type CapabilityField = keyof Pick<
  AssistantSettingsFieldsFragment,
  | 'helpEnabled'
  | 'accountSummaryEnabled'
  | 'partnersEnabled'
  | 'partnerDetailsEnabled'
  | 'suggestEnabled'
  | 'prayerLettersEnabled'
  | 'historyEnabled'
>;

type SwitchAttributes = Partial<
  Pick<AssistantSettingsFieldsFragment, 'launcherHidden' | CapabilityField>
>;

interface Capability {
  field: CapabilityField;
  label: string;
  modelSees: string;
  comingLater: boolean;
}

interface SettingSwitchProps {
  label: string;
  helperTexts: string[];
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({
  label,
  helperTexts,
  checked,
  disabled,
  onChange,
}) => {
  const helperId = useId();

  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            slotProps={{ input: { 'aria-describedby': helperId } }}
          />
        }
        label={label}
      />
      <div id={helperId}>
        {helperTexts.map((text) => (
          <FormHelperText key={text}>{text}</FormHelperText>
        ))}
      </div>
    </div>
  );
};

interface AssistantAccordionProps extends AccordionProps<PreferenceAccordion> {
  settings: AssistantSettingsFieldsFragment;
  disabled?: boolean;
}

export const AssistantAccordion: React.FC<AssistantAccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  settings,
  disabled,
}) => {
  const { t } = useTranslation();
  const appName = getAppName();
  const { enqueueSnackbar } = useSnackbar();
  const [updateAssistantSettings] = useUpdateAssistantSettingsMutation();
  const [firstRunOpen, setFirstRunOpen] = useState(false);
  const [optOutOpen, setOptOutOpen] = useState(false);

  const save = (attributes: SwitchAttributes) =>
    updateAssistantSettings({
      variables: { attributes },
      optimisticResponse: {
        updateAssistantSettings: {
          __typename: 'AssistantSettingsUpdateMutationPayload',
          assistantSettings: {
            __typename: 'AssistantSettings',
            ...settings,
            ...attributes,
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), { variant: 'error' });
      },
    });

  const handleEnabledChange = (checked: boolean) => {
    if (checked) {
      setFirstRunOpen(true);
    } else {
      setOptOutOpen(true);
    }
  };

  // Pending CON-004 review
  const capabilities: Capability[] = [
    {
      field: 'helpEnabled',
      label: t('Help me use {{appName}}', { appName }),
      modelSees: t(
        'What the model sees: help articles and a map of the app. No account data.',
      ),
      comingLater: false,
    },
    {
      field: 'accountSummaryEnabled',
      label: t('Summarize my account'),
      modelSees: t(
        'What the model sees: account totals, such as gifts received and progress toward your goal.',
      ),
      comingLater: true,
    },
    {
      field: 'partnersEnabled',
      label: t('Talk about my partners'),
      modelSees: t(
        'What the model sees: gift amounts, dates, and statuses for each partner, with names swapped for placeholders.',
      ),
      comingLater: true,
    },
    {
      field: 'partnerDetailsEnabled',
      label: t('Show partner details on request'),
      modelSees: t(
        'What the model sees: nothing extra. Contact cards go straight to you.',
      ),
      comingLater: true,
    },
    {
      field: 'suggestEnabled',
      label: t('Suggest next steps'),
      modelSees: t(
        'What the model sees: nothing extra. You confirm every suggestion before anything changes.',
      ),
      comingLater: true,
    },
    {
      field: 'prayerLettersEnabled',
      label: t('Help write my prayer letters'),
      modelSees: t(
        'What the model sees: your Assistant profile as you wrote it, plus recent activity with names swapped for placeholders.',
      ),
      comingLater: true,
    },
    {
      field: 'historyEnabled',
      label: t('Keep my conversation history'),
      modelSees: t(
        'What the model sees: nothing extra. When this is off, your conversations are not saved.',
      ),
      comingLater: false,
    },
  ];

  return (
    <AccordionItem
      accordion={PreferenceAccordion.Assistant}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={t('Assistant')}
      value={settings.enabled ? t('On') : t('Off')}
      fullWidth
      disabled={disabled}
    >
      <Stack spacing={2}>
        <SettingSwitch
          label={t('Turn on the Assistant')}
          helperTexts={[
            t(
              'Turning it off deletes your conversations right away. You can turn it back on at any time.',
            ),
          ]}
          checked={settings.enabled}
          onChange={handleEnabledChange}
        />
        <SettingSwitch
          label={t('Hide the Assistant button')}
          helperTexts={[
            t(
              'Hides the Assistant button in the top bar. This is the only place to bring it back.',
            ),
          ]}
          checked={settings.launcherHidden}
          onChange={(checked) => save({ launcherHidden: checked })}
        />
        <Divider />
        {capabilities.map(({ field, label, modelSees, comingLater }) => (
          <SettingSwitch
            key={field}
            label={label}
            helperTexts={
              comingLater ? [modelSees, t('Coming later.')] : [modelSees]
            }
            checked={settings[field]}
            disabled={!settings.enabled || comingLater}
            onChange={(checked) => save({ [field]: checked })}
          />
        ))}
      </Stack>
      <AssistantFirstRunDialog
        open={firstRunOpen}
        onClose={() => setFirstRunOpen(false)}
      />
      <AssistantOptOutDialog
        open={optOutOpen}
        onClose={() => setOptOutOpen(false)}
      />
    </AccordionItem>
  );
};
