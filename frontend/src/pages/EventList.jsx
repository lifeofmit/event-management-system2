import React, { useEffect, useState, useContext } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Button, Box, Chip, TextField, Grid, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { Download, Search, Clear, UploadFile } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import API, { BASE_URL } from '../services/api';

const EventList = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // NEW: State for the View Modal
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openView, setOpenView] = useState(false);

    // Upload Report Modal State
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadEventId, setUploadEventId] = useState(null);
    const [reportFile, setReportFile] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: '',
        eventType: ''
    });

    useEffect(() => {
        fetchEvents();
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const typeRes = await API.getActiveEventTypes();
            setEventTypes(typeRes.data);
        } catch (error) {
            console.error("Failed to load filter dropdowns");
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Pass the filters object to the API call
            const response = await API.getEvents(filters);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchEvents();
    };

    const clearFilters = () => {
        setFilters({ search: '', startDate: '', endDate: '', eventType: '' });
        // Fetch events without filters immediately
        setTimeout(() => applyFilters(), 0);
    };

    const handleExport = async (format) => {
        try {
            // Export respects the currently applied filters
            const response = await API.exportEvents(format, filters);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            let extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `Event_Report.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert('Export failed or unauthorized');
        }
    };

    const handleDownloadReport = (fileUrl) => {
        window.open(`${BASE_URL}${fileUrl}`, '_blank');
    };

    // NEW: Handlers for the View Button
    const handleViewClick = (event) => {
        setSelectedEvent(event);
        setOpenView(true);
    };

    const handleCloseView = () => {
        setOpenView(false);
        setSelectedEvent(null);
    };

    const handleOpenUpload = (eventId) => {
    setUploadEventId(eventId);
    setUploadOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile) return alert("Please select a file first");

    try {
      await API.uploadEventReport(uploadEventId, reportFile);
      setUploadOpen(false);
      setReportFile(null);
      fetchEvents(); // Refresh the table so the status changes to "Uploaded"
      alert("Report uploaded successfully!");
    } catch (error) {
      alert("Failed to upload report.");
    }
  };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Event Directory</Typography>
                {['SUPER_ADMIN', 'ADMIN'].includes(user?.role) && (
                    <Box>
                        <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }} onClick={() => handleExport('csv')}>CSV</Button>
                        <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }} color="success" onClick={() => handleExport('excel')}>Excel</Button>
                        <Button variant="outlined" startIcon={<Download />} color="error" onClick={() => handleExport('pdf')}>PDF</Button>
                    </Box>
                )}
            </Box>

            {/* --- Filter Bar --- */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item size={{xs:12, md:3}}>
                        <TextField fullWidth size="small" label="Search Event Name" name="search" value={filters.search} onChange={handleFilterChange} />
                    </Grid>
                    {/* <Grid item size={{xs:12, md:2}}>
                        <TextField fullWidth size="small" type="date" label="Start Date" name="startDate" InputLabelProps={{ shrink: true }} value={filters.startDate} onChange={handleFilterChange} />
                    </Grid>
                    <Grid item size={{xs:12, md:2}}>
                        <TextField fullWidth size="small" type="date" label="End Date" name="endDate" InputLabelProps={{ shrink: true }} value={filters.endDate} onChange={handleFilterChange} />
                    </Grid> */}
                    {/* Start Date Field */}
                    <Grid item xs={12} sm={2}>
                        <TextField 
                            fullWidth 
                            size="small" 
                            type="date" 
                            label="Start Date" 
                            name="startDate" 
                            InputLabelProps={{ shrink: true }} 
                            value={filters.startDate} 
                            onChange={handleFilterChange} 
                            sx={{
                            "& input::-webkit-datetime-edit": {
                                color: filters.startDate ? "inherit" : "transparent"
                            },
                            "& input:focus::-webkit-datetime-edit": {
                                color: "inherit"
                            }
                            }}
                        />
                    </Grid>

                    {/* End Date Field */}
                    <Grid item xs={12} sm={2}>
                        <TextField 
                            fullWidth 
                            size="small" 
                            type="date" 
                            label="End Date" 
                            name="endDate" 
                            InputLabelProps={{ shrink: true }} 
                            value={filters.endDate} 
                            onChange={handleFilterChange} 
                            sx={{
                            "& input::-webkit-datetime-edit": {
                                color: filters.endDate ? "inherit" : "transparent"
                            },
                            "& input:focus::-webkit-datetime-edit": {
                                color: "inherit"
                            }
                            }}
                        />
                    </Grid>
                    <Grid item size={{xs:12, md:3}}>
                        <TextField select fullWidth size="small" label="Event Category" name="eventType" value={filters.eventType} onChange={handleFilterChange}>
                            <MenuItem value="">All Categories</MenuItem>
                            {eventTypes.map((type) => (
                                <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item size={{xs:12, md:1}} sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="primary" onClick={applyFilters}><Search /></Button>
                        <Button variant="outlined" color="secondary" onClick={clearFilters}><Clear /></Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- Data Table --- */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Event Name</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Creator</strong></TableCell>
                            <TableCell><strong>Report Status</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center">Loading events...</TableCell></TableRow>
                        ) : events.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No events match your criteria.</TableCell></TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event._id} hover>
                                    <TableCell>{event.eventName}</TableCell>
                                    <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{event.eventType?.name || 'N/A'}</TableCell>
                                    {/* <TableCell>{event.coordinatorId?.name || 'N/A'}</TableCell> */}
                                    <TableCell>
                                        {event.createdBy?.name || 'Unknown User'} 
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            ({event.createdBy?.role?.replace('_', ' ') || 'N/A'})
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {event.eventReport ? (
                                            <Chip label="Uploaded" color="success" size="small" />
                                        ) : (
                                            <Chip label="Pending" color="warning" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ mr: 1 }} 
                                            onClick={() => handleViewClick(event)}
                                        >
                                            View
                                        </Button>
                                        
                                        {event.eventReport ? (
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="secondary" 
                                                onClick={() => handleDownloadReport(event.eventReport.fileUrl)}
                                            >
                                                Report
                                            </Button>
                                        ) : (
                                            /* FIXED: Now explicitly checks if the logged-in user's ID matches the event's creator ID */
                                            user?.id === (event.createdBy?._id || event.createdBy) && (
                                                <Button 
                                                    size="small" 
                                                    variant="contained" 
                                                    color="primary" 
                                                    onClick={() => handleOpenUpload(event._id)}
                                                >
                                                    Upload Report
                                                </Button>
                                            )
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* --- View Event Details Modal --- */}
            <Dialog open={openView} onClose={handleCloseView} maxWidth="md" fullWidth>
                {selectedEvent && (
                    <>
                        <DialogTitle sx={{ backgroundColor: '#f5f5f5' }}>
                            <Typography variant="h6">{selectedEvent.eventName}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                Submitted by {selectedEvent.coordinatorId?.name} | Dean: {selectedEvent.deanId?.name}
                            </Typography>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item size={{xs:12, md:3}}>
                                    <Typography variant="subtitle2" color="primary">Date</Typography>
                                    <Typography gutterBottom>{new Date(selectedEvent.eventDate).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item size={{xs:12, md:3}}>
                                    <Typography variant="subtitle2" color="primary">Event Type</Typography>
                                    <Typography gutterBottom>{selectedEvent.eventType?.name}</Typography>
                                </Grid>

                                <Grid item size={{xs:12, md:6}}>
                                    <Typography variant="subtitle2" color="primary">Objective</Typography>
                                    <Typography gutterBottom>{selectedEvent.objective}</Typography>
                                </Grid>

                                <Grid item size={{xs:12, md:12}}>
                                    <Typography variant="subtitle2" color="primary">Description</Typography>
                                    <Typography gutterBottom>{selectedEvent.description || 'No description provided.'}</Typography>
                                </Grid>

                                <Grid item size={{xs:12, md:4}}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" color="primary" gutterBottom>Location Details</Typography>
                                    <Typography gutterBottom>Lat: {selectedEvent.latitude || 'N/A'}, Long: {selectedEvent.longitude || 'N/A'}</Typography>
                                </Grid>

                                {/* Geo Photos Download & Preview Section */}
                                <Grid item size={{xs:12, md:4}}>
                                <Typography variant="subtitle2" color="primary" gutterBottom>Geo Location Photos</Typography>
                                {selectedEvent.geoLocationPhotos?.length > 0 ? (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedEvent.geoLocationPhotos.map((photo, index) => (
                                        <Box key={index} sx={{ textAlign: 'center' }}>
                                        {/* Clicking the image opens the full resolution version in a new tab */}
                                        <a href={`${BASE_URL}${photo.fileUrl}`} target="_blank" rel="noreferrer">
                                            <Box 
                                            component="img" 
                                            src={`${BASE_URL}${photo.fileUrl}`} 
                                            alt={`Geo ${index + 1}`}
                                            sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd', '&:hover': { opacity: 0.8 } }}
                                            />
                                        </a>
                                        </Box>
                                    ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">No Geo photos uploaded.</Typography>
                                )}
                                </Grid>

                                {/* Event Photos Download & Preview Section */}
                                <Grid item size={{xs:12, md:4}}>
                                <Typography variant="subtitle2" color="primary" gutterBottom>Event Photos</Typography>
                                {selectedEvent.eventPhotos?.length > 0 ? (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedEvent.eventPhotos.map((photo, index) => (
                                        <Box key={index} sx={{ textAlign: 'center' }}>
                                        <a href={`${BASE_URL}${photo.fileUrl}`} target="_blank" rel="noreferrer">
                                            <Box 
                                            component="img" 
                                            src={`${BASE_URL}${photo.fileUrl}`} 
                                            alt={`Event ${index + 1}`}
                                            sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd', '&:hover': { opacity: 0.8 } }}
                                            />
                                        </a>
                                        </Box>
                                    ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">No Event photos uploaded.</Typography>
                                )}
                                </Grid>

                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseView} variant="contained">Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* --- Upload Report Modal --- */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Upload Event Report</DialogTitle>
        <Box component="form" onSubmit={handleUploadSubmit}>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }} color="textSecondary">
              Upload the final post-event report document. Only .doc and .docx formats are accepted.
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ py: 2 }}>
              {reportFile ? reportFile.name : 'Select Document'}
              <input 
                type="file" 
                hidden 
                accept=".doc, .docx" 
                onChange={(e) => setReportFile(e.target.files[0])} 
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setUploadOpen(false); setReportFile(null); }}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={!reportFile}>
              Upload
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
        </Box>
    );
};

export default EventList;