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
  const [date, setDate] = useState(new Date());
  const [refresh, setRefresh] = useState(false);

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
    const intervalId = setInterval(() => {
      setDate(new Date());
      setRefresh(!refresh);
    }, 1000);
    fetchPortfolios();
    fetchNews();
    fetchTopMovers();
    fetchFearAndGreed();
    setLoading(false);
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchPortfolios();
    fetchNews();
    fetchTopMovers();
    fetchFearAndGreed();
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Header date={date} refresh={refresh} onRefresh={handleRefresh} />
      <div className="mt-4">
        <HeroCard portfolios={portfolios} />
        <div className="flex justify-between mb-4">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <TopMovers topMovers={topMovers} />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3">
            <FearAndGreed fearAndGreed={fearAndGreed} />
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <NewsFeed news={news} />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3">
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;