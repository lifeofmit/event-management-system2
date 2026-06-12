import React, { useEffect, useState, useContext } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Event, CheckCircle, PendingActions } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, withReports: 0, pending: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await API.getEvents();
        const events = res.data;
        
        setStats({
          total: events.length,
          withReports: events.filter(e => e.eventReport).length,
          pending: events.filter(e => !e.eventReport).length
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    };
    loadStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderLeft: `5px solid ${color}`, height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box sx={{ color: color }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Role: {user?.role.replace('_', ' ')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Total Events" 
            value={stats.total} 
            icon={<Event fontSize="large" />} 
            color="#1976d2" 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Reports Uploaded" 
            value={stats.withReports} 
            icon={<CheckCircle fontSize="large" />} 
            color="#2e7d32" 
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Pending Reports" 
            value={stats.pending} 
            icon={<PendingActions fontSize="large" />} 
            color="#ed6c02" 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;