import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { getPostId } from '@/api/posts/postId';
import { ProjectDetail } from '@/stores/projectDetail/slice';
import { setPost } from '@/stores/projectDetail';
import { useAppSelector } from '@/stores/hooks';
import { projectDetailSelector } from '@/stores/projectDetail/selector';
import type { PostType, UserType } from '@/types';
import session from '@/utils/sessionStorage';
import SESSION_STORAGE from '@/consts/sessionStorage';

const CUCUMIS_POSTID = '6503ed37a14c752383b6a8c1';

const useProjectDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { projectId } = useParams();
  const { post } = useAppSelector(projectDetailSelector);

  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (url: string, id: string) => {
    navigate(url + id);
  };

  useEffect(() => {
    const user = session.getItem<UserType>(SESSION_STORAGE.USER);

    if (user) {
      const { _id } = user;
      setUserId(_id);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const fetchPost = async (postId: string) => {
      try {
        const rs = await getPostId(postId);

        handlePost(rs);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    const handlePost = (rs: PostType) => {
      const { author, comments, _id, image, createdAt } = rs;
      const { title, requirements } = JSON.parse(rs.title);

      const formattedComments = comments.map(({ _id, comment, author }) => ({
        AvatarProps: {
          imgSrc: author.image,
        },
        author: author.fullName,
        comment,
        userId: author._id,
        commentId: _id,
      }));

      const formatedPost: Partial<ProjectDetail> = {
        postId: _id,
        comments: formattedComments,
        image: image,
        author: {
          image: author.image,
          userId: author._id,
          fullName: author.fullName,
        },
        createdAt,
        title,
        requirements,
      };

      dispatch(setPost(formatedPost));
    };

    if (projectId) {
      // fetchPost(projectId);
      fetchPost(CUCUMIS_POSTID);
    }
    // 예외처리 잘못된 요청
  }, [projectId, dispatch]);

  return {
    projectId,
    handleClick,
    isAuthor: post.author.userId === userId,
    isLoading,
    ...post,
  };
};

export default useProjectDetail;
