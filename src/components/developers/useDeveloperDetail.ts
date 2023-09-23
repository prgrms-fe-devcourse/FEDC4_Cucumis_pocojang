import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { setPost } from '@/stores/projectDetail';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setUser, userIdSelector, isLoginSelector } from '@/stores/auth';
import { projectDetailSelector } from '@/stores/projectDetail/selector';
import type {
  PostType,
  FormattedPost,
  DeveloperContent,
  FollowType,
} from '@/types';
import { getPost, deletePost } from '@/api/posts';
import { getUser } from '@/api/user';
import { followUser, unFollowUser } from '@/api/follow';
import { sendNotification } from '@/api/notifications';
import {
  DEVELOPER_URL,
  DM_URL,
  PROFILE_URL,
  SETTINGS_URL,
} from '@/consts/routes';
import { userFollowingSelector } from '@/stores/auth/selector';

const useDeveloperDetail = () => {
  const { developerId } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const userId = useAppSelector(userIdSelector);
  const userFollowingList = useAppSelector(userFollowingSelector);
  const isLoggedIn = useAppSelector(isLoginSelector);
  const { post } = useAppSelector(projectDetailSelector<DeveloperContent>);

  const [pageState, setPageState] = useState({
    isUserFollowing: false,
    isLoading: true,
  });

  const handleAvatarClick = () => {
    navigate(PROFILE_URL + developerId);
  };

  const handleSettingClick = () => {
    navigate(SETTINGS_URL);
  };

  const handleDMClick = () => {
    navigate(DM_URL + developerId);
  };

  const handleDeleteClick = async () => {
    const isAbleToDelete = confirm('정말로 삭제하시겠습니까?');

    if (isAbleToDelete && developerId) {
      try {
        const res = await deletePost({ id: developerId });

        res && navigate(DEVELOPER_URL, { replace: true });
      } catch (error) {
        window.alert('포스트 삭제에 실패하였습니다');
      }
    }
  };

  const handleFollowClick = useCallback(async () => {
    setPageState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (pageState.isUserFollowing) {
        const followerIDList = post.author.followers;

        if (followerIDList) {
          const followId = userFollowingList.find(({ _id }) =>
            followerIDList.includes(_id),
          );

          followId && (await unFollowUser({ id: followId._id }));
        }
      } else {
        if (post.author._id) {
          const res = await followUser({ userId: post.author._id });

          await sendNotification({
            notificationType: 'FOLLOW',
            notificationTypeId: res._id,
            userId: post.author._id,
          });
        }
      }
    } catch (error) {
      window.alert('팔로우 처리에 실패하였습니다');

      setPageState((prev) => ({ ...prev, isLoading: false }));
    } finally {
      try {
        const newUserInfo = await getUser(userId);

        dispatch(setUser(newUserInfo));
      } catch (error) {
        setPageState((prev) => ({ ...prev, isLoading: false }));
      } finally {
        navigate(0);
      }
    }
  }, [
    pageState.isUserFollowing,
    post.author._id,
    dispatch,
    navigate,
    post.author.followers,
    userFollowingList,
    userId,
  ]);

  const fetchPost = useCallback(
    async (postId: string) => {
      try {
        const rs = await getPost(postId);

        const formattedPost = handlePostFormat(rs);

        dispatch(setPost(formattedPost));
      } catch (error) {
        console.log(error);
      } finally {
        setPageState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    developerId && fetchPost(developerId);
  }, [developerId, fetchPost]);

  useEffect(() => {
    const isFollowedByUser = getIsFollowedByUser(post, userFollowingList);

    setPageState((prev) => ({ ...prev, isUserFollowing: isFollowedByUser }));
  }, [post, userFollowingList, userId]);

  return {
    developerId,
    handleSettingClick,
    handleDMClick,
    handleAvatarClick,
    handleDeleteClick,
    handleFollowClick,
    isAuthor: post.author._id === userId,
    ...pageState,
    isLoggedIn,
    ...post,
  };
};

const handlePostFormat = (rs: PostType) => {
  const { author, comments, _id, image, createdAt } = rs;
  const { oneLiner, techStack, position, details } = JSON.parse(rs.title);

  const formattedComments = comments.map(({ _id, comment, author }) => ({
    AvatarProps: {
      imgSrc: author.image,
    },
    author: author.fullName,
    comment,
    userId: author._id,
    commentId: _id,
  }));

  const formattedPost: Partial<FormattedPost<DeveloperContent>> = {
    postId: _id,
    comments: formattedComments,
    image: image,
    author,
    createdAt,
    contents: {
      oneLiner,
      techStack,
      position,
      details,
    },
  };
  return formattedPost;
};

const getIsFollowedByUser = (
  post: FormattedPost<DeveloperContent>,
  userFollowingList: FollowType[],
) => {
  if (post.author.followers) {
    const authorFollowerIDList = post.author.followers;

    const isFollowedByUser = userFollowingList.some(({ _id }) =>
      authorFollowerIDList.includes(_id),
    );
    return isFollowedByUser;
  }
  return false;
};

export default useDeveloperDetail;
