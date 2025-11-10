import { ChangeEvent, useState } from 'react';
import {
  Button,
  Input,
  VStack,
  HStack,
  Fieldset,
  Field,
  Box,
  Flex,
  Grid,
  FileUpload,
  Avatar,
} from '@chakra-ui/react';
import { Formik, Form, Field as FormField } from 'formik';

import { useAuthentication } from '../hooks/useAuthentication';
import { useTitle } from '../hooks/useTitle';
import FormPageLayout from './draft/DraftLayout';
import { Upload } from 'lucide-react';
import api from '../api';

// 🧱 Define the form’s shape
interface ProfileFormValues {
  name: string;
  email: string;
  profileImage: File | null;
}

const Profile = () => {
  useTitle('Profile');
  const { profile } = useAuthentication();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initialValues = profile
    ? {
        name: profile.name,
        email: profile.email || '',
        profileImage: null,
      }
    : {
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImage: null,
      };

  const handleFileChange = (
    files: File[],
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    const file = files[0];
    if (file) {
      setFieldValue('profileImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ProfileFormValues) => {
    console.log('Updated profile:', values);
    try {
      api.post('/profile/update', { profile: values }).then((res) => {
        console.log('UPDATE PROFILE RESPONSE', res);
        window.location.reload();
      });
    } catch (error) {
      console.log();
    }
  };

  return (
    <FormPageLayout title="Profile">
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {({ setFieldValue, values, isSubmitting }) => (
          <Form>
            <VStack gap="5">
              <Grid templateColumns="repeat(2, 1fr)" gap="6" width="stretch">
                <HStack rounded="2xl" backgroundColor="white" padding="5" gap="5">
                  {/* Profile Image */}
                  <Fieldset.Root>
                    <Field.Root>
                      <Field.Label>Profile Image</Field.Label>
                      <VStack gap="4" align="center">
                        <Avatar.Root
                          width="100px"
                          height="100px"
                          name={values.name}
                          src={previewUrl || undefined}
                        >
                          <Avatar.Fallback name={profile?.name || ''} />
                          <Avatar.Image src={previewUrl || undefined} />
                        </Avatar.Root>
                        <Box>
                          <FileUpload.Root
                            maxFiles={1}
                            accept={{ 'image/*': [] }}
                            onFileAccept={(details: { files: File[] }) =>
                              handleFileChange(details.files, setFieldValue)
                            }
                          >
                            <FileUpload.HiddenInput />
                            <FileUpload.Trigger asChild>
                              <Button variant="outline" size="sm">
                                <Upload /> Upload file
                              </Button>
                            </FileUpload.Trigger>
                          </FileUpload.Root>
                        </Box>
                      </VStack>
                    </Field.Root>
                  </Fieldset.Root>
                </HStack>

                <VStack rounded="2xl" backgroundColor="white" padding="5" gap="5">
                  <FormField name="name">
                    {({ field }: { field: any }) => (
                      <Field.Root>
                        <Field.Label>Name</Field.Label>
                        <Input {...field} placeholder="Your Name" />
                      </Field.Root>
                    )}
                  </FormField>

                  <FormField name="email">
                    {({ field }: { field: any }) => (
                      <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input {...field} disabled />
                      </Field.Root>
                    )}
                  </FormField>
                </VStack>
              </Grid>

              <Button colorScheme="blue" type="submit" alignSelf="center">
                Save Changes
              </Button>
            </VStack>
          </Form>
        )}
      </Formik>
    </FormPageLayout>
  );
};

export default Profile;
