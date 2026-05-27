type StageLike = {
  value?: string | null;
  label?: string | null;
  color?: string | null;
};

function isResolvedTranslation(value?: string | null): value is string {
  return Boolean(value && !value.startsWith('const.'));
}

export function normalizeStageValue(value?: string | null): string {
  if (!value) return '';
  return value.startsWith('const.dealStage.') ? value.slice('const.dealStage.'.length) : value;
}

export function resolveDealStageLabel(stage: StageLike, t: (key: string) => string): string {
  const normalizedValue = normalizeStageValue(stage.value);
  const translatedLabel = stage.label?.startsWith('const.') ? t(stage.label) : stage.label;

  if (isResolvedTranslation(translatedLabel)) return translatedLabel;

  const translatedByValue = normalizedValue ? t(`const.dealStage.${normalizedValue}`) : '';
  if (isResolvedTranslation(translatedByValue)) return translatedByValue;

  return stage.label || normalizedValue || '-';
}

export function normalizeStageOption<T extends StageLike>(stage: T, t: (key: string) => string): T & { value: string; label: string } {
  return {
    ...stage,
    value: normalizeStageValue(stage.value),
    label: resolveDealStageLabel(stage, t),
  };
}