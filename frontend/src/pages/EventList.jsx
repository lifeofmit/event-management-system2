import React, { useEffect, useState, useContext } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Button, Box, Chip 
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Download } from '@mui/icons-material';

const EventList = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await API.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

//   const handleDownloadReport = (fileUrl) => {
//     window.open(`http://localhost:5000${fileUrl}`, '_blank');
//   };

const handleExport = async (format) => {
    try {
      const response = await API.exportEvents(format, {}); // Pass filters here if needed
      
      // Create a blob URL to trigger the download in the browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set correct file extension
      let extension = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `Event_Report.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
      alert('Export failed or unauthorized');
    }
  };

  if (loading) return <Typography>Loading events...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Event Directory</Typography>
        
        {/* Only show export buttons for Admins and Super Admins */}
        {['SUPER_ADMIN', 'ADMIN'].includes(user?.role) && (
          <Box>
            <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }} onClick={() => handleExport('csv')}>CSV</Button>
            <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }} color="success" onClick={() => handleExport('excel')}>Excel</Button>
            <Button variant="outlined" startIcon={<Download />} color="error" onClick={() => handleExport('pdf')}>PDF</Button>
          </Box>
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Event Name</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Coordinator</strong></TableCell>
              <TableCell><strong>Report Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No events found.</TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event._id} hover>
                  <TableCell>{event.eventName}</TableCell>
                  <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                  <TableCell>{event.eventType?.name || 'N/A'}</TableCell>
                  <TableCell>{event.coordinatorId?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {event.eventReport ? (
                      <Chip label="Uploaded" color="success" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" sx={{ mr: 1 }}>View</Button>
                    {event.eventReport && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="secondary"
                        onClick={() => handleDownloadReport(event.eventReport.fileUrl)}
                      >
                        Report
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EventList;