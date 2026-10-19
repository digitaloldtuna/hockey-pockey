import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import AuthField, { SubmitButton } from './AuthField';

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
    <>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {() => (
          <Form style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AuthField
              name="email"
              label="Email"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
            />
            <AuthField
              name="password"
              label="Password"
              type="password"
              placeholder="enter password"
              autoComplete="current-password"
            />
            <SubmitButton>Log in</SubmitButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default LoginPage;
