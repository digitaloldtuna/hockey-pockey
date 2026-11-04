import { Button, Flex, Text, VStack } from '@chakra-ui/react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const note = { fontSize: '11px', color: 'sidebarMuted', lineHeight: '1.4' } as const;

// the device's notification controls, shown in the sidebar under the profile form
const NotificationSettings = () => {
  const { status, busy, enable, disable, test } = usePushNotifications();

  if (status === 'loading') return null;

  return (
    <VStack align="stretch" gap="2" mt="3">
      <Text
        px="10px"
        fontWeight="bold"
        fontSize="10px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="#A9BCD2"
      >
        Notifications
      </Text>

      {status === 'unsupported' && (
        <Text {...note}>This browser can&apos;t receive notifications.</Text>
      )}

      {status === 'needs-install' && (
        <Text {...note}>
          To get notifications on iPhone, tap the Share button in Safari, choose Add to Home Screen,
          then open Hockey Pockey from your Home Screen and turn them on there.
        </Text>
      )}

      {status === 'blocked' && (
        <Text {...note}>
          Notifications are blocked for this site. Allow them in your browser or phone settings,
          then come back here.
        </Text>
      )}

      {status === 'off' && (
        <>
          <Text {...note}>Get a message when your teams win or lose.</Text>
          <Button
            size="sm"
            rounded="10px"
            bg="mist"
            color="ink"
            border="1px solid #5E7189"
            _hover={{ bg: '#D5DEE7' }}
            loading={busy}
            onClick={enable}
          >
            Turn on notifications
          </Button>
        </>
      )}

      {status === 'on' && (
        <>
          <Text {...note}>Notifications are on for this device.</Text>
          <Flex gap="2">
            <Button
              size="xs"
              flex="1"
              rounded="10px"
              variant="outline"
              color="sidebarText"
              loading={busy}
              onClick={test}
            >
              Send a test
            </Button>
            <Button
              size="xs"
              flex="1"
              rounded="10px"
              variant="outline"
              color="sidebarText"
              loading={busy}
              onClick={disable}
            >
              Turn off
            </Button>
          </Flex>
        </>
      )}
    </VStack>
  );
};

export default NotificationSettings;
