import { yupResolver } from '@hookform/resolvers/yup';
import { Paper, TextField, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useCreateAlertDefinition } from 'src/queries/cloudpulse/alerts';

import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
import { EngineOption } from './GeneralInformation/EngineOption';
import { CloudPulseRegionSelect } from './GeneralInformation/RegionSelect';
import { CloudPulseMultiResourceSelect } from './GeneralInformation/ResourceMultiSelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';
import { CreateAlertDefinitionFormSchema } from './schemas';
import { filterFormValues, filterMetricCriteriaFormValues } from './utilities';

import type { CreateAlertDefinitionForm, MetricCriteriaForm } from './types';
import type { TriggerCondition } from '@linode/api-v4/lib/cloudpulse/types';

const triggerConditionInitialValues: TriggerCondition = {
  evaluation_period_seconds: 0,
  polling_interval_seconds: 0,
  trigger_occurrences: 0,
};
const criteriaInitialValues: MetricCriteriaForm = {
  aggregation_type: null,
  dimension_filters: [],
  metric: '',
  operator: null,
  value: 0,
};
const initialValues: CreateAlertDefinitionForm = {
  channel_ids: [],
  engineType: null,
  entity_ids: [],
  label: '',
  region: '',
  rule_criteria: {
    rules: filterMetricCriteriaFormValues(criteriaInitialValues),
  },
  serviceType: null,
  severity: null,
  triggerCondition: triggerConditionInitialValues,
};

const overrides = [
  {
    label: 'Definitions',
    linkTo: '/monitor/alerts/definitions',
    position: 1,
  },
  {
    label: 'Details',
    linkTo: `/monitor/alerts/definitions/create`,
    position: 2,
  },
];
export const CreateAlertDefinition = () => {
  const history = useHistory();
  const alertCreateExit = () => history.push('/monitor/alerts/definitions');

  const formMethods = useForm<CreateAlertDefinitionForm>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(CreateAlertDefinitionFormSchema),
  });

  const {
    control,
    formState,
    getValues,
    handleSubmit,
    setError,
    watch,
  } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition(
    getValues('serviceType')!
  );

  const serviceTypeWatcher = watch('serviceType');
  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAlert(filterFormValues(values));
      enqueueSnackbar('Alert successfully created', {
        variant: 'success',
      });
      alertCreateExit();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });

  return (
    <Paper sx={{ paddingLeft: 1, paddingRight: 1, paddingTop: 2 }}>
      <Breadcrumb crumbOverrides={overrides} pathname="/Definitions/Create" />
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <Typography marginTop={2} variant="h2">
            1. General Information
          </Typography>
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                data-testid="alert-name"
                errorText={fieldState.error?.message}
                label="Name"
                name="label"
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Enter Name"
                value={field.value ?? ''}
              />
            )}
            control={control}
            name="label"
          />
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Description"
                name="description"
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
                optional
                placeholder="Enter Description"
                value={field.value ?? ''}
              />
            )}
            control={control}
            name="description"
          />
          <CloudPulseServiceSelect name="serviceType" />
          {serviceTypeWatcher === 'dbaas' && <EngineOption name="engineType" />}
          <CloudPulseRegionSelect name="region" />
          <CloudPulseMultiResourceSelect
            engine={watch('engineType')}
            name="entity_ids"
            region={watch('region')}
            serviceType={serviceTypeWatcher}
          />
          <CloudPulseAlertSeveritySelect name="severity" />
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: alertCreateExit,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
    </Paper>
  );
};
