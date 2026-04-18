import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="layout">
      <header className="header">
        <h1 className="logo">Trackr</h1>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <nav className="nav">
        <a href="/" className="nav-link">
          <i className="icon">🏠</i>
          <span>Home</span>
        </a>
        <a href="/sports" className="nav-link">
          <i className="icon">🏀</i>
          <span>Sports</span>
        </a>
        <a href="/markets" className="nav-link">
          <i className="icon">📈</i>
          <span>Markets</span>
        </a>
        <a href="/news" className="nav-link">
          <i className="icon">📰</i>
          <span>News</span>
        </a>
        <a href="/andy" className="nav-link">
          <i className="icon">🤖</i>
          <span>Andy</span>
        </a>
      </nav>
    </div>
  );
};

export default Layout;