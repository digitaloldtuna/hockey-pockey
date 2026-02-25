import { Flex, Heading, ScrollArea, Switch } from '@chakra-ui/react';
import { Scroll } from 'lucide-react';
import { useId, useState } from 'react';
import { Game } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { Tooltip } from '../../../theme/tooltip';
import HistoryList from './HistoryList';

const History = () => {
  const [filtered, setFiltered] = useState<Boolean>(true);
  const id = useId();

  const { profile } = useAuthentication();
  const { draft, history } = useDraft();
  if (!draft) {
    return <></>;
  }

  const filteredHistory =
    (filtered
      ? history
          ?.map((historyEntry) => {
            const day = historyEntry[0];
            const games = historyEntry[1];
            return [
              day,
              games.filter(
                (game) =>
                  game.homeMember &&
                  game.visitingMember &&
                  profile &&
                  (game.homeMember.id === profile.id || game.visitingMember.id === profile.id)
              ),
            ] as [string, Game[]];
          })
          .filter((day) => day[1].length > 0)
      : history) || null;

  return (
    <Flex
      rounded="2xl"
      backgroundColor="whiteAlpha.500"
      padding={{ base: '3', md: '8' }}
      direction="column"
    >
      <Flex
        align="center"
        direction="horizontal"
        justify="space-between"
        marginBottom={{ base: '2', md: '5' }}
      >
        <Heading size={{ base: 'lg', md: '2xl' }} color="oxford" fontWeight="bold">
          {filtered ? 'Your Games' : 'All Games'}
        </Heading>
        <Tooltip ids={{ trigger: id }} content="">
          <Switch.Root
            ids={{ root: id }}
            checked={filtered}
            onCheckedChange={(e: { checked: boolean }) => setFiltered(e.checked)}
            size={{ base: 'xs', md: 'md' }}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label size="xs">your games</Switch.Label>
          </Switch.Root>
        </Tooltip>
      </Flex>
      <ScrollArea.Root height="30rem" variant="hover">
        <ScrollArea.Viewport>
          <ScrollArea.Content>
            <HistoryList history={filteredHistory} />
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </Flex>
  );
};

export default History;
