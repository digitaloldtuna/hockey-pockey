import { ROUTES } from '../../constants/routes';
import { Button, Field, Input, Link, Text, VStack } from '@chakra-ui/react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';
import * as Yup from 'yup';
import { ErrorMessage, Form, Formik, Field as FormField } from 'formik';
import AuthLayout from './AuthLayout';

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues = {
  email: '',
  password: '',
};

const LoginPage = () => {
  useTitle('Log In');
  const { handleLogin } = useAuthentication();

  const validationSchema = Yup.object({
    email: Yup.string().email('invalid email').required('email is required'),
    password: Yup.string().required('password is required'),
  });

  const onSubmit = (values: LoginFormValues) => {
    handleLogin(values.email, values.password);
  };

  return (
    <AuthLayout>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {() => (
          <Form style={{ width: '100%' }}>
            <VStack gap={4} w={{ base: 'full', md: '500px' }}>
              <FormField name="email">
                {({ field }: { field: any }) => (
                  <Field.Root width="full">
                    <Field.Label color="white">
                      <b>email</b>
                    </Field.Label>
                    <Input
                      {...field}
                      placeholder="enter email"
                      border="transparent"
                      borderBottom="2px solid white"
                      borderRadius="0"
                      color="whiteAlpha.900"
                      _focus={{
                        boxShadow: 'none',
                        outline: 'none',
                        borderBottom: '2px solid white',
                      }}
                      _placeholder={{
                        color: 'whiteAlpha.400',
                      }}
                    />
                    <ErrorMessage name="email">
                      {(msg) => (
                        <Text color="#820707" fontSize="xs">
                          {msg}
                        </Text>
                      )}
                    </ErrorMessage>
                  </Field.Root>
                )}
              </FormField>

              <FormField name="password">
                {({ field }: { field: any }) => (
                  <Field.Root width="full">
                    <Field.Label color="white">
                      <b>password</b>
                    </Field.Label>
                    <Input
                      {...field}
                      type="password"
                      placeholder="enter password"
                      border="transparent"
                      borderBottom="2px solid white"
                      borderRadius="0"
                      color="whiteAlpha.900"
                      _focus={{
                        boxShadow: 'none',
                        outline: 'none',
                        borderBottom: '2px solid white',
                      }}
                      _placeholder={{
                        color: 'whiteAlpha.400',
                      }}
                    />
                    <ErrorMessage name="password">
                      {(msg) => (
                        <Text color="#820707" fontSize="xs">
                          {msg}
                        </Text>
                      )}
                    </ErrorMessage>
                  </Field.Root>
                )}
              </FormField>

              <Button type="submit" rounded="2xl" w={{ base: 'full', md: 'auto' }} mt={5}>
                log in
              </Button>
              <Link href={ROUTES.SIGNUP} fontSize="sm">
                create an account!
              </Link>
            </VStack>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default LoginPage;
