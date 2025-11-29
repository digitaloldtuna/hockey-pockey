import { useState } from 'react';
import {
  Button,
  Input,
  VStack,
  Fieldset,
  Field,
  FileUpload,
  Avatar,
  Tag,
  Flex,
} from '@chakra-ui/react';
import { Formik, Form, Field as FormField } from 'formik';

import { useAuthentication } from '../hooks/useAuthentication';
import { Upload } from 'lucide-react';
import api from '../api';

interface ProfileFormValues {
  name: string;
  email: string;
  profileImage: File | null;
}

const Profile = () => {
  const { profile, handleLogout } = useAuthentication();
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.profileImage || null);

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

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);

      // Only append the file if the user selected one
      if (values.profileImage) {
        formData.append('profileImage', values.profileImage);
      }

      const response = await api.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('UPDATE PROFILE RESPONSE', response.data);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ setFieldValue, values }) => (
        <Form>
          <VStack rounded="2xl" backgroundColor="white" padding="8" gap="5">
            {/* Profile Image */}
            <Fieldset.Root>
              <Field.Root align="center">
                <VStack gap="4" justify="center" w="full">
                  <Avatar.Root
                    width="100px"
                    height="100px"
                    name={values.name}
                    src={previewUrl || undefined}
                  >
                    <Avatar.Fallback name={profile?.name || ''} />
                    <Avatar.Image src={previewUrl || undefined} />
                  </Avatar.Root>
                  <Flex justify="center" direction="column" align="center" gap={2}>
                    {previewUrl && (
                      <Tag.Root size="sm" colorPalette={'red'}>
                        <Tag.Label>your image is publically accessible</Tag.Label>
                      </Tag.Root>
                    )}
                    <FileUpload.Root
                      maxFiles={1}
                      accept={{ 'image/*': [] }}
                      onFileAccept={(details: { files: File[] }) =>
                        handleFileChange(details.files, setFieldValue)
                      }
                    >
                      <FileUpload.HiddenInput />
                      <FileUpload.Trigger asChild>
                        <Button variant="outline" size="sm" w="full">
                          <Upload /> Upload file
                        </Button>
                      </FileUpload.Trigger>
                    </FileUpload.Root>
                  </Flex>
                </VStack>
              </Field.Root>
            </Fieldset.Root>

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
            <VStack gap="5">
              <Button colorScheme="blue" type="submit" alignSelf="center" rounded="2xl">
                Save Changes
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                alignSelf="center"
                rounded="2xl"
                onClick={handleLogout}
                variant="outline"
              >
                Log Out
              </Button>
            </VStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default Profile;
