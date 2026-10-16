import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
}

export function Input({ label, error, hint, prefix, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          {...props}
          id={inputId}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'} ${prefix ? 'pl-9' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = props.id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        {...props}
        id={textareaId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y min-h-[80px] ${error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'} ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = props.id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <select
        {...props}
        id={selectId}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'} ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
