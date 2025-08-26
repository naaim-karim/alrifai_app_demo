import { capitalize } from "@/lib/utils";
import { FormInputProps } from "@/types";
import { usePathname } from "next/navigation";

const FormInput = ({
  field,
  value,
  error,
  disabled,
  onChange,
  onBlur,
  elementRef,
}: FormInputProps) => {
  const pathname = usePathname();
  const isAdmin = pathname.includes("admin");

  return (
    <div className="mb-4 flex flex-col relative">
      <label htmlFor={field.id} className="label">
        {field.label}
      </label>
      {field.type === "datalist" ? (
        <select
          ref={elementRef as React.RefObject<HTMLSelectElement>}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          name={field.name}
          id={field.id}
          value={value}
          className={`input ${error ? "border-red-300 bg-red-50" : ""}`}
          required
          autoFocus={field.autoFocus || false}
          disabled={disabled}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
        >
          {isAdmin && field.name === "role" ? (
            <>
              <option value="" hidden>
                Select Role
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {capitalize(option)}
                </option>
              ))}
            </>
          ) : (
            <>
              <option value="" hidden>
                Select Group
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {capitalize(option)}
                </option>
              ))}
            </>
          )}
        </select>
      ) : (
        <input
          ref={elementRef as React.RefObject<HTMLInputElement>}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          type={field.type}
          name={field.name}
          id={field.id}
          value={value}
          className={`input ${error ? "border-red-300 bg-red-50" : ""}`}
          placeholder={field.placeholder}
          required
          autoFocus={field.autoFocus || false}
          disabled={disabled}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? `${field.id}-error` : undefined}
        />
      )}
      {error && (
        <p
          className="text-red-500 text-sm mt-1"
          id={`${field.id}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
