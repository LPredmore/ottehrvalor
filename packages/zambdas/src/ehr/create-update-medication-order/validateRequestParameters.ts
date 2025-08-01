import { MedicationInteractions, UpdateMedicationOrderInput } from 'utils';
import { ZambdaInput } from '../../shared';

export function validateRequestParameters(
  input: ZambdaInput
): UpdateMedicationOrderInput & Pick<ZambdaInput, 'secrets'> {
  console.group('validateRequestParameters');

  if (!input.body) {
    throw new Error('No request body provided');
  }

  const { orderId, newStatus, orderData } = JSON.parse(input.body);

  if (newStatus) {
    if (newStatus === 'administered' && !orderData) {
      throw new Error(`With status 'administered' order data should be provided.`);
    }
    if (newStatus === 'pending') {
      throw new Error('Cannot change status back to pending.');
    }
    if (orderId && newStatus !== 'administered' && newStatus !== 'cancelled' && !orderData?.reason) {
      throw new Error(`Reason should be provided if you changing status to anything except 'administered'`);
    }
    if (newStatus === 'administered') {
      if (!orderData.effectiveDateTime)
        throw new Error('On status change to "administered" effectiveDateTime field should be present in zambda input');
    }

    const missedFields: string[] = [];
    if (orderData && !orderId) {
      if (!orderData.patient) missedFields.push('patient');
      if (!orderData.encounter) missedFields.push('encounter');
      if (!orderData.medicationId) missedFields.push('medicationId');
      if (!orderData.units) missedFields.push('units');
      if (!orderData.dose) missedFields.push('dose');
      if (!orderData.route) missedFields.push('route');
    }
    if (missedFields.length > 0) throw new Error(`Missing fields in orderData: ${missedFields.join(', ')}`);
  }

  if (orderData?.interactions) {
    validateInteractions(orderData.interactions);
  }

  console.groupEnd();
  console.debug('validateRequestParameters success');

  return {
    orderId,
    newStatus,
    orderData,
    secrets: input.secrets,
  };
}

function validateInteractions(interactions: MedicationInteractions): void {
  const missingOverrideReason: string[] = [];
  interactions.drugInteractions?.forEach((interaction, index) => {
    if (!interaction.overrideReason) {
      missingOverrideReason.push(`interactions.drugInteractions[${index}]`);
    }
  });
  interactions.allergyInteractions?.forEach((interaction, index) => {
    if (!interaction.overrideReason) {
      missingOverrideReason.push(`interactions.allergyInteractions[${index}]`);
    }
  });
  if (missingOverrideReason.length > 0) {
    throw new Error(`overrideReason is missing for ${missingOverrideReason.join(', ')}`);
  }
}
