import { Link } from 'react-router-dom';

// import React from 'react'

export default function Nav() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/projects">프로젝트</Link>
        </li>
        <li>
          <Link to="/developers">개발자</Link>
        </li>
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/dm">DM</Link>
        </li>
        <li>
          <Link to="/profiles">프로필</Link>
        </li>
      </ul>
    </nav>
  );
}
