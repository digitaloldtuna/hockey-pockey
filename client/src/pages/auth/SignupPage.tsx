import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Field, Input, Link, Text, VStack } from '@chakra-ui/react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';
import { ErrorMessage, Field as FormField, Form, Formik } from 'formik';
import * as Yup from 'yup';
import AuthLayout from './AuthLayout';

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
    name: Yup.string().required('name is required'),
    email: Yup.string().email('invalid email').required('email is required'),
    password: Yup.string()
      .required('password is required')
      .min(8, 'password must be at least 8 characters'),
  });

  const onSubmit = (values: ProfileFormValues) => {
    const { email, password, name } = values;
    handleSignup(email, password, name);
  };

  return (
    <AuthLayout>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onSubmit(values);
        }}
      >
        {({ values, errors }) => (
          <Form style={{ width: '100%' }}>
            <VStack gap={4} w={{ base: 'full', md: '500px' }}>
              <FormField name="name">
                {({ field }: { field: any }) => (
                  <Field.Root>
                    <Field.Label color="white">
                      <b>name</b>
                    </Field.Label>
                    <Input
                      {...field}
                      placeholder="enter name"
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
                    <ErrorMessage name="name">
                      {(msg) => (
                        <Text color="#820707" fontSize="xs">
                          {msg}
                        </Text>
                      )}
                    </ErrorMessage>
                  </Field.Root>
                )}
              </FormField>
              <FormField name="email">
                {({ field }: { field: any }) => (
                  <Field.Root>
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
                  <Field.Root>
                    <Field.Label color="white">
                      <b>password</b>
                    </Field.Label>
                    <Input
                      {...field}
                      placeholder="enter password"
                      type="password"
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
                sign up
              </Button>
              <Link href={ROUTES.LOGIN} fontSize="sm">
                already have an account? log in!
              </Link>
            </VStack>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default SignupPage;
