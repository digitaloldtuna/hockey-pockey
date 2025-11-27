import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Field, Input, Link, Text, VStack } from '@chakra-ui/react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';
import { ErrorMessage, Field as FormField, Form, Formik } from 'formik';
import * as Yup from 'yup';

interface ProfileFormValues {
  email: string;
  name: string;
  password: string;
}

const initialValues = {
  name: '',
  email: '',
  password: '',
};

const SignupPage = () => {
  useTitle('Sign Up');
  const { handleSignup } = useAuthentication();

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
  });

  const onSubmit = (values: ProfileFormValues) => {
    const { email, password, name } = values;
    handleSignup(email, password, name);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ values, errors }) => (
        <Form>
          <AbsoluteCenter>
            <Box p="10" borderRadius={'2xl'} backgroundColor="whiteAlpha.500">
              <VStack>
                <Text fontSize="5xl" lineHeight="0.75" fontWeight="bold" marginBottom="3">
                  hockey
                  <br />
                  pockey
                </Text>
                <FormField name="name">
                  {({ field }: { field: any }) => (
                    <Field.Root>
                      <Field.Label>Name</Field.Label>
                      <Input {...field} backgroundColor="white" />
                      <ErrorMessage name="name" component="div" />
                    </Field.Root>
                  )}
                </FormField>
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
                <Button type="submit">Sign Up</Button>
                <Link href={ROUTES.LOGIN}>Already have an account? Log in!</Link>
              </VStack>
            </Box>
          </AbsoluteCenter>
        </Form>
      )}
    </Formik>
  );
};

export default SignupPage;
