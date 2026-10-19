import { useState } from 'react';
import { Button, Input, VStack, Field, FileUpload, Avatar, Text, Flex } from '@chakra-ui/react';
import { Formik, Form, Field as FormField } from 'formik';

import { useAuthentication } from '../hooks/useAuthentication';
import { Upload } from 'lucide-react';
import api from '../api';
import ColourPicker from './ColourPicker';

interface ProfileFormValues {
  name: string;
  email: string;
  profileImage: File | null;
  colour: string;
}

const Profile = () => {
  const { profile } = useAuthentication();
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.profileImage || null);

  const initialValues = profile
    ? {
        name: profile.name,
        email: profile.email || '',
        profileImage: null,
        colour: profile.colour || '',
      }
    : {
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImage: null,
        colour: '',
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
      // the colour you appear in on leaderboards and charts
      if (values.colour) formData.append('colour', values.colour);

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

  const inputStyle = {
    size: 'sm' as const,
    bg: 'sidebarRaised',
    color: 'sidebarText',
    border: '1px solid #5E7189',
    rounded: '10px',
    fontSize: '12px',
    _placeholder: { color: 'sidebarMuted' },
    _disabled: { opacity: 0.6 },
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ setFieldValue, values }) => (
        <Form>
          <VStack align="stretch" gap="2">
            <Text
              px="10px"
              fontWeight="bold"
              fontSize="10px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="#A9BCD2"
            >
              Profile
            </Text>

            <Flex align="center" gap="3">
              <Avatar.Root
                size="lg"
                flex="none"
                border="1px solid #5E7189"
                name={values.name}
                src={previewUrl || undefined}
              >
                <Avatar.Fallback name={profile?.name || ''} />
                <Avatar.Image src={previewUrl || undefined} />
              </Avatar.Root>
              <FileUpload.Root
                maxFiles={1}
                accept={{ 'image/*': [] }}
                onFileAccept={(details: { files: File[] }) =>
                  handleFileChange(details.files, setFieldValue)
                }
              >
                <FileUpload.HiddenInput />
                <FileUpload.Trigger asChild>
                  <Button variant="outline" size="xs" rounded="10px" color="sidebarText">
                    <Upload size={14} /> Change photo
                  </Button>
                </FileUpload.Trigger>
              </FileUpload.Root>
            </Flex>
            {previewUrl && (
              <Text fontSize="10px" color="sidebarMuted">
                Your image is publicly accessible.
              </Text>
            )}

            <FormField name="name">
              {({ field }: { field: any }) => (
                <Field.Root>
                  <Field.Label fontSize="11px" color="sidebarMuted">
                    Name
                  </Field.Label>
                  <Input {...field} placeholder="Your name" {...inputStyle} />
                </Field.Root>
              )}
            </FormField>

            <FormField name="email">
              {({ field }: { field: any }) => (
                <Field.Root>
                  <Field.Label fontSize="11px" color="sidebarMuted">
                    Email
                  </Field.Label>
                  <Input {...field} disabled {...inputStyle} />
                </Field.Root>
              )}
            </FormField>

            <Field.Root>
              <Field.Label fontSize="11px" color="sidebarMuted">
                Your colour
              </Field.Label>
              <ColourPicker
                value={values.colour}
                onChange={(colour) => setFieldValue('colour', colour)}
              />
            </Field.Root>

            <Button
              type="submit"
              size="sm"
              rounded="10px"
              bg="mist"
              color="ink"
              border="1px solid #5E7189"
              _hover={{ bg: '#D5DEE7' }}
            >
              Save changes
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default Profile;
