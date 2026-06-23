import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Grid, MenuItem, Paper } from '@mui/material';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const EventForm = () => {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState([]);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventType: '',
    objective: '',
    description: '',
    latitude: '',
    longitude: '',
  });
  
  const [files, setFiles] = useState({
    geoLocationPhotos: [],
    eventPhotos: [],
    eventReport: null
  });

  useEffect(() => {
    // Fetch Event Types for dropdown from Super Admin configuration
    API.getActiveEventTypes().then(res => setEventTypes(res.data)).catch(console.error);
  }, []);

 const handleChange = (e) => {
    // ACTIVE DATE VALIDATION
    if (e.target.name === 'eventDate') {
      const selectedDate = e.target.value;
      const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
      
      if (selectedDate > today) {
        alert("please select the correct past date.");
        // Clear the invalid date from the form
        setFormData({ ...formData, eventDate: '' });
        return; 
      }
    }

    // Standard handler for all other text fields
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === 'eventReport') {
      setFiles({ ...files, [name]: selectedFiles[0] });
    } else {
      setFiles({ ...files, [name]: Array.from(selectedFiles) });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NEW: Strict validation to ensure photos are uploaded
    if (files.geoLocationPhotos.length === 0) {
      return alert("Error: Geo Location Photos are required.");
    }
    if (files.eventPhotos.length === 0) {
      return alert("Error: Event Photos are required.");
    }

    const data = new FormData();
    
    // Append Text Data
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Append Files
    files.geoLocationPhotos.forEach(file => data.append('geoLocationPhotos', file));
    files.eventPhotos.forEach(file => data.append('eventPhotos', file));
    if (files.eventReport) data.append('eventReport', files.eventReport);

    try {
      await API.createEvent(data);
      alert('Event Submitted Successfully!');
      navigate('/events');
    } catch (error) {
      console.error(error);
      alert('Failed to submit event.');
    }
  };

  // Calculate today's date for the max attribute constraint
  const today = new Date().toISOString().split('T')[0];

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Submit New Event</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item size={{xs:12, md:4}}>
            <TextField required fullWidth label="Event Name" name="eventName" onChange={handleChange} />
          </Grid>
          {/* <Grid item size={{xs:12, md:4}}>
            <TextField required fullWidth type="date" label="Event Date" name="eventDate" InputLabelProps={{ shrink: true }} onChange={handleChange}  />
          </Grid> */}
          <Grid item  size={{xs:12, md:4}}>
            <TextField 
              required 
              fullWidth 
              type="date" 
              label="Event Date" 
              name="eventDate" 
              InputLabelProps={{ shrink: true }} 
              inputProps={{ max: today }} // <-- THIS DISABLES FUTURE DATES
              value={formData.eventDate} 
              onChange={handleChange} 
              sx={{
                "& input::-webkit-datetime-edit": {
                  color: formData.eventDate ? "inherit" : "transparent"
                },
                "& input:focus::-webkit-datetime-edit": {
                  color: "inherit"
                }
              }}
            />
          </Grid>
          <Grid item size={{xs:12, md:4}}>
            <TextField select required fullWidth label="Event Type" name="eventType" value={formData.eventType} onChange={handleChange}>
              {eventTypes.map((option) => (
                <MenuItem key={option._id} value={option._id}>{option.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item size={{xs:12, md:12}}>
            <TextField required fullWidth multiline rows={2} label="Objective" name="objective" onChange={handleChange} />
          </Grid>
          <Grid item size={{xs:12, md:12}}>
            <TextField fullWidth multiline rows={4} label="Description" name="description" onChange={handleChange} />
          </Grid>

          {/* Geolocation Section */}
          <Grid item size={{xs:12, md:4}}>
            <TextField fullWidth label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
          </Grid>
          <Grid item size={{xs:12, md:4}}>
            <TextField fullWidth label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
          </Grid>
          <Grid item size={{xs:12, md:4}} display="flex" alignItems="center">
            <Button variant="outlined" onClick={getLocation} fullWidth>Auto Detect Location</Button>
          </Grid>

          {/* File Uploads */}
          <Grid item size={{xs:12, md:4}}>
            <Button variant="contained" component="label" fullWidth>
              Geo Photos *
              <input type="file" hidden multiple name="geoLocationPhotos" accept="image/jpeg, image/png" onChange={handleFileChange} />
            </Button>
            <Typography variant="caption" color={files.geoLocationPhotos.length === 0 ? "error" : "textSecondary"}>
              {files.geoLocationPhotos.length} files selected (Required)
            </Typography>
          </Grid>
          
          <Grid item size={{xs:12, md:4}}>
            <Button variant="contained" component="label" fullWidth>
              Event Photos *
              <input type="file" hidden multiple name="eventPhotos" accept="image/jpeg, image/png" onChange={handleFileChange} />
            </Button>
            <Typography variant="caption" color={files.eventPhotos.length === 0 ? "error" : "textSecondary"}>
              {files.eventPhotos.length} files selected (Required)
            </Typography>
          </Grid>
          <Grid item size={{xs:12, md:4}}>
            <Button variant="contained" color="secondary" component="label" fullWidth>
              Event Report (.doc/x)
              <input type="file" hidden name="eventReport" accept=".doc, .docx" onChange={handleFileChange} />
            </Button>
            <Typography variant="caption">{files.eventReport ? files.eventReport.name : 'No file selected'}</Typography>
          </Grid>

          <Grid item size={{xs:12, md:12}}>
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Submit Event
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default EventForm;