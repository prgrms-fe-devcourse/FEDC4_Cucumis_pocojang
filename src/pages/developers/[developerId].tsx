import styled from '@emotion/styled';
import { Box, Divider, Stack, Typography } from '@mui/material';

import BasicAvatar from '@/components/shared/avatar';
import BasicChip from '@/components/shared/chip';
import ChipGroup from '@/components/shared/chipGroup';
import { PROFILE_URL, PROJECT_MODIFYL_URL, DM_URL } from '@/consts/routes';
import BasicButton from '@/components/shared/button';
import useDeveloperDetails from '@/pages/developers/useDeveloperDetails';
import Comments from '@/components/comments';

export default function DeveloperDetail() {
  const {
    developerId,
    author,
    image,
    _id,
    title,
    comments,
    technicalSkill,
    position,
    contents,
    onClick,
    isAuthor,
  } = useDeveloperDetails();

  return (
    <Stack spacing={3}>
      <Box>
        <ProjectImageStyled
          component="img"
          src={image}
          alt={title + "'s project image"}
        />
        <StackStyled direction="column" alignItems="center">
          <BasicAvatar
            {...author}
            size={90}
            onClick={() => onClick(PROFILE_URL, _id)}
          />
          <Typography noWrap>{author.fullName}</Typography>
        </StackStyled>
      </Box>
      {isAuthor ? (
        <ChipBoxStyled>
          <BasicChip
            size="small"
            label="수정하기"
            variant="outlined"
            onClick={() => onClick(PROJECT_MODIFYL_URL, developerId as string)}
          />
        </ChipBoxStyled>
      ) : (
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <BasicButton variant="outlined">팔로우</BasicButton>
          <BasicButton
            variant="outlined"
            onClick={() => onClick(DM_URL, developerId as string)}
          >
            DM
          </BasicButton>
        </Stack>
      )}
      <Typography variant="h4">
        {title}
        <BasicChipStyled label={position} color="secondary" />
      </Typography>
      <ChipGroup>
        {technicalSkill.map((skill: string, i: number) => (
          <BasicChip label={skill} key={i} />
        ))}
      </ChipGroup>
      <Box>
        <Typography color="gray">자기소개</Typography>
        <Typography>{contents}</Typography>
      </Box>
      <Divider variant="middle" />
      <Box>
        <Typography color="gray">댓글</Typography>
        <Comments comments={comments} onClick={onClick} url={PROFILE_URL} />
      </Box>
    </Stack>
  );
}

const ProjectImageStyled = styled(Box)({
  width: '100%',
  height: '30vh',
  objectFit: 'cover',
}) as typeof Box;

const StackStyled = styled(Stack)({
  marginTop: '-5vh',
});

const ChipBoxStyled = styled(Box)({
  textAlign: 'center',
});

const BasicChipStyled = styled(BasicChip)({
  margin: '0 8px',
});
