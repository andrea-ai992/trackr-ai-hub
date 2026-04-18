import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lucide } from 'lucide-react';
import { supabase } from '../supabase';
import { getPortfolios, getNews, getTopMovers, getFearAndGreed } from '../api';
import Header from './Header';
import HeroCard from './HeroCard';
import TopMovers from './TopMovers';
import FearAndGreed from './FearAndGreed';
import NewsFeed from './NewsFeed';
import QuickActions from './QuickActions';

const Dashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [news, setNews] = useState([]);
  const [topMovers, setTopMovers] = useState([]);
  const [fearAndGreed, setFearAndGreed] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      const { data, error } = await getPortfolios();
      if (error) {
        console.error(error);
      } else {
        setPortfolios(data);
      }
    };
    const fetchNews = async () => {
      const { data, error } = await getNews();
      if (error) {
        console.error(error);
      } else {
        setNews(data);
      }
    };
    const fetchTopMovers = async () => {
      const { data, error } = await getTopMovers();
      if (error) {
        console.error(error);
      } else {
        setTopMovers(data);
      }
    };
    const fetchFearAndGreed = async () => {
      const { data, error } = await getFearAndGreed();
      if (error) {
        console.error(error);
      } else {
        setFearAndGreed(data);
      }
    };
    fetchPortfolios();
    fetchNews();
    fetchTopMovers();
    fetchFearAndGreed();
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Header />
      <div className="mt-4">
        <HeroCard portfolios={portfolios} />
        <TopMovers topMovers={topMovers} />
        <FearAndGreed fearAndGreed={fearAndGreed} />
        <NewsFeed news={news} />
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;