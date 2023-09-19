import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { setList } from '@/stores/projects';
import useInfinityScroll from '@/hooks/useInfiniteScroll';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import { projectsSelector } from '@/stores/projects/selector';
import { isLoginSelector } from '@/stores/auth';
import { PostType } from '@/types';
import { getChannelPosts, getPost } from '@/api/posts';
import { inputSelector } from '@/stores/layout';
import { searchAll } from '@/api/search';
import CHANNEL_ID from '@/consts/channels';
export interface ProjectType {
  _id: string;
  image?: string;
  name: string;
  projectTitle: string;
}

// TODO JSON.parse 에러처리, 무한스크롤 최적화, 검색 후 무한 스크롤, 검색 속도가 너무 느리다 , 갯수재한 ?
const useProjectList = () => {
  const navigate = useNavigate();
  const isLogin = useAppSelector(isLoginSelector);
  const target = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const list = useAppSelector(projectsSelector);
  const headerSearchValue = useAppSelector(inputSelector);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { page } = useInfinityScroll({
    target,
    endPoint: 4,
    options: { threshold: 0.5 },
    list,
  });

  const handleFabClick = () => {
    navigate('/projects/write');
  };

  useEffect(() => {
    const searchProjects = async (value: string) => {
      const searchResult = await searchAll(value).then((result: unknown) =>
        parseSearchResult(result as Post[]),
      );
      dispatch(setList(searchResult));
      setIsLoading(false);
    };

    const value = headerSearchValue.trim();
    if (value.length < 1) return;
    setIsLoading(true);
    const encoded = encodeURIComponent(value);
    console.log(value);
    searchProjects(encoded);
  }, [headerSearchValue, dispatch]);

  useEffect(() => {
    // 두번호출떄문에 새로 업데이트
    getChannelPosts(CHANNEL_ID.PROJECT, { offset: 0, limit: page * 5 + 5 })
      .then((list) => parseProjectList(list))
      .then((projects) => {
        dispatch(setList(projects));
      });
  }, [page, dispatch]);

  return {
    handleFabClick,
    projects: list,
    isLogin,
    target,
    isLoading,
  };
};

export default useProjectList;

interface Post {
  channel: string;
  _id: string;
}
const parseProject = (project: PostType) => {
  const {
    _id,
    image,
    author: { fullName },
    title: content,
  } = project;
  const { title } = JSON.parse(content);
  return { _id, name: fullName, projectTitle: title, image };
};

const parseProjectList = (list: PostType[]) => {
  return list.map(parseProject);
};

const parseSearchResult = async (result: Post[]) => {
  const filtered = result
    .filter((item) => item.channel === CHANNEL_ID.PROJECT)
    .map((item) => getPost(item._id));
  const projectList = await Promise.all(filtered).then((res) =>
    res.map(parseProject),
  );
  return projectList;
};
