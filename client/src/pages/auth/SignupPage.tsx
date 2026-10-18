import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import AuthLayout from './AuthLayout';
import AuthField, { SubmitButton } from './AuthField';

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
    <AuthLayout mode="signup">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {() => (
          <Form style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AuthField
              name="name"
              label="Display name"
              type="text"
              placeholder="What your friends call you"
              autoComplete="nickname"
            />
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <SubmitButton>Create account</SubmitButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default SignupPage;
