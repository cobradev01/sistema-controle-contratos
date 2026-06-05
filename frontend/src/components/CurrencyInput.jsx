import { forwardRef, useCallback } from 'react';

/**
 * Input de moeda BRL com máscara automática.
 * Uso com react-hook-form:
 *   <CurrencyInput control={control} name="value" label="Valor" />
 * Ou controlado manualmente:
 *   <CurrencyInput value={v} onChange={setV} />
 *
 * Retorna o valor numérico puro (float) via onChange/onBlur.
 */

function toDisplay(cents) {
  if (!cents && cents !== 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function toCents(str) {
  const digits = str.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

const CurrencyInput = forwardRef(function CurrencyInput(
  { value, onChange, onBlur, className = '', placeholder = 'R$ 0,00', error, ...rest },
  ref
) {
  const display = value !== undefined && value !== null && value !== ''
    ? toDisplay(Math.round(parseFloat(value) * 100))
    : '';

  const handleChange = useCallback((e) => {
    const cents = toCents(e.target.value);
    const float = cents / 100;
    onChange?.(float);
  }, [onChange]);

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      onBlur={onBlur}
      className={`input font-mono ${error ? 'input-error' : ''} ${className}`}
      {...rest}
    />
  );
});

export default CurrencyInput;
