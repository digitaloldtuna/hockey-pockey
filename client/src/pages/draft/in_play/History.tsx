import { Box, Flex, Grid } from '@chakra-ui/react';
import { useState } from 'react';
import { FilterChip, PageHeader, StatTile, Surface } from '../../../components/ui';
import { Game } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { getResult, Result } from '../../../utils';
import HistoryList from './HistoryList';

type Filter = 'mine' | 'win' | 'loss' | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'mine', label: 'Your games' },
  { key: 'win', label: 'Wins' },
  { key: 'loss', label: 'Losses' },
  { key: 'all', label: 'All games' },
];

const History = () => {
  const [filter, setFilter] = useState<Filter>('mine');
  const { profile } = useAuthentication();
  const { draft, history } = useDraft();
  if (!draft) {
    return <></>;
  }

  const resultOf = (game: Game): Result => getResult(game, profile?.id);

  const all = history?.flatMap(([, games]) => games) ?? [];
  const wins = all.filter((g) => resultOf(g) === 'win').length;
  const losses = all.filter((g) => resultOf(g) === 'loss').length;
  const counted = wins + losses;
  const winRate = counted === 0 ? '-' : `${Math.round((wins / counted) * 100)}%`;

  const matches = (game: Game) => {
    const result = resultOf(game);
    if (filter === 'all') return true;
    if (filter === 'mine') return result !== 'none';
    return result === filter;
  };

  const shown =
    history
      ?.map(([day, games]) => [day, games.filter(matches)] as [string, Game[]])
      .filter(([, games]) => games.length > 0) ?? null;

  return (
    <>
      <PageHeader title="History" note="Past games with your teams" />

      <Grid templateColumns="repeat(auto-fit, minmax(min(150px, 100%), 1fr))" gap="3">
        <StatTile label="Wins" value={wins} bg="ownerSage" />
        <StatTile label="Losses" value={losses} bg="loss" delay="0.06s" />
        <StatTile label="Win rate" value={winRate} bg="ownerSky" delay="0.12s" />
        <StatTile label="Games" value={counted} bg="ownerSun" delay="0.18s" />
      </Grid>

      <Flex role="group" aria-label="Filter by result" wrap="wrap" gap="2">
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          />
        ))}
      </Flex>

      <Surface as="section" aria-label="Past games">
        <Box>
          <HistoryList history={history === null ? null : shown} />
        </Box>
      </Surface>
    </>
  );
};

export default History;
