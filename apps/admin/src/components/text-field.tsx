import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  /** Validation error; replaces the hint and marks the input invalid. */
  error?: string;
  /** Quiet guidance below the field, shown when there is no error. */
  hint?: string;
  /** Machine values (credentials, IPs, paths, URLs) render in mono. */
  mono?: boolean;
  /** Trailing control inside the input, e.g. a visibility toggle. */
  suffix?: ReactNode;
};

export function TextField({ label, error, hint, mono = false, suffix, ...props }: TextFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={`h-11 w-full rounded-md border bg-surface px-3 text-[0.9375rem] text-ink transition-colors duration-150 outline-offset-2 placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-action motion-reduce:transition-none ${
            error ? "border-danger" : "border-line hover:border-line-strong"
          } ${mono ? "font-mono" : ""} ${suffix ? "pr-12" : ""}`}
          {...props}
        />
        {suffix && <div className="absolute inset-y-0 right-1 flex items-center">{suffix}</div>}
      </div>
      {message && (
        <p
          id={messageId}
          className={`mt-1.5 animate-message-in text-[0.8125rem] leading-snug motion-reduce:animate-none ${
            error ? "text-danger" : "text-ink-muted"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
