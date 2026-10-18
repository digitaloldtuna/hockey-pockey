import { Field, Input, Text } from '@chakra-ui/react';
import { ErrorMessage, Field as FormField, FieldProps } from 'formik';

type Props = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
};

const AuthField = ({ name, label, type = 'text', placeholder, autoComplete }: Props) => (
  <FormField name={name}>
    {({ field }: FieldProps) => (
      <Field.Root width="full">
        <Field.Label fontWeight="semibold" fontSize="12px">
          {label}
        </Field.Label>
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minH="44px"
          px="14px"
          rounded="12px"
          bg="white"
          border="1px solid"
          borderColor="line"
          _focus={{ borderColor: 'sidebarRaised', boxShadow: 'none', outline: 'none' }}
        />
        <ErrorMessage name={name}>
          {(msg) => (
            <Text color="#820707" fontSize="xs">
              {msg}
            </Text>
          )}
        </ErrorMessage>
      </Field.Root>
    )}
  </FormField>
);

export const SubmitButton = ({ children }: { children: React.ReactNode }) => (
  <button
    type="submit"
    style={{
      minHeight: 44,
      marginTop: 8,
      borderRadius: 12,
      border: '1px solid #16263A',
      background: '#2E4058',
      color: '#fff',
      fontFamily: 'inherit',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

export default AuthField;
