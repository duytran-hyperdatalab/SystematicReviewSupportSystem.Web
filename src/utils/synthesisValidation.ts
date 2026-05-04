import type { DataSynthesisStrategy } from "../types/synthesis";

export interface SynthesisValidationError {
  index: number;
  field: string;
  message: string;
}

/**
 * Validate a single synthesis strategy against backend requirements
 * @param strategy - The synthesis strategy to validate
 * @param index - The index of the strategy in the list (for error reporting)
 * @returns Array of validation errors (empty if valid)
 */
export function validateSynthesisStrategy(
  strategy: DataSynthesisStrategy,
  index: number
): SynthesisValidationError[] {
  const errors: SynthesisValidationError[] = [];

  // Validate SynthesisType (Required)
  if (!strategy.synthesis_type || strategy.synthesis_type.trim() === "") {
    errors.push({
      index,
      field: "synthesis_type",
      message: `Strategy ${index + 1}: Synthesis Type is required`,
    });
  }

  // Validate Description (Required)
  if (!strategy.description || strategy.description.trim() === "") {
    errors.push({
      index,
      field: "description",
      message: `Strategy ${index + 1}: Description is required`,
    });
  }

  // Validate Description length (max 2000 characters)
  if (strategy.description && strategy.description.length > 2000) {
    errors.push({
      index,
      field: "description",
      message: `Strategy ${index + 1}: Description cannot exceed 2000 characters (current: ${strategy.description.length})`,
    });
  }

  // Validate TargetResearchQuestionIds (Required - at least one)
  if (
    !strategy.target_research_question_ids ||
    strategy.target_research_question_ids.length === 0
  ) {
    errors.push({
      index,
      field: "target_research_question_ids",
      message: `Strategy ${index + 1}: At least one Target Research Question must be selected`,
    });
  }

  return errors;
}

/**
 * Validate all synthesis strategies
 * @param strategies - Array of synthesis strategies to validate
 * @returns Array of all validation errors (empty if all valid)
 */
export function validateAllSynthesisStrategies(
  strategies: DataSynthesisStrategy[]
): SynthesisValidationError[] {
  const allErrors: SynthesisValidationError[] = [];

  strategies.forEach((strategy, index) => {
    const strategyErrors = validateSynthesisStrategy(strategy, index);
    allErrors.push(...strategyErrors);
  });

  return allErrors;
}

/**
 * Check if a specific strategy has any validation errors
 * @param strategy - The synthesis strategy to check
 * @param index - The index of the strategy
 * @returns true if strategy is valid, false otherwise
 */
export function isSynthesisStrategyValid(
  strategy: DataSynthesisStrategy,
  index: number
): boolean {
  return validateSynthesisStrategy(strategy, index).length === 0;
}

/**
 * Get errors for a specific strategy field
 * @param strategy - The synthesis strategy
 * @param index - The index of the strategy
 * @param field - The field to check
 * @returns Error message if field is invalid, undefined otherwise
 */
export function getSynthesisFieldError(
  strategy: DataSynthesisStrategy,
  index: number,
  field: keyof DataSynthesisStrategy
): string | undefined {
  const errors = validateSynthesisStrategy(strategy, index);
  return errors.find((e) => e.field === field)?.message;
}
