// canvas-box/CanvasBoxFormWizard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Alert, Button, Form } from '@/components/ui';
import { canvasBoxSchema, CanvasBoxFormValues } from './canvasBoxSchema';

import StepGeneral from './steps/StepGeneral';
import StepMapConfig from './steps/StepMapConfig';
import StepDiagramConfig from './steps/StepDiagramConfig';
import StepAttributes from './steps/StepAttributes';
import StepMeta from './steps/StepMeta';
import { VisibilityTypeClass } from '../../../../../../common/Entity/CanvasBox';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';

interface CanvasBoxFormWizardProps {
  defaultValues?: Partial<CanvasBoxFormValues>;
  onSaveStep?: (step: number, values: CanvasBoxFormValues) => Promise<void> | void | any;
  onFinish?: (values: CanvasBoxFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export const CanvasBoxFormWizard: React.FC<CanvasBoxFormWizardProps> = ({
  defaultValues,
  onSaveStep,
  onFinish,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useTimeOutMessage();
  const methods = useForm<CanvasBoxFormValues>({
    resolver: zodResolver(canvasBoxSchema),
    defaultValues: {
      entityName: defaultValues?.entityName ?? '',
      stereotype: defaultValues?.stereotype,
      description: defaultValues?.description,
      extendsId: defaultValues?.extendsId,
      mapConfig: defaultValues?.mapConfig,
      diagramConfig:
        defaultValues?.diagramConfig ?? {
          visibility: VisibilityTypeClass.PUBLIC,
        },
      attributes: defaultValues?.attributes ?? [],
      classification: defaultValues?.classification,
      rules: defaultValues?.rules,
      mixins: defaultValues?.mixins ?? [],
    },
  });

  const {
    trigger,
    getValues,
    handleSubmit,
  } = methods;

  const saveCurrentStep = async (asFinish = false) => {
    if (saving) return;
    setSaving(true);
    try {
      // Only validate step 1 (entityName)
      if (step === 1) {
        const ok = await trigger(['entityName']);
        if (!ok) {
          setSaving(false);
          return false;
        }
      }

      const values = getValues();
      if (onSaveStep) {
        await onSaveStep(step, values);
      }

      if (asFinish && onFinish) {
        await onFinish(values);
      }
      return true;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const ok = await saveCurrentStep(false);
    if (!ok) return;
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleFinish = handleSubmit(async () => {
    const ok = await saveCurrentStep(true);
    if (!ok) return;
    // stay on last step or close in parent
  });

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSkip = () => {
    setStep((s) => Math.min(s + 1, 5));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepGeneral />;
      case 2:
        return <StepMapConfig />;
      case 3:
        return <StepDiagramConfig />;
      case 4:
        return <StepAttributes />;
      case 5:
        return <StepMeta />;
      default:
        return <StepGeneral />;
    }
  };

  return (
    <>
     {message && (
        <Alert showIcon className="mb-4" type="danger">
          <span className="break-all">{message}</span>
        </Alert>
      )}
    <FormProvider {...methods}>
      <Form className="space-y-6" onSubmit={handleFinish}>
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">
            Step {step} of 5
          </div>
          {saving && (
            <div className="text-xs text-muted-foreground">
              Saving...
            </div>
          )}
        </div>

        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <div>
            {onCancel && (
              <Button
                type="button"
                variant='default'
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step > 2 && (
              <Button
                type="button"
                variant="default"
                onClick={handleBack}
                disabled={saving}
              >
                Back
              </Button>
            )}

            {step > 1 && step < 5 && (
              <Button
                type="button"
                variant="default"
                onClick={handleSkip}
                disabled={saving}
              >
                Skip
              </Button>
            )}

            {step < 5 && (
              <Button
                type="button"
                variant="solid"
                onClick={handleNext}
                loading={saving}
              >
                Next
              </Button>
            )}

            {step === 5 && (
              <Button
                type="submit"
                variant="default"
                loading={saving}
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </Form>
    </FormProvider>
    </>
    
  );
};
