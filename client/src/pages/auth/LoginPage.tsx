import { useState } from 'react';
import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Field, Input, Link, Text, VStack } from '@chakra-ui/react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';
import * as Yup from 'yup';
import { ErrorMessage, Form, Formik, Field as FormField } from 'formik';

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
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const onSubmit = (values: LoginFormValues) => {
    handleLogin(values.email, values.password);
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({}) => (
        <Form>
          <AbsoluteCenter>
            <Box p="10" borderRadius={'2xl'} backgroundColor="whiteAlpha.500">
              <VStack>
                <Text fontSize="5xl" lineHeight="0.75" fontWeight="bold" marginBottom="3">
                  hockey
                  <br />
                  pockey
                </Text>
                <FormField name="email">
                  {({ field }: { field: any }) => (
                    <Field.Root>
                      <Field.Label>Email</Field.Label>
                      <Input {...field} backgroundColor="white" />
                      <ErrorMessage name="email" component="div" />
                    </Field.Root>
                  )}
                </FormField>
                <FormField name="password">
                  {({ field }: { field: any }) => (
                    <Field.Root>
                      <Field.Label>Password</Field.Label>
                      <Input {...field} type="password" backgroundColor="white" />
                      <ErrorMessage name="password" component="div" />
                    </Field.Root>
                  )}
                </FormField>
                <Button type="submit">Log In</Button>
                <Link href={ROUTES.SIGNUP}>create an account!</Link>
              </VStack>
            </Box>
          </AbsoluteCenter>
        </Form>
      )}
    </Formik>
  );
};

export default LoginPage;
