import { FormField, FormValue, FormValues } from "@/types";
import { createRef, useMemo, useState, useCallback, useEffect } from "react";

export const useFormFields = (
  fields: FormField[],
  setServerError: (error: string | null) => void
) => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const getInitialFormValues = useCallback((): FormValues => {
    const initialValues: FormValues = {};
    try {
      const saved = localStorage.getItem("formValues");

      if (saved) {
        const parsedData = JSON.parse(saved);
        fields.forEach((field) => {
          if (field.type === "file") {
            initialValues[field.name] = field.defaultValue || null;
          } else {
            initialValues[field.name] =
              parsedData[field.name] !== undefined
                ? parsedData[field.name]
                : field.defaultValue || "";
          }
        });
        return initialValues;
      }
    } catch {}

    fields.forEach((field) => {
      if (field.type === "file") {
        initialValues[field.name] = null;
      } else {
        initialValues[field.name] = field.defaultValue || "";
      }
    });
    return initialValues;
  }, [fields]);

  const [values, setValues] = useState<FormValues>(() =>
    getInitialFormValues()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fields.length > 0 && Object.keys(values).length === 0) {
      setValues(() => getInitialFormValues());
    } else if (fields.length > 0 && Object.keys(values).length > 0) {
      setInitialLoadComplete(true);
    }
  }, [fields, getInitialFormValues, values]);

  useEffect(() => {
    if (fields.length <= 0 || !initialLoadComplete) {
      return;
    }

    try {
      const stringValues: Record<string, string> = {};
      Object.entries(values).forEach(([key, value]) => {
        const field = fields.find((f) => f.name === key);
        if (
          field &&
          field.type !== "file" &&
          value !== null &&
          value !== undefined
        ) {
          stringValues[key] = String(value);
        }
      });
      localStorage.setItem("formValues", JSON.stringify(stringValues));
    } catch {}
  }, [values, fields, initialLoadComplete]);

  const refs = useMemo(() => {
    const initialRefs: Record<
      string,
      React.RefObject<HTMLInputElement | HTMLSelectElement | null>
    > = {};
    fields.forEach((field) => {
      if (field.type === "select") {
        initialRefs[field.name] = createRef<HTMLSelectElement>();
      } else {
        initialRefs[field.name] = createRef<HTMLInputElement>();
      }
    });
    return initialRefs;
  }, [fields]);

  const validateField = useCallback(
    async (field: FormField, value: FormValue) => {
      if (field.validation) {
        return field.validation(value);
      }
      return null;
    },
    []
  );

  useEffect(() => {
    const validateFields = async () => {
      const savedData = localStorage.getItem("formValues");
      if (savedData && initialLoadComplete) {
        try {
          const parsedData = JSON.parse(savedData);
          let firstErrorField: string | null = null;

          const validationPromises = fields.map(async (field) => {
            const value = parsedData[field.name];
            if (value !== undefined && value !== "") {
              const error = await validateField(field, value);
              if (error) {
                if (!firstErrorField) {
                  firstErrorField = field.name;
                }
              }
              return error ? { fieldName: field.name, error } : null;
            }
            return null;
          });

          const results = await Promise.all(validationPromises);
          const newErrors: Record<string, string> = {};
          results.forEach((result) => {
            if (result) {
              newErrors[result.fieldName] = result.error;
            }
          });
          setErrors((prev) => ({ ...prev, ...newErrors }));
          if (firstErrorField && refs[firstErrorField]?.current) {
            refs[firstErrorField].current?.focus();
          }
        } catch {
          localStorage.removeItem("formValues");
        }
      }
    };

    validateFields();
  }, [fields, validateField, refs, initialLoadComplete]);

  const handleFieldChange = useCallback(
    async (field: FormField, value: FormValue) => {
      const fieldName = field.name;
      setValues((prev) => ({ ...prev, [fieldName]: value }));

      if (field) {
        const error = await validateField(field, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error || "" }));
      }
    },
    [validateField]
  );

  const handleFieldBlur = useCallback(
    async (field: FormField) => {
      const fieldName = field.name;

      if (field) {
        const value = values[fieldName];
        const error = await validateField(field, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error || "" }));
      }
    },
    [values, validateField]
  );

  const validateAllFields = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    const validationPromises = fields.map(async (field) => {
      const value = values[field.name] || "";
      const error = await validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
        if (!firstErrorField) {
          firstErrorField = field.name;
        }
      }
    });

    await Promise.all(validationPromises);
    setErrors(newErrors);

    if (firstErrorField && refs[firstErrorField]?.current) {
      refs[firstErrorField].current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  }, [fields, refs, validateField, values]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    localStorage.removeItem("formValues");
    setValues(() => getInitialFormValues());
    clearErrors();
    setServerError(null);
  }, [getInitialFormValues, clearErrors, setServerError]);

  return {
    values,
    errors,
    refs,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    clearErrors,
    resetForm,
  };
};
