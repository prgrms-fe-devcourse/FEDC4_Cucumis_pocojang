import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { setPost } from '@/stores/projectDetail';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setUser, userIdSelector, isLoginSelector } from '@/stores/auth';
import { projectDetailSelector } from '@/stores/projectDetail/selector';
import type { PostType, FormattedPost, DeveloperContent } from '@/types';
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const userId = useAppSelector(userIdSelector);
  const userFollowing = useAppSelector(userFollowingSelector);
  const isLoggedIn = useAppSelector(isLoginSelector);

  const { developerId } = useParams();
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
      const res = await deletePost({ id: developerId });

      res && navigate(DEVELOPER_URL, { replace: true });
    }
  };

  const handleFollowClick = useCallback(async () => {
    try {
      if (pageState.isUserFollowing) {
        const followerIDList = post.author.followers;
        if (followerIDList) {
          const followId = userFollowing.find(({ _id }) =>
            followerIDList.includes(_id),
          );

          if (followId) {
            await unFollowUser({ id: followId._id });
          }
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

      const newUserInfo = await getUser(userId);

      dispatch(setUser(newUserInfo));
    } catch (error) {
      console.log(error);
    }

    navigate(0);
  }, [
    pageState.isUserFollowing,
    navigate,
    post.author._id,
    dispatch,
    post.author.followers,
    userFollowing,
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
    if (post.author.followers) {
      const followerID = post.author.followers;
      const isFollowedByUser = userFollowing.some(({ _id }) =>
        followerID.includes(_id),
      );
      setPageState((prev) => ({ ...prev, isUserFollowing: isFollowedByUser }));
    }
  }, [post, userFollowing, userId]);

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

export default useDeveloperDetail;
